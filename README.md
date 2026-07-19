# SourceStamp

SourceStamp is an open-source Chrome MV3 extension for public-records researchers.
It turns highlighted facts into local source receipts that preserve the page, time,
surrounding context, and table row when one is available.

## Why

Public-record research often moves faster than provenance notes. SourceStamp keeps a
small, structured receipt beside each case so a fact can be traced back to the page
where it was found.

SourceStamp is read-only. It makes no network calls, includes no telemetry or remote
code, and stores cases and receipts only in `chrome.storage.local` on the current
Chrome profile.

## Install unpacked

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this repository directory.
4. Optionally open `chrome://extensions/shortcuts` to change the default `Alt+S`
   shortcut.

There is no build or dependency-install step.

## Use

1. Highlight text on a page.
2. Press `Alt+S`.
3. Select an existing case or enter a new case label.
4. Choose **Save receipt**.
5. Open the SourceStamp toolbar popup to view receipts or copy a citation.

The static page at `test/fixture.html` provides prose and a table for a manual capture
check. Chrome must be allowed to run the unpacked extension on file URLs before a
local file fixture can receive content scripts.

## Repository layout

- `manifest.json` — MV3 manifest and configurable capture command.
- `content/` — page selection capture and the Shadow DOM case picker.
- `background/` — hotkey relay service worker.
- `popup/` — local case manager, receipt viewer, and citation copy action.
- `lib/receipt.js` — browser/Node-compatible receipt and citation functions.
- `test/` — `node:test` coverage and a manual HTML fixture.

## Roadmap

An optional identity overlay may be explored later. It is not part of this MVP; the
current extension performs no identity matching and sends no data anywhere.

## License

MIT. See `LICENSE`.
