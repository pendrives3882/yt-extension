const API = "https://yt-url-extractor.onrender.com";

const fetchBtn = document.getElementById("fetchBtn");
const downloadBtn = document.getElementById("downloadBtn");
const status = document.getElementById("status");
const thumbnail = document.getElementById("thumbnail");
const titleEl = document.getElementById("title");

let downloadUrl = "";

fetchBtn.addEventListener("click", async () => {
  status.textContent = "Tab URL check kar raha hai...";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;

  if (!url.includes("youtube.com/watch")) {
    status.textContent = "❌ YouTube video page pe jao pehle!";
    return;
  }

  status.textContent = "⏳ Video info fetch ho rahi hai...";
  fetchBtn.disabled = true;

  try {
    const res = await fetch(`${API}/extract?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    if (!data.success || !data.formats || data.formats.length === 0) {
      status.textContent = "❌ Video link nahi mila. Dobara try karo.";
      fetchBtn.disabled = false;
      return;
    }

    // Show thumbnail and title
    thumbnail.src = data.thumbnail;
    thumbnail.style.display = "block";
    titleEl.textContent = data.title;
    titleEl.style.display = "block";

    // Pick best format
    downloadUrl = data.formats[data.formats.length - 1].url;
    const quality = data.formats[data.formats.length - 1].quality;
    const size = data.formats[data.formats.length - 1].filesize_mb;

    status.textContent = `✅ Ready! ${quality} • ${size ? size + " MB" : ""}`;
    downloadBtn.style.display = "block";
    fetchBtn.style.display = "none";

  } catch (err) {
    status.textContent = "❌ Error aaya. Internet check karo.";
    fetchBtn.disabled = false;
  }
});

downloadBtn.addEventListener("click", () => {
  if (downloadUrl) {
    chrome.tabs.create({ url: downloadUrl });
  }
});
