const puppeteer = require("puppeteer");

const videoUrl = "https://www.youtube.com/watch?v=NEkc8Eb2zZM";
const totalSessions = 20; // total number of watches
const batchSize = 5; // run 5 at a time
const watchTime = 2 * 60 * 1000; // 2 minutes in ms

// Pick a random start time (e.g., within the first 80% of the video)
function getRandomStart(maxSeconds) {
  return Math.floor(Math.random() * (maxSeconds * 0.8));
}

async function runBatch(browser, startIndex, endIndex) {
  const tasks = [];
  for (let i = startIndex; i < endIndex; i++) {
    tasks.push(
      (async () => {
        const page = await browser.newPage();
        console.log(`🎬 Tab #${i + 1}: Opening video...`);
        await page.goto(videoUrl, { waitUntil: "networkidle2" });

        // Wait for video element
        await page.waitForSelector("video");

        // Mute video
        await page.evaluate(() => {
          const video = document.querySelector("video");
          if (video) {
            video.muted = true;
          }
        });

        // Grab video duration
        const duration = await page.evaluate(() => {
          const video = document.querySelector("video");
          return video ? video.duration : 0;
        });

        // Jump to random timestamp
        const randomStart = getRandomStart(duration || 4600); // fallback 10min
        await page.evaluate((startTime) => {
          const video = document.querySelector("video");
          if (video) {
            video.currentTime = startTime;
            video.play().catch(() => {});
          }
        }, randomStart);

        console.log(
          `⏳ Tab #${i + 1}: Watching from ${randomStart}s for 120s...`
        );
        await new Promise((r) => setTimeout(r, watchTime));

        await page.close();
        console.log(`✅ Tab #${i + 1}: Closed`);
      })()
    );
  }

  await Promise.all(tasks); // wait for this batch to finish
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });

  for (let start = 0; start < totalSessions; start += batchSize) {
    const end = Math.min(start + batchSize, totalSessions);
    console.log(
      `🚀 Starting batch ${start / batchSize + 1} (${start + 1}–${end})`
    );
    await runBatch(browser, start, end);

    // Optional: wait 30s before next batch
    if (end < totalSessions) {
      console.log("⏸ Waiting 30s before next batch...");
      await new Promise((r) => setTimeout(r, 30000));
    }
  }

  await browser.close();
  console.log("🎉 All sessions completed!");
})();
