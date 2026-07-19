(function initializeReceiptLibrary(globalScope) {
  "use strict";

  function buildReceipt({
    id,
    caseLabel,
    selection,
    url,
    pageTitle,
    capturedAt,
    context,
    tableRow,
    fragment,
  }) {
    return {
      id,
      case_label: caseLabel,
      selection,
      url,
      page_title: pageTitle,
      captured_at: capturedAt,
      context,
      table_row: tableRow === null ? null : [...tableRow],
      fragment,
    };
  }

  function renderCitation(receipt) {
    return [
      "[SourceStamp receipt]",
      `Fact: "${receipt.selection}"`,
      `Source: ${receipt.page_title} — ${receipt.url}`,
      `Captured: ${receipt.captured_at} (UTC)`,
      `Context: …${receipt.context}…`,
      `Case: ${receipt.case_label}`,
      "Captured with SourceStamp (open source)",
    ].join("\n");
  }

  const receiptApi = Object.freeze({ buildReceipt, renderCitation });
  globalScope.SourceStampReceipt = receiptApi;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = receiptApi;
  }
})(globalThis);
