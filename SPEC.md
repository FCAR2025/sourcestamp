# SourceStamp — MVP spec (build contract)

Open-source Chrome MV3 extension. Free lead-gen tool for public-records researchers
(surplus recovery, skiptrace, heir research). Read-only provenance capture.

## Core flow

1. User highlights any text/fact on any page (target: official county/court portals,
   but must work on any page).
2. User presses one hotkey (default `Alt+S`, configurable via `chrome.commands`).
3. Extension opens a small popup/panel asking: **which case does this belong to?**
   - Case list = user-defined labels (free text, e.g. "Smith foreclosure 24CV123").
   - Cases stored locally; user can create/select cases. No accounts.
4. On confirm, extension captures a **source receipt** (JSON):
   - `id` (uuid), `case_label`, `selection` (highlighted text),
   - `url` (exact, full), `page_title`, `captured_at` (ISO-8601 UTC),
   - `context` (surrounding ~200 chars each side of selection),
   - `table_row` (optional: if selection is inside a `<tr>`, capture that row's
     cells as text array; else null),
   - `fragment` (text fragment for `#:~:text=` deep link, best-effort).
5. Receipt persisted in `chrome.storage.local` (per case).
6. Receipt viewer (extension popup): list receipts per case, and a
   **Copy citation** button producing a plain-text block:

   ```
   [SourceStamp receipt]
   Fact: "<selection>"
   Source: <page_title> — <url>
   Captured: <captured_at> (UTC)
   Context: …<context>…
   Case: <case_label>
   Captured with SourceStamp (open source)
   ```

## Hard constraints

- **Zero network calls, zero telemetry, zero remote code.** No fetch/XHR/beacon
  anywhere. `manifest.json` permissions: `storage`, `commands` only (plus
  `activeTab`/scripting as minimally needed). No `host_permissions` beyond `<all_urls>`
  on the content script (read-only page access).
- **Local storage only.** Never sync storage.
- No frameworks/build step required to run: plain JS + HTML + CSS, loads unpacked.
- No external CDN assets; all assets in-repo.
- Plain, clean UI. Dark-friendly. No branding assets yet (placeholder name only).

## Repo layout

```
manifest.json
content/content.js        # selection capture + hotkey listener + table-row detect
content/capture-ui.js     # shadow-DOM mini panel for case picker on the page
background/service-worker.js  # chrome.commands hotkey relay
popup/popup.html|js|css   # case manager + receipt list + copy citation
lib/receipt.js            # pure receipt build + citation render (testable, no chrome APIs)
test/receipt.test.mjs     # node:test unit tests for lib/receipt.js
test/fixture.html         # static page for manual load test
README.md                 # what/why/install-unpacked/roadmap (identity overlay = later)
LICENSE                   # MIT
```

## Verification (must pass before done)

1. `node --test test/` — receipt builder fills every field; citation block renders
   with all fields present; null table_row handled.
2. `jq empty manifest.json` — manifest parses; `manifest_version == 3`.
3. Headless load smoke: `google-chrome --headless=new --disable-gpu
   --load-extension=. about:blank` starts without extension-load errors.
4. Grep gate: `grep -rnE "fetch\(|XMLHttpRequest|sendBeacon|https?://" --include='*.js' .`
   returns nothing except comments/README/LICENSE. (URL strings inside captured
   receipt data at runtime are fine — the ban is on code making calls.)

Do NOT add: sync features, server endpoints, identity matching, analytics,
build tooling beyond node:test.
