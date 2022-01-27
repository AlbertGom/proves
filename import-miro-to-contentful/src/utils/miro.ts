import { X_MARGIN } from "../import-from-miro-to-contentful";
import { BUTTON_STYLES, ContentTypes, TREE_LEVEL_REGEX } from "../constants";
import {
  MiroText,
  MiroContent,
  Coordinate,
  MiroButton,
  isQuickReply,
  MiroSubflowConnector,
  ComponentName,
  MiroLink,
  getContentById,
  getContentByText,
} from "../miro";
import {
  elementNearToElement,
  generateRandomName,
  processMiroText,
} from "./functional";

export type ComponentColors = { color: Object; borderColor: Object };

export function getColorPerComponentObject(
  MiroContents: any,
  MiroContentsLegend: any
): ComponentColors {
  const miroContentsLegendIds = getLegendContentsId(MiroContentsLegend);

  const legendContents = MiroContents.filter((MiroContent: any) => {
    return miroContentsLegendIds.includes(MiroContent.id);
  });

  const COLOR_PER_COMPONENT = {};
  const BORDER_COLOR_PER_COMPONENT = {};

  legendContents.forEach((legendContent: any) => {
    const componentName = processMiroText(legendContent.text)
      .trim()
      .toLowerCase();
    COLOR_PER_COMPONENT[componentName] = legendContent.style.backgroundColor;
    BORDER_COLOR_PER_COMPONENT[componentName] = legendContent.style.borderColor;
  });
  return {
    color: COLOR_PER_COMPONENT,
    borderColor: BORDER_COLOR_PER_COMPONENT,
  };
}

export function getFlowContents(MiroContents: any, MiroContentsLegend: any) {
  const flowContents = MiroContents.filter((MiroContent: any) => {
    return !getLegendContentsId(MiroContentsLegend).includes(MiroContent.id);
  });
  return flowContents;
}

export function getLegendContentsId(MiroContentsLegend: any) {
  const miroContentsLegendIds = MiroContentsLegend[0].children.map(
    (miroContentLegendId: any) => {
      return miroContentLegendId;
    }
  );
  return miroContentsLegendIds;
}

export function getMiroTexts(
  flowContents: any,
  COLOR_PER_COMPONENT: Object
): MiroText[] {
  const texts = flowContents.filter((content: any) => {
    return (
      content.style.backgroundColor === COLOR_PER_COMPONENT[ContentTypes.TEXT]
    );
  });

  const miroTexts = texts.map((text: any) => {
    return new MiroText(
      text.id,
      processMiroText(text.text),
      new Coordinate(text.x, text.y),
      text.height
    );
  });
  return miroTexts;
}

export function getMiroButtons(
  flowContents: any,
  componentColors: ComponentColors,
  miroTexts: MiroText[],
  usingMiroLinks: boolean
): MiroButton[] {
  const buttons = flowContents.filter((content: any) => {
    return (
      ((content.style.backgroundColor ===
        componentColors.color[ContentTypes.BUTTON] ||
        content.style.backgroundColor ===
          componentColors.color[ContentTypes.QUICK_REPLY]) &&
        content.style.borderColor ===
          componentColors.borderColor[ContentTypes.BUTTON]) ||
      content.style.borderColor ===
        componentColors.borderColor[ContentTypes.QUICK_REPLY]
    );
  });
  const miroButtons = buttons.map((button: any) => {
    return new MiroButton(
      button.id,
      processMiroText(button.text),
      isQuickReply(
        button.style.borderColor,
        componentColors.borderColor[ContentTypes.QUICK_REPLY]
      ),
      new Coordinate(button.x, button.y),
      button.height
    );
  });

  if (!usingMiroLinks) {
    setButtonsByPosition(miroTexts, miroButtons);
  }

  return miroButtons;
}

function setButtonsByPosition(
  miroTexts: MiroText[],
  miroButtons: MiroButton[]
) {
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
  miroButtons.forEach((miroButton: MiroButton) => {
    const miroText = getContentById(miroTexts, miroButton.belongsTo.id);
    (miroText as MiroText).buttons.push(miroButton);
  });
}

export function getSubflowConnectors(
  flowContents: any,
  COLOR_PER_COMPONENT: Object
): MiroContent[] {
  const subflowConnectors = flowContents.filter((content: any) => {
    return (
      content.style.backgroundColor ===
        COLOR_PER_COMPONENT[ContentTypes.SUBFLOW_CONNECTOR] ||
      content.style.backgroundColor ===
        COLOR_PER_COMPONENT[ContentTypes.START_OF_SUBFLOW_CONNECTOR]
    );
  });
  const miroSubflowConnectors = subflowConnectors.map(
    (subflowConnector: any) => {
      const contentType =
        subflowConnector.style.backgroundColor ===
        COLOR_PER_COMPONENT[ContentTypes.START_OF_SUBFLOW_CONNECTOR]
          ? ContentTypes.START_OF_SUBFLOW_CONNECTOR
          : ContentTypes.SUBFLOW_CONNECTOR;
      return new MiroSubflowConnector(
        subflowConnector.id,
        processMiroText(subflowConnector.text.replace("Link to ", "")),
        contentType
      );
    }
  );
  return miroSubflowConnectors;
}

export function getComponentNames(
  flowContents: any,
  COLOR_PER_COMPONENT: Object
) {
  const componentNames = flowContents.filter((content: any) => {
    return (
      content.style.backgroundColor ===
        COLOR_PER_COMPONENT[ContentTypes.COMPONENT_NAME] ||
      content.style.backgroundColor ===
        COLOR_PER_COMPONENT[ContentTypes.USER_INPUT]
    );
  });

  const miroComponentNames = componentNames.map((componentName: any) => {
    return new ComponentName(
      componentName.id,
      processMiroText(componentName.text)
    );
  });
  return miroComponentNames;
}

export function getMiroLinks(Links: any): MiroLink[] {
  const miroLinks = Links.map((link: any) => {
    return new MiroLink(link.startWidget.id, link.endWidget.id);
  });
  return miroLinks;
}

export function linkComponents(
  miroContents: MiroContent[],
  miroLinks: MiroLink[],
  usingMiroLinks: boolean
): void {
  miroLinks.forEach((link: MiroLink) => {
    const origin = getContentById(miroContents, link.start);
    const end = getContentById(miroContents, link.end);

    if (origin && origin.type === ContentTypes.CONTENTFUL_TEXT) {
      if (end && end.type === ContentTypes.CONTENTFUL_TEXT) {
        (origin as MiroText).followup = end as MiroText;
      } else if (end && end.type === ContentTypes.CONTENTFUL_BUTTON) {
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
    } else if (origin && origin.type === ContentTypes.CONTENTFUL_BUTTON) {
      if (end && end.type === ContentTypes.CONTENTFUL_TEXT) {
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
      if (end && end.type === ContentTypes.CONTENTFUL_TEXT) {
        (origin as MiroSubflowConnector).connectsTo = end as MiroText;
        (end as MiroText).name = origin.text;
      }
    } else if (origin && origin.type === ContentTypes.COMPONENT_NAME) {
      if (end && end.type === ContentTypes.CONTENTFUL_TEXT) {
        (origin as ComponentName).references = end as MiroText;
        (end as MiroText).name = origin.text;
      }
    } else return;
  });
}

export function linkButtonsAndTextsNotLinkedDirectly(
  miroContents: MiroContent[]
) {
  miroContents.forEach((miroContent: MiroContent) => {
    if (miroContent.type === ContentTypes.SUBFLOW_CONNECTOR) {
      const startOfSubflow = getContentByText(
        miroContents,
        miroContent.text,
        ContentTypes.START_OF_SUBFLOW_CONNECTOR
      );

      const origin = getContentById(
        miroContents,
        (miroContent as MiroSubflowConnector)?.connectsTo?.id
      );
      const end = getContentById(
        miroContents,
        (startOfSubflow as MiroSubflowConnector)?.connectsTo?.id
      );
      if (origin?.type === ContentTypes.CONTENTFUL_BUTTON) {
        (origin as MiroButton).target = end as MiroText;
      } else if (origin?.type === ContentTypes.CONTENTFUL_TEXT) {
        (origin as MiroText).followup = end as MiroText;
      }
    } else if (miroContent.type === ContentTypes.COMPONENT_NAME) {
      if ((miroContent as ComponentName)?.referencedBy) {
        const button = getContentById(
          miroContents,
          (miroContent as ComponentName)?.referencedBy?.id
        );
        const text = getContentById(
          miroContents,
          (miroContent as ComponentName)?.references?.id
        );
        if (button && text) {
          (button as MiroButton).target = text as MiroText;
        }
      }
    }
  });
}

export function nameTextsWithoutName(miroContents: MiroContent[]) {
  const miroTexts = miroContents.filter((miroContent: MiroContent) => {
    return miroContent.type === ContentTypes.CONTENTFUL_TEXT;
  });

  miroTexts.forEach((miroText: MiroText) => {
    if (!miroText.name && !isFollowup(miroTexts as MiroText[], miroText)) {
      miroText.name = generateRandomName();
    }
    nameFollowups(miroText, 1, miroText.name);
  });
}

function isFollowup(miroTexts: MiroText[], miroText: MiroText): boolean {
  const followUpTextsIds = miroTexts.map((miroText: MiroText) => {
    if (miroText.followup) {
      return miroText.followup.id;
    }
  });
  return followUpTextsIds.includes(miroText.id);
}

function nameFollowups(
  miroText: MiroText,
  index: number,
  baseName: string
): void {
  if (!miroText.followup) return;
  if (miroText.followup.name) return;
  miroText.followup.name = `${baseName} FU_${index}`;
  nameFollowups(miroText.followup, index + 1, baseName);
}

export function nameButtons(miroContents: MiroContent[]) {
  const textsWithButtons = miroContents.filter((miroContent: MiroContent) => {
    return (
      miroContent.type === ContentTypes.CONTENTFUL_TEXT &&
      (miroContent as MiroText).buttons.length
    );
  });

  textsWithButtons.forEach((textWithButtons: MiroText) => {
    if (textWithButtons.name) {
      textWithButtons.buttons.forEach((button: MiroButton, index: number) => {
        let treeLevel = textWithButtons.name.split(" ")[0];
        treeLevel = addDotIfNecessary(treeLevel);
        button.name = isTreeLevel(treeLevel)
          ? `${treeLevel}${index + 1} ${button.text}`
          : `${index + 1}. ${button.text}`;
      });
    }
  });
}

function addDotIfNecessary(text: string) {
  if (text[text.length - 1] != ".") {
    text = text + ".";
  }
  return text;
}

function isTreeLevel(treeLevel: string): boolean {
  return TREE_LEVEL_REGEX.test(treeLevel);
}

export function getContentfulContents(miroContents: MiroContent[]): MiroContent[] {
  const finalMiroContents = miroContents.filter((miroContent: MiroContent) => {
    return (
      miroContent.type === ContentTypes.CONTENTFUL_BUTTON ||
      miroContent.type === ContentTypes.CONTENTFUL_TEXT
    );
  });
  return finalMiroContents;
}

export function renameRepeatedNames(contents: MiroContent[]) {
  const buttons = contents.filter((content: MiroContent) => {
    return content.type === ContentTypes.CONTENTFUL_BUTTON;
  });

  const texts = contents.filter((content: MiroContent) => {
    return content.type === ContentTypes.CONTENTFUL_TEXT;
  });

  buttons.forEach((button: MiroButton) => {
    const ids = getContentsWithRepeatedNames(buttons, button.name, button.id);
    ids.forEach((id: string, index: number) => {
      const button = getContentById(buttons, id);
      (button as MiroButton).name = `${(button as MiroButton).name} ${
        index + 2
      }`;
    });
  });

  texts.forEach((text: MiroText) => {
    const ids = getContentsWithRepeatedNames(texts, text.name, text.id);
    ids.forEach((id: string, index: number) => {
      const text = getContentById(texts, id);
      (text as MiroText).name = `${(text as MiroText).name} ${index + 2}`;
    });
  });
}

function getContentsWithRepeatedNames(
  contents: MiroContent[],
  contentName: string,
  contentId: string
): string[] {
  let ids = [];
  contents.forEach((content: MiroContent) => {
    if (
      contentName === (content as MiroText | MiroButton).name &&
      contentId != content.id
    ) {
      ids.push(content.id);
    }
  });
  return ids;
}
