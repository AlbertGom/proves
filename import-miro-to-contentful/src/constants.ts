import { ContentType, ButtonsStyle } from "./miro";

export const MIRO_WIDGETS_TYPES: Record<string, string> = {
  SHAPE: "shape",
  LINK: "line",
  FRAME: "frame",
};

export const ContentTypes: Record<string, ContentType> = {
  TEXT: "text",
  BUTTON: "button",
  QUICK_REPLY: "quick reply",
  PAYLOAD: "payload",
  URL: "url",
  SUBFLOW_CONNECTOR: "subflow connector",
  START_OF_SUBFLOW_CONNECTOR: "subflow start",
  COMPONENT_NAME: "text name",
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
