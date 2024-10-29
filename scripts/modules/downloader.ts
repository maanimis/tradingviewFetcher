import { createResult } from "./utils";

interface DownloadOptions {
  text: string;
  name?: string;
  ext?: string;
  setTimestamp?: boolean;
}

export const downloadResult = async ({
  text,
  name = "",
  ext = "pine",
  setTimestamp = true,
}: DownloadOptions): Promise<any> => {
  if (setTimestamp) name += `-${Date.now()}`;
  const data = new Blob([text], { type: "text/plain" });
  const url = window.URL.createObjectURL(data);

  const link = document.createElement("a");
  link.download = `${name}.${ext}`;
  link.href = url;
  link.click();
  return createResult({ success: true, msg: "downloadResult", data: { name } });
};
