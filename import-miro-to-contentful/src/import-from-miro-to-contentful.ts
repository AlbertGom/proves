import axios from "axios";
import { ContentTypes, MIRO_CONTENT_TYPES } from "./constants";
import {
  getContentById,
  isQuickReply,
  Link,
  MiroButton,
  MiroContent,
  MiroText,
} from "./miro";
import { ContentId, ContentType } from "@botonic/plugin-contentful";
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
      content.style.backgroundColor === "#e6e6e6" ||
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
  const MiroLinks = await axios({
    method: "get",
    url: miroUrl,
    headers: { Authorization: `Bearer ${miroToken}` },
    params: { widgetType: MIRO_CONTENT_TYPES.LINK },
  });

  const links = MiroLinks.data.data.map((link: any) => {
    return new Link(link.startWidget.id, link.endWidget.id);
  });

  const miroContents: MiroContent[] = miroTexts.concat(miroButtons);

  links.forEach((link: Link) => {
    const origin = getContentById(miroContents, link.start);
    const end = getContentById(miroContents, link.end);
    if (origin && origin.type === "text") {
      if (end && end.type === "text") {
        (origin as MiroText).followup = end as MiroText;
      } else if (end && end.type === "button") {
        (origin as MiroText).buttons.push(end as MiroButton);
        if ((end as MiroButton).quickReply) {
          (origin as MiroText).buttonsStyle = "QuickReplies";
        } else {
          (origin as MiroText).buttonsStyle = "Buttons";
        }
      }
    } else if (origin && origin.type === "button") {
      if (end && end.type === "text") {
        (origin as MiroButton).target = end as MiroText;
      }
    } else return;
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
    console.log("Importing flow from Miro...");
    const flow = await readFlowFromMiro(miroBoardId, miroToken, usingMiroLinks);
    console.log("Miro flow imported");
    console.log("Writing Miro flow to Contentful...");
    await writeFlowToContentful(spaceId, env, contentfulToken, locale, flow);
    console.log("Done");
  } catch (e) {}
}

void main();
