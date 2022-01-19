import axios from "axios";
import { BUTTON_STYLES, ContentTypes, MIRO_CONTENT_TYPES } from "./constants";
import {
  getContentById,
  getContentByText,
  isQuickReply,
  Link,
  MiroButton,
  MiroContent,
  MiroSubflowConnector,
  MiroText,
} from "./miro";
import { Content, ContentId, ContentType } from "@botonic/plugin-contentful";
import { ManageContentful } from "@botonic/plugin-contentful/lib/contentful/manage";
import { generateRandomName, processMiroText } from "./utils";
import { ContentFieldType } from "@botonic/plugin-contentful/lib/manage-cms/fields";

if (process.argv.length < 8 || process.argv[2] == "--help") {
  console.log(`Usage: `);
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}

async function readFlowFromMiro(
  miroBoardId: string,
  miroToken: string,
  usingMiroLinks?: string
): Promise<MiroContent[]> {
  const miroUrl = `https://api.miro.com/v1/boards/${miroBoardId}=/widgets/`;

  const MiroContents = await axios({
    method: "get",
    url: miroUrl,
    headers: { Authorization: `Bearer ${miroToken}` },
    params: { widgetType: MIRO_CONTENT_TYPES.SHAPE },
  });

  const texts = MiroContents.data.data.filter((content: any) => {
    return content.style.backgroundColor === "#99caff";
  });
  const miroTexts = texts.map((text: any) => {
    return new MiroText(text.id, processMiroText(text.text));
  });
  const buttons = MiroContents.data.data.filter((content: any) => {
    return (
      content.style.backgroundColor === "#ffffffff" ||
      content.style.backgroundColor === "#12cdd4"
    );
  });
  const miroButtons = buttons.map((button: any) => {
    return new MiroButton(
      button.id,
      processMiroText(button.text),
      isQuickReply(button.style.backgroundColor)
    );
  });

  const subflowConnectors = MiroContents.data.data.filter((content: any) => {
    return (
      content.style.backgroundColor === "#9510ac" ||
      content.style.backgroundColor === "#e6e6e6"
    );
  });
  const miroSubflowConnectors = subflowConnectors.map(
    (subflowConnector: any) => {
      const contentType =
        subflowConnector.style.backgroundColor === "#9510ac"
          ? ContentTypes.START_OF_SUBFLOW_CONNECTOR
          : ContentTypes.SUBFLOW_CONNECTOR;
      return new MiroSubflowConnector(
        subflowConnector.id,
        processMiroText(subflowConnector.text),
        contentType
      );
    }
  );

  const Links = await axios({
    method: "get",
    url: miroUrl,
    headers: { Authorization: `Bearer ${miroToken}` },
    params: { widgetType: MIRO_CONTENT_TYPES.LINK },
  });

  const miroLinks = Links.data.data.map((link: any) => {
    return new Link(link.startWidget.id, link.endWidget.id);
  });

  let miroContents: MiroContent[] = miroTexts.concat(
    miroButtons,
    miroSubflowConnectors
  );

  miroLinks.forEach((link: Link) => {
    const origin = getContentById(miroContents, link.start);
    const end = getContentById(miroContents, link.end);

    if (origin && origin.type === ContentTypes.TEXT) {
      if (end && end.type === ContentTypes.TEXT) {
        (origin as MiroText).followup = end as MiroText;
      } else if (end && end.type === ContentTypes.BUTTON) {
        (origin as MiroText).buttons.push(end as MiroButton);
        if ((end as MiroButton).quickReply) {
          (origin as MiroText).buttonsStyle = BUTTON_STYLES.QUICK_REPLIES;
        } else {
          (origin as MiroText).buttonsStyle = BUTTON_STYLES.BUTTONS;
        }
      } else if (end && end.type === ContentTypes.SUBFLOW_CONNECTOR) {
        (end as MiroSubflowConnector).connectsTo = origin as MiroText;
      }
    } else if (origin && origin.type === ContentTypes.BUTTON) {
      if (end && end.type === ContentTypes.TEXT) {
        (origin as MiroButton).target = end as MiroText;
      } else if (end && end.type == ContentTypes.SUBFLOW_CONNECTOR) {
        (end as MiroSubflowConnector).connectsTo = origin as MiroButton;
      }
    } else if (
      origin &&
      origin.type == ContentTypes.START_OF_SUBFLOW_CONNECTOR
    ) {
      if (end && end.type === ContentTypes.TEXT) {
        (origin as MiroSubflowConnector).connectsTo = end as MiroText;
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

async function writeFlowToContentful(
  spaceId: string,
  env: string,
  contentfulToken: string,
  locale: string,
  flow: MiroContent[]
): Promise<void> {
  const manageContentful = new ManageContentful({
    accessToken: contentfulToken,
    environment: env,
    spaceId: spaceId,
  });

  const manageContentfulContext = {
    allowOverwrites: true,
    preview: false,
    locale: locale,
  };

  for (const content of flow) {
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
          [ContentFieldType.NAME]: generateRandomName(),
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
const usingMiroLinks = process.argv[4];
const spaceId = process.argv[5];
const env = process.argv[6];
const contentfulToken = process.argv[7];
const locale = process.argv[8];

async function main() {
  try {
    console.log("📖️ Importing flow from Miro...");
    const flow = await readFlowFromMiro(miroBoardId, miroToken, usingMiroLinks);
    console.log("✅️ Miro flow imported");
    console.log("🖊️ Writing Miro flow to Contentful...");
    await writeFlowToContentful(spaceId, env, contentfulToken, locale, flow);
    console.log("✅️ Miro Flow copied to Contentful");
  } catch (e) {}
}

void main();
