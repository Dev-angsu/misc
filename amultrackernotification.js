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

-----------OTHER APPROACH-----------
  import fetch from "node-fetch";
import notifier from "node-notifier";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer";

const URL =
  "https://shop.amul.com/en/product/amul-high-protein-plain-lassi-200-ml-or-pack-of-30";

// 🔑 configure your email
const transporter = nodemailer.createTransport({
  service: "gmail", // or "outlook", "yahoo", or custom SMTP
  auth: {
    user: "deb.burner.one@gmail.com", // sender email
    pass: "axee vthv mhje iclf", // Gmail app password (not your main password!)
  },
});

// recipient email
const recipient = "debu.sark@gmail.com";

async function checkProduct() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(URL, { waitUntil: "networkidle2" });

    // Wait for body to load
    await page.waitForSelector("body");

    // Look for "Sold Out" badge
    const soldOut = await page
      .$eval("div.alert.alert-danger.mt-3", (el) => el.textContent.trim())
      .catch(() => null);
    // const soldOut = "Available";
    // const soldOut = $("div.alert.alert-danger.mt-3").text().trim();

    //
    console.log("👉 SoldOutStatus : ", soldOut);
    //

    if (soldOut === "Sold Out") {
      notify("Product Available!", `The product is in stock: ${URL}`);
      await sendEmail(
        "Product Available!",
        `The product is now in stock: ${URL}`
      );
      return true;
    } else {
      console.log("Still out of stock...");
      return false;
    }
  } catch (err) {
    console.error("Error checking product:", err);
    return false;
  }
}

function notify(title, msg) {
  notifier.notify({ title, message: msg, sound: true, wait: false });
}

async function sendEmail(subject, text) {
  try {
    await transporter.sendMail({
      from: '"Stock Alert Bot" <your_email@gmail.com>',
      to: recipient,
      subject: subject,
      text: text,
    });
    console.log("✅ Email sent!");
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
}

(async () => {
  while (!(await checkProduct())) {
    await new Promise((res) => setTimeout(res, 10 * 1000)); // check every 1 min
  }
})();

