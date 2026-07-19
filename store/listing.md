# Chrome Web Store listing — SourceStamp (paste-ready)

Everything below maps 1:1 to the developer dashboard fields at
https://chrome.google.com/webstore/devconsole (one-time $5 developer account).

---

## Package upload

Upload `store/sourcestamp-0.1.0.zip` (extension bundle, built from the repo root).

## Store listing tab

**Name:** SourceStamp — Source Receipts for Public-Records Research

**Summary (132 chars max):**
```
Highlight any fact on any records portal, press Alt+S, get a permanent local source receipt and citation. 100% private.
```

**Detailed description:**
```
SourceStamp stamps a permanent source receipt on any fact you find online.

Built for public-records researchers — surplus-funds recovery, skiptracing,
heir research, title work — and anyone who has ever written down a fact and
later couldn't prove where it came from.

HOW IT WORKS
1. Highlight a fact on any web page — a county portal, a court docket, an
   excess-funds list, anywhere.
2. Press Alt+S.
3. Pick which case the fact belongs to.
4. Done. The receipt is saved permanently in your browser.

EVERY RECEIPT RECORDS
• The exact highlighted text
• The full source URL and page title
• The UTC timestamp of capture
• Surrounding context (~200 characters each side)
• The complete table row, if the fact sits in a table
• A text-fragment deep link back to the exact spot

One click turns any receipt into a clean, paste-ready citation block for
caller packets, demand letters, case files, or internal notes.

WHY RESEARCHERS TRUST IT
• 100% local: no accounts, no servers, no tracking, no analytics — ever.
  Your leads never leave your machine.
• Fully open source (Apache 2.0): read every line at
  https://github.com/FCAR2025/sourcestamp
• Works on any site: county portals, court systems, treasurer lists, MLS,
  anywhere you research.
• Free. No upsell, no trial, no feature wall.

ORGANIZE BY CASE
Receipts group under case labels you define ("Smith foreclosure 24CV123").
Open the SourceStamp popup to browse every fact you've captured per case and
copy citations one at a time.

Stop losing track of where you found things. Stamp the source.

Free and open source — from Full Circle Asset Recovery.
```

**Category:** Productivity
**Language:** English

**Store icon:** `icons/icon128.png`
**Screenshots:**
1. `store/screenshot-1-capture.png` (1280x800) — caption: "Highlight a fact, press Alt+S, assign a case — done."
2. `store/screenshot-2-receipts.png` (640x800) — caption: "Every receipt: URL, timestamp, context, table row. One click to a paste-ready citation."

**Official URL:** https://github.com/FCAR2025/sourcestamp
**Homepage URL:** https://github.com/FCAR2025/sourcestamp
**Support URL:** https://github.com/FCAR2025/sourcestamp/issues

## Privacy practices tab

**Single-purpose description:**
```
SourceStamp captures user-highlighted page facts into locally stored,
case-organized source receipts with one-click citation export.
```

**Permission justifications:**
- `storage`: "Receipts and case labels are saved locally in the user's browser via chrome.storage.local. This is the extension's core function. No data leaves the device."
- `activeTab`: "When the user presses the capture hotkey, the extension reads the current text selection and its surrounding context on the active tab. No page content is read at any other time."
- Host access (`<all_urls>` content script): "Public-records research spans thousands of county, court, and municipal portals. The capture hotkey must work on any page the researcher is viewing. The script reads page content only at the moment the user invokes capture and makes no network requests."
- Remote code: **No remote code** (declare: this extension does not execute remote code).

**Data usage disclosures (check as follows):**
- Does it collect/transmit user data? **No** — select "This extension does not collect user data" if offered; otherwise declare each data type as "not collected."
- Certification boxes: no sale of data, no use for unrelated purposes, no creditworthiness use — all safe to certify truthfully.

**Privacy policy URL:**
```
https://github.com/FCAR2025/sourcestamp/blob/main/PRIVACY.md
```

## Distribution tab

- Visibility: **Public**
- Regions: All
- Pricing: Free

---

## Operator checklist (manual, ~15 min)

1. [ ] Create/pay Chrome Web Store developer account ($5) — needs a Google account; use carl@ or a shared ops Google identity.
2. [ ] New item → upload `store/sourcestamp-0.1.0.zip`.
3. [ ] Paste fields above (Store listing tab).
4. [ ] Upload icon + 2 screenshots with captions.
5. [ ] Fill Privacy practices tab exactly as above.
6. [ ] Distribution: public, all regions, free.
7. [ ] Submit for review (typically 1–3 days; first publish sometimes longer).
8. [ ] When live: add store link to README + repo description; start community promotion.

## Known review risks (low)

- `<all_urls>` host access is the most scrutinized permission — justification above + the zero-network design is the defense. Source availability in the public repo helps.
- Keep the privacy declarations exactly consistent with the code (they are: no network, local storage only).
