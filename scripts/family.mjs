// Copies docs/family.md into the README of every family repository checked out next to this one.
// Each README keeps the block between <!-- family:start --> and <!-- family:end -->; its own row is shown in bold.
//   node scripts/family.mjs           update the READMEs
//   node scripts/family.mjs --check   only report, exit 1 if one is out of date
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const REPOS = ["ascii-koi", "codex-koi", "claude-koi", "codex-ascii-pets", "one-page-is-all-you-need"];
const START = "<!-- family:start -->", END = "<!-- family:end -->";
const check = process.argv.includes("--check");
const block = readFileSync(new URL("../docs/family.md", import.meta.url), "utf8").trim();

let stale = 0;
for (const repo of REPOS) {
  const file = new URL(`../../${repo}/README.md`, import.meta.url);
  if (!existsSync(file)) { console.log(`${repo}: no checkout next to ascii-koi, skipped`); continue; }
  const text = readFileSync(file, "utf8");
  const a = text.indexOf(START), b = text.indexOf(END);
  if (a < 0 || b < a) { console.log(`${repo}: no family markers, skipped`); continue; }
  const own = block.replace(new RegExp(`\\[([^\\]]+)\\]\\(https://github\\.com/pursurer/${repo}\\)`), "**$1** (this repository)");
  const next = text.slice(0, a) + `${START}\n${own}\n${END}` + text.slice(b + END.length);
  if (next === text) { console.log(`${repo}: up to date`); continue; }
  stale++;
  if (check) console.log(`${repo}: out of date`);
  else { writeFileSync(file, next); console.log(`${repo}: updated`); }
}
if (check && stale) process.exit(1);
