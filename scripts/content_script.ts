import { AllUrl, headers, requestFetch } from "./modules/api";
import { downloadResult } from "./modules/downloader";
import { delay, parseHtml } from "./modules/utils";
import type { ProcessResult } from "./modules/types";

console.log("content_script.js running...");

const customSelector = { id: "button[data-script-id-part]" };

async function processStep(allData: any[]): Promise<ProcessResult> {
  if (!allData || !Array.isArray(allData)) {
    alert("Something went wrong: No data available!");
    return { status: { total: 0, success: 0, failed: 0 }, undone: [] };
  }

  const status = { total: 0, success: 0, failed: 0 };
  const failed: string[] = [];

  for (const result of allData) {
    status.total++;
    await delay(1000); // Throttle requests

    if (!result.success) {
      status.failed++;
      failed.push(result.url);
      console.log(`Failed to process: ${result.url}`);
      continue;
    }

    console.log(`Checking: ${result.url}`);
    const doc = parseHtml(result.data);
    const idElement = doc.querySelector(customSelector.id);

    if (idElement) {
      const id = idElement.getAttribute("data-script-id-part");
      if (id) {
        console.log(`ID found: ${id}`);
        const url = AllUrl.sourceCode.replace("%ID%", id);
        const data = await requestFetch(url, headers, true);

        if (data && data.source && data.scriptName) {
          await downloadResult({ text: data.source, name: data.scriptName });
          status.success++;
        } else {
          console.error("Invalid data structure:", data);
        }
      } else {
        console.warn("No ID attribute found for element.");
      }
    } else {
      console.warn("Custom selector not found in document.");
    }
  }

  return { status, undone: failed };
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "download") {
    location.href = AllUrl.baseCode;
    sendResponse(true);
  }
});

(async () => {
  if (location.href.includes(AllUrl.baseCode)) {
    console.log("Starting download step...");

    const { _mySecretData } = await chrome.storage.local.get("_mySecretData");
    if (!_mySecretData) {
      console.error("No data found in storage");
      return;
    }

    console.log("DATA loaded in content_script:", _mySecretData);
    const result = await processStep(_mySecretData);

    await chrome.storage.local.set({ _mySecretData: null });
    if (result) {
      const summary = `Total: ${result.status.total}\nSuccess: ${
        result.status.success
      }\nFailed: ${result.status.failed}\nUndone URLs:\n${result.undone.join(
        "\n"
      )}`;
      alert(summary);
    }
  }
})();
