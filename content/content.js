(function initializeSelectionCapture() {
  "use strict";

  const CASES_KEY = "cases";
  const RECEIPT_KEY_PREFIX = "receipts:";
  const OPEN_CAPTURE_MESSAGE = "SOURCESTAMP_OPEN_CAPTURE";
  const CONTEXT_SIDE_LENGTH = 200;
  const FRAGMENT_TEXT_LIMIT = 300;
  let panelRequestPending = false;

  function normalizeText(value) {
    return value.replace(/\s+/gu, " ").trim();
  }

  function contextContainerFor(range, minimumLength) {
    let container = range.commonAncestorContainer;
    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentNode;
    }

    while (
      container?.parentNode &&
      container.parentNode.nodeType !== Node.DOCUMENT_NODE &&
      (container.textContent?.length ?? 0) < minimumLength
    ) {
      container = container.parentNode;
    }

    return container;
  }

  function buildContext(range, selectedText) {
    const normalizedSelection = normalizeText(selectedText);
    const minimumLength = normalizedSelection.length + CONTEXT_SIDE_LENGTH * 2;
    const container = contextContainerFor(range, minimumLength);

    try {
      const beforeRange = document.createRange();
      beforeRange.selectNodeContents(container);
      beforeRange.setEnd(range.startContainer, range.startOffset);

      const afterRange = document.createRange();
      afterRange.selectNodeContents(container);
      afterRange.setStart(range.endContainer, range.endOffset);

      const before = normalizeText(beforeRange.toString()).slice(-CONTEXT_SIDE_LENGTH);
      const after = normalizeText(afterRange.toString()).slice(0, CONTEXT_SIDE_LENGTH);
      return `${before}${before ? " " : ""}${normalizedSelection}${after ? " " : ""}${after}`;
    } catch (error) {
      if (error instanceof DOMException) {
        return normalizedSelection;
      }
      throw error;
    }
  }

  function elementForNode(node) {
    return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  }

  function captureTableRow(range) {
    const row = elementForNode(range.startContainer)?.closest("tr");
    if (!row) {
      return null;
    }

    return Array.from(row.cells, (cell) => normalizeText(cell.textContent ?? ""));
  }

  function buildTextFragment(selectedText) {
    if (!selectedText) {
      return null;
    }

    const fragmentText = selectedText.slice(0, FRAGMENT_TEXT_LIMIT);
    return `#:~:text=${encodeURIComponent(fragmentText)}`;
  }

  function captureSelectedFact() {
    const selection = window.getSelection();
    const baseCapture = {
      url: window.location.href,
      pageTitle: document.title,
      selection: "",
      context: "",
      tableRow: null,
      fragment: null,
    };

    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return baseCapture;
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    if (!selectedText) {
      return baseCapture;
    }

    return {
      ...baseCapture,
      selection: selectedText,
      context: buildContext(range, selectedText),
      tableRow: captureTableRow(range),
      fragment: buildTextFragment(selectedText),
    };
  }

  function caseStorageKey(caseLabel) {
    return `${RECEIPT_KEY_PREFIX}${encodeURIComponent(caseLabel)}`;
  }

  function uniqueCaseLabels(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    return [...new Set(value.filter((label) => typeof label === "string" && label.trim()))];
  }

  function createReceiptId() {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  function saveReceipt(caseLabel, capture) {
    const normalizedCaseLabel = caseLabel.trim();
    if (!normalizedCaseLabel) {
      return Promise.reject(new Error("Enter or select a case before saving."));
    }

    const receiptKey = caseStorageKey(normalizedCaseLabel);
    const receipt = SourceStampReceipt.buildReceipt({
      id: createReceiptId(),
      caseLabel: normalizedCaseLabel,
      selection: capture.selection,
      url: capture.url,
      pageTitle: capture.pageTitle,
      capturedAt: new Date().toISOString(),
      context: capture.context,
      tableRow: capture.tableRow,
      fragment: capture.fragment,
    });

    return new Promise((resolve, reject) => {
      chrome.storage.local.get({ [CASES_KEY]: [], [receiptKey]: [] }, (stored) => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Could not read local receipts: ${chrome.runtime.lastError.message}`));
          return;
        }

        const cases = uniqueCaseLabels(stored[CASES_KEY]);
        const receipts = Array.isArray(stored[receiptKey]) ? stored[receiptKey] : [];
        const nextCases = cases.includes(normalizedCaseLabel)
          ? cases
          : [...cases, normalizedCaseLabel];

        chrome.storage.local.set(
          {
            [CASES_KEY]: nextCases,
            [receiptKey]: [...receipts, receipt],
          },
          () => {
            if (chrome.runtime.lastError) {
              reject(new Error(`Could not save the local receipt: ${chrome.runtime.lastError.message}`));
              return;
            }
            resolve(receipt);
          },
        );
      });
    });
  }

  function openCapturePanel() {
    if (panelRequestPending || SourceStampCaptureUI.isOpen()) {
      return;
    }

    panelRequestPending = true;
    const capture = captureSelectedFact();

    chrome.storage.local.get({ [CASES_KEY]: [] }, (stored) => {
      panelRequestPending = false;
      const storageError = chrome.runtime.lastError;
      const cases = storageError ? [] : uniqueCaseLabels(stored[CASES_KEY]);
      const initialError = storageError
        ? `Could not load local cases: ${storageError.message}`
        : "";

      SourceStampCaptureUI.open({
        capture,
        cases,
        initialError,
        onSave: storageError
          ? () => Promise.reject(new Error("Local storage is unavailable on this page."))
          : (caseLabel) => saveReceipt(caseLabel, capture),
      });
    });
  }

  function isDefaultCaptureHotkey(event) {
    return (
      event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      event.code === "KeyS"
    );
  }

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.repeat || !isDefaultCaptureHotkey(event)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      openCapturePanel();
    },
    true,
  );

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === OPEN_CAPTURE_MESSAGE) {
      openCapturePanel();
    }
  });
})();
