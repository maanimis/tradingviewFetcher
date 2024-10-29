console.log("background.js running...");


chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

