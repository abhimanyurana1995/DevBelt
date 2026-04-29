# ⚙ DevBelt — Developer Utility Belt

**10 browser-based developer tools. Zero dependencies. Works offline.**

🚀 **[Live Demo →](https://abhimanyurana1995.github.io/DevBelt/)**

---

## Tools

| Tool | What it does |
|---|---|
| **JSON Formatter** | Format, minify, validate JSON |
| **Base64** | Encode / decode with Unicode support + swap |
| **URL Parser** | Break any URL into protocol, host, params, hash |
| **Timestamp** | Unix ↔ ISO ↔ local ↔ relative — any format |
| **Hash Generator** | SHA-256, SHA-1, SHA-512 via Web Crypto API |
| **JWT Decoder** | Decode header + payload, expiry status, timestamp annotations |
| **Color Converter** | HEX ↔ RGB ↔ HSL with live swatch |
| **Regex Tester** | Live match highlighting, capture groups, match list |
| **Text Diff** | Line-by-line diff with LCS algorithm |
| **Markdown Preview** | Write and preview markdown live |

---

## How it was built

This app was built using a **Claude + Gemma4:E4B + OpenCode** orchestration system — Claude designed the architecture, a local 8B model wrote the code.

```
Claude (architect)          Gemma 4 E4B via OpenCode (coder)
─────────────────           ────────────────────────────────
ARCHITECTURE.md        →    reads specs, writes tool files
10 spec files          →    one spec = one file = one session
/next-task command     →    chains read → implement → mark done
instructions.md        →    standing rules to prevent known failure modes
```

**Gemma wrote 1,100 of the 1,800 lines** (61%) — all 10 tool implementations.  
Claude wrote the shell, router, CSS, all specs, and fixed 4 structurally broken files post-generation.

### The orchestration system

Each tool was defined in a spec file (`specs/NNN-name.md`) containing:
- Exact file path
- Exact HTML template to inject
- Every function with pseudocode
- Hard "Do NOT" rules learned from Gemma's failure modes

The `/next-task` custom command (`.opencode/commands/next-task.md`) chains all 5 steps in one prompt so the model can't stop mid-task.

### What we learned about running an 8B model as a coder

| Failure mode | Fix |
|---|---|
| Context too small → function nesting | Increased `num_ctx` to 32k via Ollama Modelfile |
| Open-ended tasks → confused output | Pre-written HTML templates in every spec |
| Stopping after read → no write | `/next-task` command with explicit "reading is never the final action" |
| Double-definition pattern → syntax errors | Added rule to `instructions.md` + "Do NOT" in every spec |
| Commented-out logic | Explicit rule: never comment out code, throw instead |

---

## Run locally

```bash
# Just open in browser — no server needed
start src/index.html   # Windows
open src/index.html    # macOS
```

---

## Use the orchestration system yourself

```
E:\your-project\
├── .opencode\
│   ├── instructions.md     ← model's standing orders
│   └── commands\
│       └── next-task.md    ← /next-task slash command
├── specs\
│   └── 001-feature.md      ← one spec per file
├── src\                    ← model writes here
├── ARCHITECTURE.md
└── TASKS.md
```

Tell your local model: `/next-task`  
It reads TASKS.md → reads the spec → writes the file → marks done. Repeat.

---

## Stack

- Pure HTML/CSS/JS — no build step, no npm, no bundler
- Runs from `file://` or any static host
- Dark theme, monospace, green-glow aesthetic
- Deployed via GitHub Pages from `/src`
