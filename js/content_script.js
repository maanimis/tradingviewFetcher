console.log("content_script.js running...");

const target = {
  base: "https://www.tradingview.com/script",
  baseCode: "https://pine-facade.tradingview.com",
  sourceCode:
    "https://pine-facade.tradingview.com/pine-facade/get/%ID%/1?no_4xx=true",
};

const selector = { id: "button[data-script-id-part]" };

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const headers = {
  credentials: "include",
  headers: {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    Priority: "u=1",
    Pragma: "no-cache",
    "Cache-Control": "no-cache",
  },
  method: "GET",
  mode: "cors",
};

const result = ({ success, msg, data }) => {
  this.success = success;
  this.msg = msg;
  this.data = data;
  // console.table(this);
};

const parseHtml = (htmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  return doc;
};

const requestFetch = async (url, headers, json = false) => {
  return fetch(url, headers)
    .then((response) => {
      if (!response.ok) {
        console.log(`[-] Error fetching data from ${url}: #${response.status}`);
        return false;
      }
      return json ? response.json() : response.text();
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};

const downloadResult = async ({
  text,
  name = "",
  ext = "pine",
  setTimestamp = true,
}) => {
  if (setTimestamp) name += `-${Date.now()}`;
  const data = new Blob([text], { type: "text/plain" });
  const url = window.URL.createObjectURL(data);

  const link = document.createElement("a");
  link.download = `${name}.${ext}`;
  link.href = url;
  link.click();
  return result({ success: true, msg: "downloadResult", data: { name } });
};

async function downloadStep(allData) {
  if (!allData) {
    alert("somthing wrong!!");
    return false;
  }
  const failed = [];
  const status = {
    total: 0,
    success: 0,
    failed: 0,
  };

  for (let result of allData) {
    ++status.total;
    await sleep(1000);
    if (result.success) {
      console.log(`checking: ${result.url}`);
      const doc = parseHtml(result.data);
      const idElement = doc.querySelector(selector.id);
      if (idElement) {
        const id = idElement.getAttribute("data-script-id-part");
        console.log(`id: ${id}`);
        const url = target.sourceCode.replace("%ID%", id);
        const data = await requestFetch(url, headers, true);
        if (data) {
          ++status.success;
          await downloadResult({ text: data.source, name: data.scriptName });
          continue;
        }
      }
    }
    ++status.failed;
    failed.push(result.url);
    console.log("failed!!");
  }
  return { status, undone: failed };
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  // console.log("Request received in content script:", request);
  if (request.action === "download") {
    location.href = target.baseCode;
    sendResponse(true);
  }
});

(async () => {
  if (location.href.includes(target.baseCode)) {
    console.log("Starting download step...");
    const data = await chrome.storage.local.get("_mySecretData");
    console.log("DATA loaded in content_script:", data);
    const result = await downloadStep(data._mySecretData);
    await chrome.storage.local.set({ _myData: null });
    if (result)
      alert(
        `total: ${result.status.total}\nsuccess: ${result.status.success}\nfailed: ${result.status.failed}>>>\n` +
          result.undone.join("\n")
      );
  }
})();
