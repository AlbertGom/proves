import { ContentType, ButtonsStyle } from "./miro";

export const MIRO_CONTENT_TYPES: Record<string, string> = {
  SHAPE: "shape",
  LINK: "line",
};

export const ContentTypes: Record<string, ContentType> = {
  TEXT: "text",
  BUTTON: "button",
  SUBFLOW_CONNECTOR: "subflowConnector",
  START_OF_SUBFLOW_CONNECTOR: "startOfSubflowConnector",
};

export const BUTTON_STYLES: Record<string, ButtonsStyle> = {
  QUICK_REPLIES: "QuickReplies",
  BUTTONS: "Buttons",
};
