import { ContentType, ButtonsStyle } from "./miro";

export const MIRO_WIDGETS_TYPES: Record<string, string> = {
  SHAPE: "shape",
  LINK: "line",
  FRAME: "frame",
};

export const ContentTypes: Record<string, ContentType> = {
  TEXT: "conversationalappmessage",
  BUTTON: "button",
  QUICK_REPLY: "quickreply",
  PAYLOAD: "payload",
  URL: "url",
  SUBFLOW_CONNECTOR: "link to [flow name]",
  START_OF_SUBFLOW_CONNECTOR: "[flow name]",
  COMPONENT_NAME: "textname",
  USER_INPUT: "userinput_textname",
  CONTENTFUL_TEXT: "text",
  CONTENTFUL_BUTTON: "button",
};

export const BUTTON_STYLES: Record<string, ButtonsStyle> = {
  QUICK_REPLIES: "QuickReplies",
  BUTTONS: "Buttons",
};

//temporal, we will read these color components from a frame placed in the miro board
export const COLORS_PER_COMPONENT = {
  BUTTON: "#ffffffff",
  QUICK_REPLY: "#12cdd4",
  TEXT: "#99caff",
  PAYLOAD: "",
  URL: "",
  SUBFLOW_CONNECTOR: "#e6e6e6",
  START_OF_SUBFLOW_CONNECTOR: "#9510ac",
  COMPONENT_NAME: "#cee741",
};

export const TREE_LEVEL_REGEX = /^[\d.]+$/;
