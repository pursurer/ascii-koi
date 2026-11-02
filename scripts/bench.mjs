// Render time per frame in each water: node scripts/bench.mjs [url]
import { launch } from "./cdp.mjs";
const url = process.argv[2] || new URL("../index.html?ui=0", import.meta.url).href;
const gpu = process.argv.includes("--gpu");
const b = await launch({ width: 1440, height: 900, dpr: 2, args: gpu ? ["--enable-gpu", "--use-angle=metal"] : [] });
await b.goto(url);
await new Promise(r => setTimeout(r, 1500));
const out = await b.evaluate(`(() => {
  const p = AsciiKoi.pond, root = document.documentElement, res = {};
  for (const th of ["pond", "black", "light"]) {
    root.dataset.theme = th; p.colors();
    const ts = [];
    for (let i = 0; i < 60; i++) { const a = performance.now(); p.render(); ts.push(performance.now() - a); }
    ts.sort((a, b) => a - b);
    res[th] = { median: +ts[30].toFixed(2), p90: +ts[54].toFixed(2) };
  }
  return res;
})()`);
console.log(gpu ? "gpu" : "default", JSON.stringify(out));
b.close();
