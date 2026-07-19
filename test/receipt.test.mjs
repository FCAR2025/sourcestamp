import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);

function loadReceiptModule() {
  try {
    return require("../lib/receipt.js");
  } catch (error) {
    if (error?.code === "MODULE_NOT_FOUND") {
      return {};
    }
    throw error;
  }
}

test("exports a receipt builder", () => {
  const receiptModule = loadReceiptModule();

  assert.equal(typeof receiptModule.buildReceipt, "function");
});

test("builds a receipt with every required field", () => {
  const { buildReceipt } = loadReceiptModule();
  const receipt = buildReceipt({
    id: "95c3bcde-478a-4e59-9617-5ff0fc39a8aa",
    caseLabel: "Smith foreclosure 24CV123",
    selection: "$42,500.00",
    url: "https://records.example/case/24CV123",
    pageTitle: "Case detail",
    capturedAt: "2026-07-19T12:34:56.000Z",
    context: "Judgment amount $42,500.00 entered by the court.",
    tableRow: ["Judgment amount", "$42,500.00"],
    fragment: "#:~:text=%2442%2C500.00",
  });

  assert.deepEqual(receipt, {
    id: "95c3bcde-478a-4e59-9617-5ff0fc39a8aa",
    case_label: "Smith foreclosure 24CV123",
    selection: "$42,500.00",
    url: "https://records.example/case/24CV123",
    page_title: "Case detail",
    captured_at: "2026-07-19T12:34:56.000Z",
    context: "Judgment amount $42,500.00 entered by the court.",
    table_row: ["Judgment amount", "$42,500.00"],
    fragment: "#:~:text=%2442%2C500.00",
  });
});

test("preserves a null table row", () => {
  const { buildReceipt } = loadReceiptModule();
  const receipt = buildReceipt({
    id: "d1f746bd-5aa9-4557-aa0f-e44f3dbc4cee",
    caseLabel: "County surplus list",
    selection: "Jane Doe",
    url: "https://records.example/surplus",
    pageTitle: "Surplus records",
    capturedAt: "2026-07-19T13:00:00.000Z",
    context: "Owner of record Jane Doe appears in the notice.",
    tableRow: null,
    fragment: "#:~:text=Jane%20Doe",
  });

  assert.equal(receipt.table_row, null);
});

test("renders the complete citation block", () => {
  const { renderCitation } = loadReceiptModule();
  const citation = renderCitation({
    id: "d1f746bd-5aa9-4557-aa0f-e44f3dbc4cee",
    case_label: "County surplus list",
    selection: "Jane Doe",
    url: "https://records.example/surplus",
    page_title: "Surplus records",
    captured_at: "2026-07-19T13:00:00.000Z",
    context: "Owner of record Jane Doe appears in the notice.",
    table_row: null,
    fragment: "#:~:text=Jane%20Doe",
  });

  assert.equal(
    citation,
    [
      "[SourceStamp receipt]",
      'Fact: "Jane Doe"',
      "Source: Surplus records — https://records.example/surplus",
      "Captured: 2026-07-19T13:00:00.000Z (UTC)",
      "Context: …Owner of record Jane Doe appears in the notice.…",
      "Case: County surplus list",
      "Captured with SourceStamp (open source)",
    ].join("\n"),
  );
});
