(function initializePopup() {
  "use strict";

  const CASES_KEY = "cases";
  const RECEIPT_KEY_PREFIX = "receipts:";
  const elements = {
    caseForm: document.querySelector("#case-form"),
    caseInput: document.querySelector("#new-case"),
    addCaseButton: document.querySelector("#add-case"),
    caseError: document.querySelector("#case-error"),
    caseSelect: document.querySelector("#case-select"),
    caseCount: document.querySelector("#case-count"),
    receiptCount: document.querySelector("#receipt-count"),
    emptyState: document.querySelector("#empty-state"),
    receiptList: document.querySelector("#receipt-list"),
    appStatus: document.querySelector("#app-status"),
  };
  let caseLabels = [];

  function caseStorageKey(caseLabel) {
    return `${RECEIPT_KEY_PREFIX}${encodeURIComponent(caseLabel)}`;
  }

  function uniqueCaseLabels(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    return [...new Set(value.filter((label) => typeof label === "string" && label.trim()))];
  }

  function pluralize(count, singular) {
    return `${count} ${singular}${count === 1 ? "" : "s"}`;
  }

  function setAppStatus(message, kind = "") {
    elements.appStatus.textContent = message;
    elements.appStatus.dataset.kind = kind;
  }

  function renderCaseOptions(selectedCase = "") {
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = caseLabels.length ? "Choose a case" : "No cases yet";
    elements.caseSelect.replaceChildren(placeholder);

    for (const caseLabel of caseLabels) {
      const option = document.createElement("option");
      option.value = caseLabel;
      option.textContent = caseLabel;
      elements.caseSelect.append(option);
    }

    elements.caseSelect.disabled = caseLabels.length === 0;
    elements.caseSelect.value = selectedCase;
    elements.caseCount.textContent = pluralize(caseLabels.length, "case");
  }

  function addMetadataRow(list, label, value, className = "") {
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.textContent = value;
    description.className = className;
    list.append(term, description);
  }

  function copyCitation(receipt, button) {
    const citation = SourceStampReceipt.renderCitation(receipt);
    button.disabled = true;
    button.textContent = "Copying…";
    setAppStatus("Copying citation…");

    navigator.clipboard
      .writeText(citation)
      .then(() => {
        button.textContent = "Copied";
        setAppStatus("Citation copied.", "success");
        window.setTimeout(() => {
          button.disabled = false;
          button.textContent = "Copy citation";
        }, 900);
      })
      .catch((error) => {
        button.disabled = false;
        button.textContent = "Copy citation";
        const message = error instanceof Error ? error.message : "Clipboard access was unavailable.";
        setAppStatus(`Could not copy the citation: ${message}`, "error");
      });
  }

  function createReceiptCard(receipt) {
    const item = document.createElement("li");
    const article = document.createElement("article");
    article.className = "receipt-card";

    const fact = document.createElement("blockquote");
    fact.className = "receipt-fact";
    fact.textContent = `“${receipt.selection}”`;

    const metadata = document.createElement("dl");
    metadata.className = "receipt-meta";
    addMetadataRow(metadata, "Source", `${receipt.page_title} — ${receipt.url}`);
    addMetadataRow(metadata, "Captured", `${receipt.captured_at} UTC`);
    addMetadataRow(metadata, "Context", receipt.context, "receipt-context");
    if (Array.isArray(receipt.table_row)) {
      addMetadataRow(metadata, "Table row", receipt.table_row.join(" | "));
    }

    const copyButton = document.createElement("button");
    copyButton.className = "copy-button";
    copyButton.type = "button";
    copyButton.textContent = "Copy citation";
    copyButton.addEventListener("click", () => copyCitation(receipt, copyButton));

    article.append(fact, metadata, copyButton);
    item.append(article);
    return item;
  }

  function renderReceipts(receipts, selectedCase) {
    elements.receiptList.replaceChildren();
    for (const receipt of [...receipts].reverse()) {
      elements.receiptList.append(createReceiptCard(receipt));
    }

    elements.receiptCount.textContent = pluralize(receipts.length, "receipt");
    elements.emptyState.hidden = receipts.length > 0;
    elements.emptyState.textContent = selectedCase
      ? "No receipts in this case yet. Highlight a fact on any page and press Alt+S."
      : "Create a case, then capture highlighted text with Alt+S.";
  }

  async function selectCase(caseLabel) {
    elements.caseSelect.value = caseLabel;
    if (!caseLabel) {
      renderReceipts([], "");
      return;
    }

    const receiptKey = caseStorageKey(caseLabel);
    const stored = await chrome.storage.local.get({ [receiptKey]: [] });
    const receipts = Array.isArray(stored[receiptKey]) ? stored[receiptKey] : [];
    renderReceipts(receipts, caseLabel);
  }

  async function addCase(caseLabel) {
    const stored = await chrome.storage.local.get({ [CASES_KEY]: [] });
    caseLabels = uniqueCaseLabels(stored[CASES_KEY]);
    if (!caseLabels.includes(caseLabel)) {
      caseLabels = [...caseLabels, caseLabel];
      await chrome.storage.local.set({ [CASES_KEY]: caseLabels });
    }

    renderCaseOptions(caseLabel);
    await selectCase(caseLabel);
  }

  elements.caseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const caseLabel = elements.caseInput.value.trim();
    elements.caseError.textContent = "";
    if (!caseLabel) {
      elements.caseError.textContent = "Enter a case label.";
      elements.caseInput.focus();
      return;
    }

    elements.addCaseButton.disabled = true;
    elements.caseInput.disabled = true;
    setAppStatus("Saving case…");
    try {
      await addCase(caseLabel);
      elements.caseInput.value = "";
      setAppStatus("Case saved locally.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Local storage was unavailable.";
      elements.caseError.textContent = `Could not save the case: ${message}`;
      setAppStatus("Case was not saved.", "error");
    } finally {
      elements.addCaseButton.disabled = false;
      elements.caseInput.disabled = false;
    }
  });

  elements.caseSelect.addEventListener("change", () => {
    setAppStatus("");
    selectCase(elements.caseSelect.value).catch((error) => {
      const message = error instanceof Error ? error.message : "Local storage was unavailable.";
      setAppStatus(`Could not load receipts: ${message}`, "error");
    });
  });

  async function initialize() {
    const stored = await chrome.storage.local.get({ [CASES_KEY]: [] });
    caseLabels = uniqueCaseLabels(stored[CASES_KEY]);
    const initialCase = caseLabels[0] ?? "";
    renderCaseOptions(initialCase);
    await selectCase(initialCase);
    if (!initialCase) {
      elements.caseInput.focus();
    }
  }

  initialize().catch((error) => {
    const message = error instanceof Error ? error.message : "Local storage was unavailable.";
    setAppStatus(`Could not open SourceStamp: ${message}`, "error");
  });
})();
