// Minimal Chrome DevTools Protocol client: no dependencies (Node 22+ has WebSocket).
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export async function launch({ width = 1440, height = 900, dpr = 2, headless = true, args = [] } = {}) {
  const profile = mkdtempSync(join(tmpdir(), "koi-chrome-"));
  const port = 9300 + Math.floor(Math.random() * 500);
  const proc = spawn(CHROME, [
    ...(headless ? ["--headless=new"] : []), `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "--mute-audio",
    `--window-size=${width},${height}`, `--force-device-scale-factor=${dpr}`, ...args, "about:blank"
  ], { stdio: "ignore" });
  let ver;
  for (let i = 0; i < 100; i++) {
    try { ver = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); if (ver.length) break; } catch (e) { /* not up yet */ }
    await new Promise(r => setTimeout(r, 100));
  }
  const page = ver.find(t => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const waiting = new Map(), listeners = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && waiting.has(m.id)) { const { res, rej } = waiting.get(m.id); waiting.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
    else if (m.method) for (const l of listeners) l(m);
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; waiting.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: dpr, mobile: false });
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const goto = async (url) => {
    const loaded = new Promise(res => listeners.push(m => { if (m.method === "Page.loadEventFired") res(); }));
    await send("Page.navigate", { url });
    await loaded;
  };
  const close = () => { try { ws.close(); } catch (e) {} proc.kill(); };
  process.once("exit", close);
  process.once("uncaughtException", e => { close(); console.error(e); process.exit(1); });
  process.once("unhandledRejection", e => { close(); console.error(e); process.exit(1); });
  return { send, evaluate, goto, close, on: f => listeners.push(f) };
}
