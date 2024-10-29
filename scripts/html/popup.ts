import { requestFetch } from "../modules/api";
import * as util from "../modules/utils";

const target = {
  tradingview: "https://www.tradingview.com/robots.txt",
  base: "https://www.tradingview.com/script",
  baseCode: "https://pine-facade.tradingview.com/",
  sourceCode:
    "https://pine-facade.tradingview.com/pine-facade/get/%ID%/1?no_4xx=true",
};

async function fetchHandler(): Promise<void> {
  const urls: string[] = (
    document.getElementById("urls") as HTMLTextAreaElement
  ).value
    .split("\n")
    .map((url) => url.trim());
  const validUrls: string[] = urls.filter((url) => url.startsWith(target.base));

  if (!validUrls.length) {
    const msg = "No valid URLs found.";
    (document.getElementById("status") as HTMLElement).textContent = msg;
    return util.createResult({ success: false, msg });
  }

  const totalRequests: number = validUrls.length;
  const statusElement: HTMLElement = document.getElementById("status")!;
  const progressBar: HTMLProgressElement = document.getElementById(
    "progress"
  ) as HTMLProgressElement;

  statusElement.textContent = "Fetching data...";
  progressBar.value = 0; // Reset progress bar

  const fetchAllData = async (): Promise<
    Array<{ success: boolean; url: string; data?: any; error?: string }>
  > => {
    const responses: Array<{
      success: boolean;
      url: string;
      data?: any;
      error?: string;
    }> = [];
    let completedRequests = 0;

    for (const url of validUrls) {
      statusElement.textContent = url;
      await util.delay(500);
      try {
        const data = await requestFetch(url);
        if (data) {
          responses.push({ success: true, url, data });
        } else {
          responses.push({ success: false, url, error: "No data" });
        }
      } catch (error) {
        responses.push({
          success: false,
          url,
          error: (error as Error).message,
        });
      }
      completedRequests++;
      const progress = Math.round((completedRequests / totalRequests) * 100);
      progressBar.value = progress;
    }

    statusElement.textContent = "Downloading...!";

    return responses;
  };

  const currentTabID = await new Promise<number>((res, rej) => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      (tabs: chrome.tabs.Tab[]) => {
        if (tabs.length) {
          const tabId = tabs[0].id;
          if (tabId !== undefined) {
            chrome.tabs.update(tabId, { url: target.tradingview });
            res(tabId);
          }
        } else {
          console.error("No active tabs found.");
          rej();
        }
      }
    );
  });

  const allData = await fetchAllData();

  await chrome.storage.local.set({ _mySecretData: allData }, () => {
    console.log("Data saved:", allData);
    console.log("Data saved locally");
  });

  chrome.tabs.query(
    { active: true, currentWindow: true },
    (tabs: chrome.tabs.Tab[]) => {
      const message = { action: "download", data: allData };
      chrome.tabs.sendMessage(currentTabID, message, (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error sending message:",
            chrome.runtime.lastError.message
          );
        } else {
          console.log("Response from content script:", response);
          statusElement.textContent = "Completed!";
        }
      });
    }
  );
}

document.getElementById("fetch")!.addEventListener("click", fetchHandler);
