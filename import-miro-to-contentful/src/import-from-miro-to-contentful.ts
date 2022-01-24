import axios from "axios";
import {
  BUTTON_STYLES,
  COLORS_PER_COMPONENT,
  ContentTypes,
  MIRO_CONTENT_TYPES,
} from "./constants";
import {
  ComponentName,
  Coordinate,
  getContentById,
  getContentByText,
  isQuickReply,
  Link,
  MiroButton,
  MiroContent,
  MiroSubflowConnector,
  MiroText,
} from "./miro";
import { ContentId, ContentType } from "@botonic/plugin-contentful";
import { ManageContentful } from "@botonic/plugin-contentful/lib/contentful/manage";
import {
  generateRandomName,
  processMiroText,
  elementNearToElement,
} from "./utils";
import { ContentFieldType } from "@botonic/plugin-contentful/lib/manage-cms/fields";
import * as contentful from "contentful";

if (process.argv.length < 9 || process.argv[2] == "--help") {
  console.log(`Usage: `);
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}

export const X_MARGIN = 50;
export const Y_MARGIN = 30;

async function readFlowFromMiro(
  miroBoardId: string,
  miroToken: string,
  usingMiroLinks: boolean
): Promise<MiroContent[]> {
  const miroUrl = `https://api.miro.com/v1/boards/${miroBoardId}=/widgets/`;

  const MiroContentsLegend = await axios({
    method: "get",
    url: miroUrl,
    headers: { Authorization: `Bearer ${miroToken}` },
    params: { widgetType: MIRO_CONTENT_TYPES.FRAME },
  });

  const miroContentsLegendIds = MiroContentsLegend.data.data.map(
    (miroContentLegend: any) => {
      return miroContentLegend.id;
    }
  );

  const MiroContents = await axios({
    method: "get",
    url: miroUrl,
    headers: { Authorization: `Bearer ${miroToken}` },
    params: { widgetType: MIRO_CONTENT_TYPES.SHAPE },
  });

  const texts = MiroContents.data.data.filter((content: any) => {
    return content.style.backgroundColor === COLORS_PER_COMPONENT.TEXT;
  });
  const miroTexts = texts.map((text: any) => {
    return new MiroText(
      text.id,
      processMiroText(text.text),
      new Coordinate(text.x, text.y),
      text.height
    );
  });
  const buttons = MiroContents.data.data.filter((content: any) => {
    return (
      content.style.backgroundColor === COLORS_PER_COMPONENT.BUTTON ||
      content.style.backgroundColor === COLORS_PER_COMPONENT.QUICK_REPLY
    );
  });
  const miroButtons = buttons.map((button: any) => {
    return new MiroButton(
      button.id,
      processMiroText(button.text),
      isQuickReply(button.style.backgroundColor),
      new Coordinate(button.x, button.y),
      button.height
    );
  });

  const subflowConnectors = MiroContents.data.data.filter((content: any) => {
    return (
      content.style.backgroundColor ===
        COLORS_PER_COMPONENT.SUBFLOW_CONNECTOR ||
      content.style.backgroundColor ===
        COLORS_PER_COMPONENT.START_OF_SUBFLOW_CONNECTOR
    );
  });
  const miroSubflowConnectors = subflowConnectors.map(
    (subflowConnector: any) => {
      const contentType =
        subflowConnector.style.backgroundColor ===
        COLORS_PER_COMPONENT.START_OF_SUBFLOW_CONNECTOR
          ? ContentTypes.START_OF_SUBFLOW_CONNECTOR
          : ContentTypes.SUBFLOW_CONNECTOR;
      return new MiroSubflowConnector(
        subflowConnector.id,
        processMiroText(subflowConnector.text),
        contentType
      );
    }
  );

  const componentNames = MiroContents.data.data.filter((content: any) => {
    return (
      content.style.backgroundColor === COLORS_PER_COMPONENT.COMPONENT_NAME
    );
  });

  const miroComponentNames = componentNames.map((componentName: any) => {
    return new ComponentName(
      componentName.id,
      processMiroText(componentName.text)
    );
  });

  const Links = await axios({
    method: "get",
    url: miroUrl,
    headers: { Authorization: `Bearer ${miroToken}` },
    params: { widgetType: MIRO_CONTENT_TYPES.LINK },
  });

  const miroLinks = Links.data.data.map((link: any) => {
    return new Link(link.startWidget.id, link.endWidget.id);
  });

  if (!usingMiroLinks) {
    miroTexts.forEach((miroText: MiroText) => {
      miroButtons.forEach((miroButton: MiroButton) => {
        if (
          elementNearToElement(
            miroButton.coordinates,
            miroText.coordinates,
            X_MARGIN,
            miroText.textHeight
          )
        ) {
          miroButton.belongsTo = miroText;
          miroText.buttonsStyle = miroButton.quickReply
            ? BUTTON_STYLES.QUICK_REPLIES
            : BUTTON_STYLES.BUTTONS;
        }
      });
    });

    miroButtons.forEach((miroButton: MiroButton) => {
      miroButtons.forEach((miroButtonSubElement: MiroButton) => {
        if (
          elementNearToElement(
            miroButtonSubElement.coordinates,
            miroButton.coordinates,
            X_MARGIN,
            miroButton.textHeight
          )
        ) {
          if (miroButton.belongsTo) {
            miroButtonSubElement.belongsTo = miroButton.belongsTo;
          }
        }
      });
    });
  }

  miroButtons.forEach((miroButton: MiroButton) => {
    const miroText = getContentById(miroTexts, miroButton.belongsTo.id);
    (miroText as MiroText).buttons.push(miroButton);
  });

  let miroContents: MiroContent[] = miroTexts.concat(
    miroButtons,
    miroSubflowConnectors,
    miroComponentNames
  );

  miroLinks.forEach((link: Link) => {
    const origin = getContentById(miroContents, link.start);
    const end = getContentById(miroContents, link.end);

    if (origin && origin.type === ContentTypes.TEXT) {
      if (end && end.type === ContentTypes.TEXT) {
        (origin as MiroText).followup = end as MiroText;
      } else if (end && end.type === ContentTypes.BUTTON) {
        if (usingMiroLinks) {
          (origin as MiroText).buttons.push(end as MiroButton);
          if ((end as MiroButton).quickReply) {
            (origin as MiroText).buttonsStyle = BUTTON_STYLES.QUICK_REPLIES;
          } else {
            (origin as MiroText).buttonsStyle = BUTTON_STYLES.BUTTONS;
          }
        }
      } else if (end && end.type === ContentTypes.SUBFLOW_CONNECTOR) {
        (end as MiroSubflowConnector).connectsTo = origin as MiroText;
      }
    } else if (origin && origin.type === ContentTypes.BUTTON) {
      if (end && end.type === ContentTypes.TEXT) {
        (origin as MiroButton).target = end as MiroText;
      } else if (end && end.type === ContentTypes.SUBFLOW_CONNECTOR) {
        (end as MiroSubflowConnector).connectsTo = origin as MiroButton;
      } else if (end && end.type === ContentTypes.COMPONENT_NAME) {
        (end as ComponentName).referencedBy = origin as MiroButton;
      }
    } else if (
      origin &&
      origin.type == ContentTypes.START_OF_SUBFLOW_CONNECTOR
    ) {
      if (end && end.type === ContentTypes.TEXT) {
        (origin as MiroSubflowConnector).connectsTo = end as MiroText;
      }
    } else if (origin && origin.type === ContentTypes.COMPONENT_NAME) {
      if (end && end.type === ContentTypes.TEXT) {
        (origin as ComponentName).references = end as MiroText;
        (end as MiroText).name = origin.text;
      }
    } else return;
  });

  miroContents.forEach((miroContent: MiroContent) => {
    if (miroContent.type === ContentTypes.SUBFLOW_CONNECTOR) {
      const startOfSubflow = getContentByText(
        miroContents,
        miroContent.text,
        ContentTypes.START_OF_SUBFLOW_CONNECTOR
      );
      if (!startOfSubflow) {
        return;
      }
      const origin = getContentById(
        miroContents,
        (miroContent as MiroSubflowConnector).connectsTo.id
      );
      const end = getContentById(
        miroContents,
        (startOfSubflow as MiroSubflowConnector).connectsTo.id
      );
      if (origin.type === ContentTypes.BUTTON) {
        (origin as MiroButton).target = end as MiroText;
      } else if (origin.type === ContentTypes.TEXT) {
        (origin as MiroText).followup = end as MiroText;
      }
    } else if (miroContent.type === ContentTypes.COMPONENT_NAME) {
      if ((miroContent as ComponentName).referencedBy) {
        const button = getContentById(
          miroContents,
          (miroContent as ComponentName).referencedBy.id
        );
        const text = getContentById(
          miroContents,
          (miroContent as ComponentName).references.id
        );
        if (button && text) {
          (button as MiroButton).target = text as MiroText;
        }
      }
    }
  });

  const textsWithNames = miroContents.filter((miroContent: MiroContent) => {
    return (
      miroContent.type === ContentTypes.TEXT && (miroContent as MiroText).name
    );
  });

  textsWithNames.forEach((textWithName: MiroText) => {
    nameFollowups(textWithName, 1, textWithName.name);
  });

  const textsWithButtons = miroContents.filter((miroContent: MiroContent) => {
    return (
      miroContent.type === ContentTypes.TEXT &&
      (miroContent as MiroText).buttons.length
    );
  });

  textsWithButtons.forEach((textWithButtons: MiroText) => {
    if (textWithButtons.name) {
      textWithButtons.buttons.forEach((button: MiroButton, index: number) => {
        const treeLevel = parseInt(textWithButtons.name.split(" ")[0]);
        button.name = !Number.isNaN(treeLevel)
          ? `${treeLevel}.${index + 1} ${button.text}`
          : `${textWithButtons.name} button_${index + 1}`;
      });
    }
  });

  miroContents = miroContents.filter((miroContent: MiroContent) => {
    return (
      miroContent.type === ContentTypes.BUTTON ||
      miroContent.type === ContentTypes.TEXT
    );
  });

  return miroContents;
}

function nameFollowups(
  miroText: MiroText,
  index: number,
  baseName: string
): void {
  if (!miroText.followup) return;
  miroText.followup.name = `${baseName} Followup ${index}`;
  nameFollowups(miroText.followup, index + 1, baseName);
}

async function writeFlowToContentful(
  spaceId: string,
  env: string,
  contentfulManageToken: string,
  contentfulDeliveryToken: string,
  locale: string,
  flow: MiroContent[]
): Promise<void> {
  const manageContentful = new ManageContentful({
    accessToken: contentfulManageToken,
    environment: env,
    spaceId: spaceId,
  });

  const Contentful = contentful.createClient({
    space: spaceId,
    accessToken: contentfulDeliveryToken,
    environment: env,
  });

  const actualContentfulEntries = (await Contentful.getEntries()).items.map(
    (entry: any) => {
      return entry.sys.id;
    }
  );

  const manageContentfulContext = {
    allowOverwrites: true,
    preview: false,
    locale: locale,
  };

  const newContent = flow.filter((content: MiroContent) => {
    return !actualContentfulEntries.includes(content.id);
  });

  for (const content of newContent) {
    const contentType = content.type as ContentType;
    await manageContentful.createContent(
      manageContentfulContext,
      contentType,
      content.id
    );
  }

  for (const content of flow) {
    if (content.type === ContentTypes.TEXT) {
      await manageContentful.updateFields(
        manageContentfulContext,
        new ContentId(content.type as ContentType, content.id),
        {
          [ContentFieldType.NAME]:
            (content as MiroText).name ?? generateRandomName(),
          [ContentFieldType.TEXT]: content.text,
          [ContentFieldType.BUTTONS]: (content as MiroText).buttons.map(
            (button: MiroButton) => {
              return button.id;
            }
          ),
          [ContentFieldType.FOLLOW_UP]: (content as MiroText).followup?.id,
          [ContentFieldType.BUTTONS_STYLE]: (content as MiroText).buttonsStyle,
        }
      );
    } else if (content.type === ContentTypes.BUTTON) {
      await manageContentful.updateFields(
        manageContentfulContext,
        new ContentId(content.type as ContentType, content.id),
        {
          [ContentFieldType.NAME]: generateRandomName(),
          [ContentFieldType.TEXT]: content.text,
          [ContentFieldType.TARGET]: (content as MiroButton).target?.id,
        }
      );
    }
  }
}

const miroBoardId = process.argv[2];
const miroToken = process.argv[3];
const usingMiroLinksParam = process.argv[4];
const spaceId = process.argv[5];
const env = process.argv[6];
const contentfulManageToken = process.argv[7];
const contentfulDeliveryToken = process.argv[8];
const locale = process.argv[9];

async function main() {
  try {
    console.log("📖️ Importing flow from Miro...");
    const usingMiroLinks = usingMiroLinksParam === "true" ? true : false;
    const flow = await readFlowFromMiro(miroBoardId, miroToken, usingMiroLinks);
    console.log("✅️ Miro flow imported");
    console.log("🖊️ Writing Miro flow to Contentful...");
    // await writeFlowToContentful(
    //   spaceId,
    //   env,
    //   contentfulManageToken,
    //   contentfulDeliveryToken,
    //   locale,
    //   flow
    // );
    console.log("✅️ Miro Flow copied to Contentful");
  } catch (e) {}
}

void main();
