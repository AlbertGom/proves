export function generateRandomUUID(): string {
  let dt = new Date().getTime();
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
}

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
