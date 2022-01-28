import axios from "axios";

export class MiroApiService {
  url: string;
  accessToken: string;

  constructor(accessToken: string, miroBoardId: string) {
    this.url = `https://api.miro.com/v1/boards/${miroBoardId}/widgets/`;
    this.accessToken = accessToken;
  }

  public async readWidgets(widgetType: string) {
    try {
      const miroWidgets = await axios({
        method: "get",
        url: this.url,
        headers: { Authorization: `Bearer ${this.accessToken}` },
        params: { widgetType },
      });
      return miroWidgets.data.data;
    } catch (e: any) {
      console.log(`🔴️ Error reading widgets of type ${widgetType}: `, e);
    }
  }
}

