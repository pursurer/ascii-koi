# README template for the ASCII Koi family

Every family repository uses this shape, so the projects read as one series.

```markdown
# <Product name>

**<One sentence: what it does for you, in plain words.>** <One or two sentences on what makes it this family: text characters, the same pond.js, the black cat.>

<p align="center">
  <img src="media/<preview>" alt="<What the image shows, frame by frame if it moves>" width="100%">
</p>

<p align="center"><a href="<live demo or install>"><b>▶ <Main action></b></a> &nbsp;·&nbsp; <a href="#install">Install</a></p>

## Install
<Copy-paste commands, one per code block. Then the one step that makes it appear.>

## What you get
<A table: where or what, and what you see.>

## How it works
<Which original code it reuses, and how. A file table.>

<!-- family:start -->
<!-- family:end -->

## License

MIT.
```

- **Family block.** Keep the two markers. `node scripts/family.mjs` (in ascii-koi) fills the block from `docs/family.md` in every family repository checked out next to ascii-koi; `--check` only reports. Change the family table in `docs/family.md` only.
- **Repository name.** The product's own name in kebab case: `codex-koi`, `one-page-is-all-you-need`.
- **Description.** One plain sentence about what the user gets, no emoji.
- **Topics.** Always `ascii-koi` and `ascii-art`, then what the product runs on, for example `codex`, `claude-code`, `n8n`.
- **Media.** Rendered from the real code, never mocked up. Keep the black water (`#0d1315`) as the background.
