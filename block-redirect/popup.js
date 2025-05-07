const urlList = document.getElementById("urlList");
const toggle = document.getElementById("recordAllToggle");
const clearBtn = document.getElementById("clearBtn");

// Carrega histórico e estado do toggle
function loadData() {
  chrome.storage.local.get(["blockedUrls", "recordAll"], (data) => {
    const urls = data.blockedUrls || [];
    urlList.innerHTML = "";

    if (urls.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Nenhuma URL ainda.";
      urlList.appendChild(li);
    } else {
      urls
        .slice()
        .reverse()
        .forEach((url) => {
          const li = document.createElement("li");
          li.textContent = url;
          urlList.appendChild(li);
        });
    }

    toggle.checked = data.recordAll === true;
  });
}

toggle.addEventListener("change", () => {
  chrome.storage.local.set({ recordAll: toggle.checked });
});

clearBtn.addEventListener("click", () => {
  chrome.storage.local.remove("blockedUrls", () => {
    loadData(); // Atualiza a UI após limpar
  });
});

loadData();
