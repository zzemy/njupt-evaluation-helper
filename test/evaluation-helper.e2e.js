const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright-core");

const rootDir = path.resolve(__dirname, "..");
const pageUrl = pathToFileURL(path.join(rootDir, "test", "evaluation-helper-test.html")).href;
const helperSource = fs.readFileSync(path.join(rootDir, "evaluation-helper.js"), "utf8");
const onlineLoaderSource = fs.readFileSync(path.join(rootDir, "dist", "evaluation-helper.online-loader.txt"), "utf8");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function getFrame(page) {
    const element = await page.waitForSelector("#iframeautoheight");
    const frame = await element.contentFrame();

    if (!frame) {
        throw new Error("Mock iframe was not available.");
    }

    return frame;
}

async function getSelectedValues(frame) {
    return frame.$$eval("select:not(#pjkc)", (selects) => selects.map((select) => select.value));
}

async function installOnlineLoaderMocks(page, mode) {
    await page.route("https://api.github.com/repos/zzemy/njupt-evaluation-helper/contents/evaluation-helper.js**", async (route) => {
        if (mode === "online-loader-fallback") {
            await route.fulfill({
                status: 403,
                contentType: "application/json",
                body: JSON.stringify({ message: "API rate limit exceeded" })
            });
            return;
        }

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                content: Buffer.from(helperSource, "utf8").toString("base64")
            })
        });
    });

    await page.route("https://raw.githubusercontent.com/zzemy/njupt-evaluation-helper/main/evaluation-helper.js**", async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "text/javascript",
            body: helperSource
        });
    });
}

async function injectHelper(page, mode) {
    if (mode === "online-loader-api" || mode === "online-loader-fallback") {
        await installOnlineLoaderMocks(page, mode);
        await page.evaluate(onlineLoaderSource);
        return;
    }

    if (mode === "online-loader-from-iframe") {
        await installOnlineLoaderMocks(page, "online-loader-api");
        const frame = await getFrame(page);
        await frame.evaluate(onlineLoaderSource);
        return;
    }

    if (mode === "direct-source-from-iframe") {
        const frame = await getFrame(page);
        await frame.evaluate(helperSource);
        return;
    }

    await page.evaluate(helperSource);
}

async function assertScenario(browser, type, expectedValues, mode) {
    const page = await browser.newPage();

    page.on("pageerror", (error) => {
        console.error(`[${type}] page error:`, error);
    });

    page.on("console", (message) => {
        if (mode === "online-loader-fallback" && message.text().includes("403 (Forbidden)")) {
            return;
        }

        if (message.type() === "error") {
            console.error(`[${type}] console error: ${message.text()}`);
        }
    });

    await page.goto(pageUrl);
    await page.click(`button[onclick="loadMockPage('${type}')"]`);
    await page.waitForFunction(() => {
        const iframe = document.getElementById("iframeautoheight");
        const doc = iframe && iframe.contentDocument;
        return Boolean(doc && doc.querySelectorAll("select:not(#pjkc)").length > 0);
    });
    await injectHelper(page, mode);

    await page.waitForFunction(() => {
        const log = document.getElementById("log").textContent;
        return log.includes("已提交：") && log.split("已提交：").length - 1 === 2;
    }, null, { timeout: 8000 });

    const log = await page.locator("#log").textContent();
    if (log.includes("程序设计")) {
        throw new Error("Last course should not be submitted automatically.");
    }

    const frame = await getFrame(page);
    const course = await frame.$eval("#pjkc", (select) => select.options[select.selectedIndex].textContent.trim());
    if (course !== "程序设计") {
        throw new Error(`Expected to stop on 程序设计, got ${course}.`);
    }

    await page.waitForFunction(() => {
        const iframe = document.getElementById("iframeautoheight");
        const doc = iframe && iframe.contentDocument;
        if (!doc) {
            return false;
        }

        const values = Array.from(doc.querySelectorAll("select:not(#pjkc)")).map((select) => select.value);
        return values.length === 12 && values.every(Boolean);
    }, null, { timeout: 8000 });

    const values = await getSelectedValues(frame);
    if (values.length !== 12) {
        throw new Error(`Expected 12 evaluation selects on the final two-teacher page, got ${values.length}.`);
    }

    expectedValues.forEach((value) => {
        if (!values.includes(value)) {
            throw new Error(`Expected final page to include selected value ${value}, got ${values.join(",")}.`);
        }
    });

    if (values.some((value) => value === "")) {
        throw new Error("Final page still has empty evaluation selects.");
    }

    await page.close();
}

(async () => {
    if (!fs.existsSync(chromePath)) {
        throw new Error(`Chrome executable was not found: ${chromePath}`);
    }

    const browser = await chromium.launch({
        executablePath: chromePath,
        headless: true
    });

    try {
        await assertScenario(browser, "course", ["A", "B"], "source");
        await assertScenario(browser, "teachingQuality", ["A", "B"], "source");
        await assertScenario(browser, "course", ["A", "B"], "online-loader-api");
        await assertScenario(browser, "teachingQuality", ["A", "B"], "online-loader-api");
        await assertScenario(browser, "course", ["A", "B"], "online-loader-fallback");
        await assertScenario(browser, "teachingQuality", ["A", "B"], "online-loader-fallback");
        await assertScenario(browser, "course", ["A", "B"], "online-loader-from-iframe");
        await assertScenario(browser, "teachingQuality", ["A", "B"], "online-loader-from-iframe");
        await assertScenario(browser, "course", ["A", "B"], "direct-source-from-iframe");
        await assertScenario(browser, "teachingQuality", ["A", "B"], "direct-source-from-iframe");
        console.log("evaluation helper e2e passed");
    } finally {
        await browser.close();
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
