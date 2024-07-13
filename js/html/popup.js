import * as util from "../utils/index.js";

const target = {
  tradingview: "https://www.tradingview.com/robots.txt",
  base: "https://www.tradingview.com/script",
  baseCode: "https://pine-facade.tradingview.com/",
  sourceCode:
    "https://pine-facade.tradingview.com/pine-facade/get/%ID%/1?no_4xx=true",
};

async function fetchHandler() {
  const urls = document
    .getElementById("urls")
    .value.split("\n")
    .map((url) => url.trim());
  const validUrls = urls.filter((url) => url.startsWith(target.base));

  if (!validUrls.length) {
    const msg = "No valid URLs found.";
    document.getElementById("status").textContent = msg;
    return util.result({ success: false, msg });
  }

  const totalRequests = validUrls.length;
  const statusElement = document.getElementById("status");
  const progressBar = document.getElementById("progress");

  statusElement.textContent = "Fetching data...";
  progressBar.value = 0; // Reset progress bar

  const fetchAllData = async () => {
    const responses = [];
    let completedRequests = 0;

    for (const url of validUrls) {
      statusElement.textContent = url;
      await util.sleep(500);
      try {
        const data = await util.requestFetch(url);
        if (data) {
          responses.push({ success: true, url, data });
        } else {
          responses.push({ success: false, url, error: "No data" });
        }
      } catch (error) {
        responses.push({ success: false, url, error: error.message });
      }
      completedRequests++;
      const progress = Math.round((completedRequests / totalRequests) * 100);
      progressBar.value = progress;
    }

    statusElement.textContent = "Downloading...!";

    return responses;
  };

  await chrome.tabs.query(
    { active: true, currentWindow: true },
    function (tabs) {
      chrome.tabs.update(tabs[0].id, { url: target.tradingview });
    }
  );

  const allData = await fetchAllData();

  await chrome.storage.local.set({ _mySecretData: allData }, function () {
    console.log("Data saved:", allData);
    console.log("Data saved locally");
  });

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const message = { action: "download", data: allData };
    chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
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
  });
}

document.getElementById("fetch").addEventListener("click", fetchHandler);
