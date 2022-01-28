import { ContentTypes, MIRO_WIDGETS_TYPES } from "./constants";
import { MiroButton, MiroContent, MiroImage, MiroText } from "./miro";
import { ContentId, ContentType } from "@botonic/plugin-contentful";
import { ManageContentful } from "@botonic/plugin-contentful/lib/contentful/manage";
import { generateRandomName } from "./utils/functional";
import { ContentFieldType } from "@botonic/plugin-contentful/lib/manage-cms/fields";
import * as contentful from "contentful";
import { MiroApiService } from "./miro-api-service";
import {
  renameRepeatedNames,
  getColorPerComponentObject,
  getComponentNames,
  getContentfulContents,
  getFlowContents,
  getMiroButtons,
  getMiroLinks,
  getMiroTexts,
  getSubflowConnectors,
  linkButtonsAndTextsNotLinkedDirectly,
  linkComponents,
  nameButtons,
  getMiroImages,
  nameContentsWithoutName,
  createPlaceHolderAsset,
} from "./utils/miro";

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

  const Images = await Miro.readWidgets(MIRO_WIDGETS_TYPES.IMAGE);

  const componentsColors = getColorPerComponentObject(
    MiroContents,
    MiroContentsLegend
  );
  const flowContents = getFlowContents(MiroContents, MiroContentsLegend);

  const miroImages = getMiroImages(Images);

  const miroTexts = getMiroTexts(flowContents, componentsColors.color);

  const miroButtons = getMiroButtons(
    flowContents,
    componentsColors,
    miroTexts,
    usingMiroLinks
  );

  const miroSubflowConnectors = getSubflowConnectors(
    flowContents,
    componentsColors.color
  );

  const miroComponentNames = getComponentNames(
    flowContents,
    componentsColors.color
  );

  const miroLinks = getMiroLinks(Links);

  let miroContents: MiroContent[] = (miroTexts as MiroContent[]).concat(
    miroButtons,
    miroSubflowConnectors,
    miroComponentNames,
    miroImages
  );

  linkComponents(miroContents, miroLinks, usingMiroLinks);

  linkButtonsAndTextsNotLinkedDirectly(miroContents);

  const contentfulContents = getContentfulContents(miroContents);

  nameContentsWithoutName(contentfulContents);

  nameButtons(contentfulContents);

  renameRepeatedNames(contentfulContents);

  return contentfulContents;
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

  const placeHolderAssetId = await createPlaceHolderAsset(
    manageContentful,
    manageContentfulContext
  );

  const newContent = flow.filter((content: MiroContent) => {
    return !actualContentfulEntries.includes(content.id);
  });

  for (const content of newContent) {
    const contentType = content.type as ContentType;
    try {
      await manageContentful.createContent(
        manageContentfulContext,
        contentType,
        content.id
      );
    } catch (e: any) {
      console.log(
        `🔴️ Error creating content with id ${content.id} of content type ${contentType}: `,
        e
      );
    }
  }

  for (const content of flow) {
    if (content.type === ContentTypes.CONTENTFUL_TEXT) {
      try {
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
            [ContentFieldType.BUTTONS_STYLE]: (content as MiroText)
              .buttonsStyle,
          }
        );
      } catch (e: any) {
        console.log(
          `🔴️ Error updatig content with id ${content.id} of content type text: `,
          e
        );
      }
    } else if (content.type === ContentTypes.CONTENTFUL_BUTTON) {
      try {
        await manageContentful.updateFields(
          manageContentfulContext,
          new ContentId(content.type as ContentType, content.id),
          {
            [ContentFieldType.NAME]:
              (content as MiroButton).name ??
              content.text ??
              generateRandomName(),
            [ContentFieldType.TEXT]: content.text,
            [ContentFieldType.TARGET]: (content as MiroButton).target?.id,
          }
        );
      } catch (e: any) {
        console.log(
          `🔴️ Error updating content with id ${content.id} of content type button: `,
          e
        );
      }
    } else if (content.type === ContentTypes.CONTENTFUL_IMAGE) {
      try {
        await manageContentful.updateFields(
          manageContentfulContext,
          new ContentId(content.type as ContentType, content.id),
          {
            [ContentFieldType.NAME]:
              (content as MiroImage).name ?? generateRandomName(),
            [ContentFieldType.FOLLOW_UP]: (content as MiroText | MiroImage)
              .followup?.id,
            [ContentFieldType.IMAGE]: "2XVNK7ZwLTmKZFiugUBuIU",
          }
        );
      } catch (e: any) {
        console.log(
          `🔴️ Error updatig content with id ${content.id} of content type text: `,
          e
        );
      }
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
    if (incorrectParams()) {
      showUsage();
    } else {
      console.log("📖️ Importing flow from Miro...");
      const usingMiroLinks = usingMiroLinksParam === "true" ? true : false;
      const flow = await readFlowFromMiro(
        miroBoardId,
        miroToken,
        usingMiroLinks
      );
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
    }
  } catch (e) {
    console.error(e);
  }
}

function incorrectParams(): boolean {
  return process.argv[2] == "--help";
}

function showUsage() {
  console.log(`USAGE`);
  console.log(
    `----------------------------------------------------------------------`
  );
  console.log("First param: Miro Board Id");
  console.log("Second param: Miro Access Token");
  console.log(
    "Third param: Using Miro Links? -> true if buttons are connected to texts through links instead of by position, otherwise false"
  );
  console.log("Fourth param: Contentful Space Id");
  console.log("Fifth param: Contentful Environment");
  console.log("Sixth param: Contentful Managament Token");
  console.log("Seventh param: Contentful Delivery Token");
  console.log("Eighth param: Contentful locale");
  console.log();
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}

void main();
