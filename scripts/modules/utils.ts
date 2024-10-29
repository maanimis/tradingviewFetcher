import type { ResultData } from "./types";

export const parseHtml = (htmlString: string): Document => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  return doc;
};

export const delay = (ms: number): Promise<void> =>
  new Promise((res) => setTimeout(res, ms));

export const createResult = (resultData: ResultData): any => ({
  success: resultData.success,
  msg: resultData.msg,
  data: resultData.data,
});
