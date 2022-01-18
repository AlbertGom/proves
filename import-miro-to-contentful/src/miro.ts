export type MiroContentType = "button" | "text" | "payload";

export class Link {
  readonly start: string;
  readonly end: string;
  constructor(start: string, end: string) {
    this.start = start;
    this.end = end;
  }
}

export class MiroContent {
  readonly type: MiroContentType;
  id: string;
  readonly text: string;
  constructor(id: string, text: string, type: MiroContentType) {
    this.type = type;
    this.id = id;
    this.text = text;
  }
}

export class MiroButton extends MiroContent {
  target?: MiroText;
  readonly quickReply: boolean;
  constructor(id: string, text: string, quickReply: boolean) {
    super(id, text, "button");
    this.quickReply = quickReply;
  }
}

type ButtonsStyle = "QuickReplies" | "Buttons";

export class MiroText extends MiroContent {
  buttons: MiroButton[];
  followup?: MiroText;
  buttonsStyle?: ButtonsStyle;
  constructor(id: string, text: string) {
    super(id, text, "text");
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

export function isQuickReply(backgroundColor: string): boolean {
  return backgroundColor === "#12cdd4" ? true : false;
}
