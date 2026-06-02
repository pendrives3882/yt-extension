const fetchBtn = document.getElementById("fetchBtn");
const downloadBtn = document.getElementById("downloadBtn");
const status = document.getElementById("status");
const thumbnail = document.getElementById("thumbnail");
const titleEl = document.getElementById("title");

let downloadUrl = "";

fetchBtn.addEventListener("click", async () => {
  status.textContent = "Tab check kar raha hai...";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url.includes("youtube.com/watch")) {
    status.textContent = "❌ YouTube video page pe jao pehle!";
    return;
  }

  status.textContent = "⏳ Video info nikal raha hai...";
  fetchBtn.disabled = true;

  chrome.tabs.sendMessage(tab.id, { action: "getVideoData" }, (response) => {
    if (chrome.runtime.lastError || !response) {
      status.textContent = "❌ Page reload karo aur dobara try karo.";
      fetchBtn.disabled = false;
      return;
    }

    if (response.error) {
      status.textContent = "❌ " + response.error;
      fetchBtn.disabled = false;
      return;
    }

    thumbnail.src = response.thumbnail;
    thumbnail.style.display = "block";
    titleEl.textContent = response.title;
    titleEl.style.display = "block";

    downloadUrl = response.url;
    status.textContent = `✅ Ready! ${response.quality}`;
    downloadBtn.style.display = "block";
    fetchBtn.style.display = "none";
  });
});

downloadBtn.addEventListener("click", () => {
  if (downloadUrl) {
    chrome.tabs.create({ url: downloadUrl });
  }
});
