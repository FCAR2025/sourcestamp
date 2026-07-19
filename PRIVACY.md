# SourceStamp Privacy Policy

**Effective date:** 2026-07-19
**Contact:** privacy@fullcircleassetrecovery.com

## The short version

SourceStamp collects **nothing**. Everything it captures stays inside your own
browser. There are no accounts, no servers, no analytics, no telemetry, and no
network requests of any kind. You can verify this yourself: the entire source
code is public at https://github.com/FCAR2025/sourcestamp.

## What SourceStamp stores, and where

When you press the capture hotkey and save a receipt, SourceStamp stores the
following **locally in your browser** via `chrome.storage.local`:

- the text you highlighted;
- the page URL and page title;
- the capture timestamp;
- surrounding page context (~200 characters each side of your selection);
- the table row, if your selection was inside a table;
- the case label you typed.

This data never leaves your machine. It is not transmitted to Full Circle
Asset Recovery LLC or to anyone else. It is readable only by you, in the
SourceStamp popup, and deletable by you at any time (remove receipts in the
popup, or remove the extension to wipe everything).

## What SourceStamp does NOT do

- No network requests (no fetch, XHR, beacons, or websockets — grep the source).
- No remote code execution; all code ships in the extension package.
- No analytics, tracking, fingerprinting, or advertising identifiers.
- No sale or sharing of user data — there is nothing to sell or share.
- No access to your other extensions, passwords, or browsing history.
  SourceStamp reads page content **only** on the page you are viewing, and
  **only** when you press the capture hotkey.

## Permissions explained

| Permission | Why SourceStamp needs it |
|---|---|
| `storage` | Save your receipts and case labels locally. |
| `activeTab` | Read your text selection on the current page when you press the hotkey. |
| Content script on all URLs | The capture hotkey must work on whichever official portal or records page you are researching. It reads the page only at the moment you invoke it. |

## Changes

Any change to this policy is committed publicly to the repository above with
a new effective date.

SourceStamp is provided under the Apache License 2.0 by Full Circle Asset
Recovery LLC.
