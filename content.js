chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getVideoData") {
    try {
      // YouTube page mein ytInitialPlayerResponse already available hai
      const data = window.ytInitialPlayerResponse;

      if (!data) {
        sendResponse({ error: "Video data nahi mila" });
        return;
      }

      const title = data.videoDetails?.title || "video";
      const thumbnail = data.videoDetails?.thumbnail?.thumbnails?.slice(-1)[0]?.url || "";
      const formats = data.streamingData?.formats || [];

      if (!formats.length) {
        sendResponse({ error: "Koi format nahi mila" });
        return;
      }

      // Best quality format
      const best = formats[formats.length - 1];

      sendResponse({
        title,
        thumbnail,
        url: best.url,
        quality: best.qualityLabel || "360p"
      });

    } catch (e) {
      sendResponse({ error: e.message });
    }
  }
  return true;
});
