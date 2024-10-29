export interface FetchOptions {
  credentials: RequestCredentials;
  headers: {
    [key: string]: string; // This allows for any additional headers
  };
  method: string;
  mode: RequestMode;
}

export const headers: FetchOptions = {
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

export const requestFetch = async (
  url: string,
  headers?: FetchOptions,
  json: boolean = false
): Promise<any> => {
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

export const AllUrl = {
  base: "https://www.tradingview.com/script",
  baseCode: "https://pine-facade.tradingview.com",
  sourceCode:
    "https://pine-facade.tradingview.com/pine-facade/get/%ID%/1?no_4xx=true",
};
