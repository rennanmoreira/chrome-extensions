chrome.webNavigation.onBeforeNavigate.addListener(
  (details) => {
    chrome.storage.local.get(["blockedUrls", "recordAll"], (data) => {
      const urls = data.blockedUrls || [];
      const recordAll = data.recordAll === true;

      const shouldLog = recordAll || details.url.includes(".click");

      if (shouldLog) {
        // Evita duplicado sequencial
        if (urls[urls.length - 1] !== details.url) {
          urls.push(details.url);
          chrome.storage.local.set({ blockedUrls: urls });
        }
      }
    });
  },
  { url: [{ urlMatches: ".*" }] }
);
