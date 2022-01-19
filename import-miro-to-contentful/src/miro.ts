import { ContentTypes } from "./constants";

export type ContentType =
  | "button"
  | "text"
  | "payload"
  | "url"
  | "subflowConnector"
  | "startOfSubflowConnector";

export class Link {
  readonly start: string;
  readonly end: string;
  constructor(start: string, end: string) {
    this.start = start;
    this.end = end;
  }
}

export class MiroContent {
  readonly type: ContentType;
  readonly id: string;
  readonly text?: string;
  constructor(id: string, type: ContentType, text?: string) {
    this.type = type;
    this.id = id;
    this.text = text;
  }
}

export class MiroSubflowConnector extends MiroContent {
  connectsTo?: MiroContent;
  constructor(
    id: string,
    text: string,
    contentType: ContentType,
    connectsTo?: MiroContent
  ) {
    super(id, contentType, text);
    this.connectsTo = connectsTo;
  }
}

export class MiroButton extends MiroContent {
  target?: MiroText;
  readonly quickReply: boolean;
  constructor(id: string, text: string, quickReply: boolean) {
    super(id, ContentTypes.BUTTON, text);
    this.quickReply = quickReply;
  }
}

export type ButtonsStyle = "QuickReplies" | "Buttons";

export class MiroText extends MiroContent {
  buttons: MiroButton[];
  followup?: MiroText;
  buttonsStyle?: ButtonsStyle;
  constructor(id: string, text: string) {
    super(id, ContentTypes.TEXT, text);
    this.buttons = [];
  }
}

export function getContentById(
  contents: MiroContent[],
  id: string
): MiroContent {
  const content = contents.filter((content: MiroContent) => {
    return content.id === id;
  });
  return content[0];
}

export function getContentByText(
  contents: MiroContent[],
  text: string,
  contentType?: ContentType
): MiroContent {
  const content = contents.filter((content: MiroContent) => {
    return content.text === text && content.type === contentType;
  });
  return content[0];
}

export function isQuickReply(backgroundColor: string): boolean {
  return backgroundColor === "#12cdd4" ? true : false;
}
