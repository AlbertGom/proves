export function processMiroText(miroText: string): string {
  miroText = removeTags(miroText);
  miroText = convertHtmlEncodedChars(miroText);
  return miroText;
}

export function generateRandomName(): string {
  return (Math.random() + 1).toString(36).substring(2);
}

function removeTags(miroText: string): string {
  return miroText.replace(/(<([^>]+)>)/gi, "");
}

function convertHtmlEncodedChars(miroText: string): string {
  return miroText.replace(/&#(\d+);/g, function (match, dec) {
    return String.fromCharCode(dec);
  });
}
