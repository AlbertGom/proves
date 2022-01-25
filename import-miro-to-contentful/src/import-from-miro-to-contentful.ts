import { BUTTON_STYLES, ContentTypes, MIRO_WIDGETS_TYPES } from "./constants";
import {
  ComponentName,
  getContentById,
  getContentByText,
  MiroButton,
  MiroContent,
  MiroSubflowConnector,
  MiroText,
  MiroLink,
} from "./miro";
import { ContentId, ContentType } from "@botonic/plugin-contentful";
import { ManageContentful } from "@botonic/plugin-contentful/lib/contentful/manage";
import { generateRandomName, elementNearToElement } from "./utils/functional";
import { ContentFieldType } from "@botonic/plugin-contentful/lib/manage-cms/fields";
import * as contentful from "contentful";
import { MiroApiService } from "./miro-api-service";
import {
  getColorPerComponentObject,
  getComponentNames,
  getFinalContents,
  getFlowContents,
  getMiroButtons,
  getMiroLinks,
  getMiroTexts,
  getSubflowConnectors,
  linkButtonsAndTextsNotLinkedDirectly,
  linkComponents,
  nameButtons,
  nameTextsWithoutName,
} from "./utils/miro";

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
  const Miro = new MiroApiService(miroToken, miroBoardId);

  const MiroContentsLegend = await Miro.readWidgets(MIRO_WIDGETS_TYPES.FRAME);

  const MiroContents = await Miro.readWidgets(MIRO_WIDGETS_TYPES.SHAPE);

  const Links = await Miro.readWidgets(MIRO_WIDGETS_TYPES.LINK);

  const COLOR_PER_COMPONENT = getColorPerComponentObject(
    MiroContents,
    MiroContentsLegend
  );

  const flowContents = getFlowContents(MiroContents, MiroContentsLegend);

  const miroTexts = getMiroTexts(flowContents, COLOR_PER_COMPONENT);

  const miroButtons = getMiroButtons(
    flowContents,
    COLOR_PER_COMPONENT,
    miroTexts,
    usingMiroLinks
  );

  const miroSubflowConnectors = getSubflowConnectors(
    flowContents,
    COLOR_PER_COMPONENT
  );

  const miroComponentNames = getComponentNames(
    flowContents,
    COLOR_PER_COMPONENT
  );

  const miroLinks = getMiroLinks(Links);

  let miroContents: MiroContent[] = (miroTexts as MiroContent[]).concat(
    miroButtons,
    miroSubflowConnectors,
    miroComponentNames
  );

  linkComponents(miroContents, miroLinks, usingMiroLinks);

  linkButtonsAndTextsNotLinkedDirectly(miroContents);

  nameTextsWithoutName(miroContents);

  nameButtons(miroContents);

  const finalContents = getFinalContents(miroContents);
  miroContents;

  return finalContents;
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
          [ContentFieldType.NAME]: (content as MiroButton).name ?? content.text,
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
    await writeFlowToContentful(
      spaceId,
      env,
      contentfulManageToken,
      contentfulDeliveryToken,
      locale,
      flow
    );
    console.log("✅️ Miro Flow copied to Contentful");
  } catch (e) {}
}

void main();
