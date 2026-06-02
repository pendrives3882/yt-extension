const fetchBtn = document.getElementById("fetchBtn");
const downloadBtn = document.getElementById("downloadBtn");
const status = document.getElementById("status");
const thumbnail = document.getElementById("thumbnail");
const titleEl = document.getElementById("title");

let downloadUrl = "";
let videoTitle = "";

function getVideoId(url) {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}

fetchBtn.addEventListener("click", async () => {
  status.textContent = "Tab check kar raha hai...";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;

  if (!url.includes("youtube.com/watch")) {
    status.textContent = "❌ YouTube video page pe jao pehle!";
    return;
  }

  const videoId = getVideoId(url);
  if (!videoId) {
    status.textContent = "❌ Video ID nahi mila!";
    return;
  }

  status.textContent = "⏳ Video info fetch ho rahi hai...";
  fetchBtn.disabled = true;

  try {
    const res = await fetch("https://www.youtube.com/youtubei/v1/player", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-YouTube-Client-Name": "3",
        "X-YouTube-Client-Version": "17.31.35",
        "X-Origin": "https://www.youtube.com",
      },
      body: JSON.stringify({
        videoId: videoId,
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: "17.31.35",
            androidSdkVersion: 30,
            hl: "en",
            gl: "US",
          }
        }
      })
    });

    const data = await res.json();

    const details = data.videoDetails;
    const formats = data.streamingData?.formats || [];

    if (!formats.length) {
      status.textContent = "❌ Download link nahi mila. Dobara try karo.";
      fetchBtn.disabled = false;
      return;
    }

    // Title aur thumbnail
    videoTitle = details?.title || "video";
    const thumb = details?.thumbnail?.thumbnails?.slice(-1)[0]?.url || "";

    thumbnail.src = thumb;
    thumbnail.style.display = "block";
    titleEl.textContent = videoTitle;
    titleEl.style.display = "block";

    // Best format — highest quality combined
    const best = formats[formats.length - 1];
    downloadUrl = best.url;
    const quality = best.qualityLabel || "360p";

    status.textContent = `✅ Ready! ${quality}`;
    downloadBtn.style.display = "block";
    fetchBtn.style.display = "none";

  } catch (err) {
    status.textContent = "❌ Error aaya: " + err.message;
    fetchBtn.disabled = false;
  }
});

downloadBtn.addEventListener("click", () => {
  if (downloadUrl) {
    chrome.tabs.create({ url: downloadUrl });
  }
});
