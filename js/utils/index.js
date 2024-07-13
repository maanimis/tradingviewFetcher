export const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export const result = ({ success, msg, data }) => {
  this.success = success;
  this.msg = msg;
  this.data = data;
  // console.table(this);
};

export const parseHtml = (htmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  return doc;
};

export const setDocument = (text) => {
  document.open();
  document.write(text);
  document.close();
};

export const requestXMLHttpRequest = (url) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        console.log(xhr.responseText);
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        } else {
          reject(`Error fetching data from ${url}: ${xhr.status}`);
        }
      }
    };
    xhr.send();
  });
};

export const requestFetch = async (url, headers) => {
  return fetch(url, headers)
    .then((response) => {
      if (!response.ok) {
        console.log(`[-]Error fetching data from ${url}: #${response.status}`);
        return false;
      }
      return response.text();
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};

export const downloadResult = async ({
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
  return new result({ success: true, msg: "downloadResult", data: { name } });
};
