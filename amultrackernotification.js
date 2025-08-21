import puppeteer from "puppeteer";

const url =
  "https://shop.amul.com/en/product/amul-high-protein-plain-lassi-200-ml-or-pack-of-30";

(async () => {
  const browser = await puppeteer.launch({ headless: false }); // headless: true in production
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });

  // 🔹 Type pincode in the search box
  //   await page.waitForSelector("#search");
  //   await page.type("#search", "700001");
  await page.waitForSelector("#search", { visible: true });
  await page.click("#search"); // focus input
  await page.type("#search", "110001", { delay: 100 });

  // wait a moment for site JS to attach
  // wait for 1 second
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await page.keyboard.press("Enter");

  //   await button.evaluate((b) => b.click());
  // replace with your pincode

  // 🔹 Click the button next to input (adjust selector if different)
  await page.click("button.btn.btn-primary"); // check actual class or id of the button

  // 🔹 Wait for page to reload/render after pincode is applied
  await page.waitForTimeout(3000);

  // 🔹 Now check Sold Out div
  try {
    const soldOutText = await page.$eval("div.alert.alert-danger.mt-3", (el) =>
      el.textContent.trim()
    );
    console.log("⚠️ Status:", soldOutText);
  } catch (err) {
    console.log("✅ Product might be available (Sold Out message not found).");
  }

  await browser.close();
})();
