import { Y_MARGIN } from "./import-from-miro-to-contentful";
import { Coordinate } from "./miro";

export function processMiroText(miroText: string): string {
  miroText = removeTags(miroText);
  miroText = convertHtmlEncodedChars(miroText);
  return miroText;
}

export function generateRandomName(): string {
  return (Math.random() + 1).toString(36).substring(2);
}

export function elementNearToElement(
  subElement: Coordinate,
  element: Coordinate,
  xMargin: number,
  yMargin: number
): boolean {
  return (
    subElement.x <= element.x + xMargin &&
    subElement.x >= element.x - xMargin &&
    subElement.y <= element.y + yMargin + Y_MARGIN &&
    subElement.y >= element.y - yMargin - Y_MARGIN
  );
}

function removeTags(miroText: string): string {
  return miroText.replace(/(<([^>]+)>)/gi, "");
}

function convertHtmlEncodedChars(miroText: string): string {
  return miroText.replace(/&#(\d+);/g, function (match, dec) {
    return String.fromCharCode(dec);
  });
}
