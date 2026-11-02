// Screenshots of the page in headless Chrome: node scripts/shot.mjs <url> <out.png> [wait ms] [width] [height]
import { writeFileSync } from "node:fs";
import { launch } from "./cdp.mjs";
const [url, out, wait = 3500, width = 1440, height = 900] = process.argv.slice(2);
const b = await launch({ width: +width, height: +height, dpr: 1 });
await b.goto(url);
await new Promise(r => setTimeout(r, +wait));
const { data } = await b.send("Page.captureScreenshot", { format: "png" });
writeFileSync(out, Buffer.from(data, "base64"));
b.close();
process.exit(0);
