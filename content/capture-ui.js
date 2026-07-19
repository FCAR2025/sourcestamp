(function initializeCaptureUi(globalScope) {
  "use strict";

  const PANEL_STYLES = `
    :host {
      --ss-paper: #f4f0e6;
      --ss-surface: #fffdf8;
      --ss-ink: #192326;
      --ss-muted: #5d686b;
      --ss-line: #c9c1b3;
      --ss-accent: #23645f;
      --ss-accent-strong: #184b48;
      --ss-danger: #a13e36;
      --ss-success: #2e6542;
      --ss-focus: #2f7772;
      --ss-radius-sm: 4px;
      --ss-radius-md: 8px;
      --ss-radius-lg: 12px;
      --ss-space-1: 4px;
      --ss-space-2: 8px;
      --ss-space-3: 12px;
      --ss-space-4: 16px;
      --ss-space-5: 20px;
      --ss-space-6: 24px;
      --ss-space-8: 32px;
      --ss-panel-width: 360px;
      --ss-panel-max-height: calc(100vh - 32px);
      --ss-font-xs: 11px;
      --ss-font-sm: 13px;
      --ss-font-md: 15px;
      --ss-font-lg: 21px;
      --ss-duration-fast: 140ms;
      --ss-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
      --ss-shadow: 0 0 0 1px rgb(25 35 38 / 8%), 0 8px 18px rgb(25 35 38 / 12%), 0 24px 48px rgb(25 35 38 / 16%);
      color-scheme: light dark;
      font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: var(--ss-font-md);
      line-height: 1.45;
    }

    * {
      box-sizing: border-box;
    }

    .panel {
      width: min(var(--ss-panel-width), calc(100vw - var(--ss-space-8)));
      max-height: var(--ss-panel-max-height);
      overflow: auto;
      color: var(--ss-ink);
      background: var(--ss-surface);
      border: 1px solid var(--ss-line);
      border-radius: var(--ss-radius-lg);
      box-shadow: var(--ss-shadow);
    }

    .panel-header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--ss-space-4);
      align-items: start;
      padding: var(--ss-space-5) var(--ss-space-5) var(--ss-space-4);
      border-top: var(--ss-space-1) solid var(--ss-accent);
    }

    .kicker,
    .field-label {
      display: block;
      color: var(--ss-muted);
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: var(--ss-font-xs);
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h2 {
      margin: var(--ss-space-1) 0 0;
      font-family: ui-serif, Georgia, Cambria, "Times New Roman", serif;
      font-size: var(--ss-font-lg);
      font-weight: 650;
      line-height: 1.2;
    }

    .icon-button {
      width: var(--ss-space-8);
      height: var(--ss-space-8);
      padding: 0;
      color: var(--ss-muted);
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--ss-radius-md);
      font-size: var(--ss-font-lg);
      line-height: 1;
    }

    .selection-block {
      margin: 0 var(--ss-space-5);
      padding: var(--ss-space-3) var(--ss-space-4);
      background: var(--ss-paper);
      border-left: var(--ss-space-1) solid var(--ss-accent);
      border-radius: var(--ss-radius-sm);
    }

    blockquote {
      max-height: 96px;
      margin: var(--ss-space-2) 0 0;
      overflow: auto;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: var(--ss-font-sm);
      line-height: 1.5;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    blockquote.is-empty {
      color: var(--ss-danger);
      font-family: inherit;
      font-style: normal;
    }

    form {
      display: grid;
      gap: var(--ss-space-3);
      padding: var(--ss-space-5);
    }

    .field-group {
      display: grid;
      gap: var(--ss-space-2);
    }

    select,
    input,
    button {
      min-height: 40px;
      color: inherit;
      font: inherit;
    }

    select,
    input {
      width: 100%;
      padding: var(--ss-space-2) var(--ss-space-3);
      background: var(--ss-surface);
      border: 1px solid var(--ss-line);
      border-radius: var(--ss-radius-md);
      outline: none;
    }

    select:focus-visible,
    input:focus-visible,
    button:focus-visible {
      outline: 3px solid color-mix(in srgb, var(--ss-focus) 36%, transparent);
      outline-offset: 2px;
    }

    .separator {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: var(--ss-space-2);
      align-items: center;
      color: var(--ss-muted);
      font-size: var(--ss-font-xs);
      text-transform: uppercase;
    }

    .separator::before,
    .separator::after {
      height: 1px;
      background: var(--ss-line);
      content: "";
    }

    .status {
      min-height: 20px;
      margin: 0;
      color: var(--ss-muted);
      font-size: var(--ss-font-sm);
    }

    .status[data-kind="error"] {
      color: var(--ss-danger);
    }

    .status[data-kind="success"] {
      color: var(--ss-success);
    }

    .actions {
      display: grid;
      grid-template-columns: 1fr 1.4fr;
      gap: var(--ss-space-2);
    }

    button {
      cursor: pointer;
      border: 1px solid var(--ss-line);
      border-radius: var(--ss-radius-md);
      transition: transform var(--ss-duration-fast) var(--ss-ease-out), background-color var(--ss-duration-fast) var(--ss-ease-out), border-color var(--ss-duration-fast) var(--ss-ease-out), color var(--ss-duration-fast) var(--ss-ease-out);
    }

    button:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    button:active:not(:disabled) {
      transform: scale(0.98);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.52;
    }

    .secondary-button {
      background: var(--ss-surface);
    }

    .primary-button {
      color: var(--ss-surface);
      background: var(--ss-accent);
      border-color: var(--ss-accent);
      font-weight: 700;
    }

    .primary-button:hover:not(:disabled) {
      background: var(--ss-accent-strong);
      border-color: var(--ss-accent-strong);
    }

    [hidden] {
      display: none;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --ss-paper: #20292b;
        --ss-surface: #131a1c;
        --ss-ink: #edf1ed;
        --ss-muted: #aab4b4;
        --ss-line: #394547;
        --ss-accent: #72b7ae;
        --ss-accent-strong: #8ac9c1;
        --ss-danger: #f09a90;
        --ss-success: #91cca4;
        --ss-focus: #83c8bf;
        --ss-shadow: 0 0 0 1px rgb(237 241 237 / 7%), 0 8px 18px rgb(0 0 0 / 26%), 0 24px 48px rgb(0 0 0 / 34%);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        scroll-behavior: auto !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;

  const PANEL_MARKUP = `
    <section class="panel" role="dialog" aria-modal="false" aria-labelledby="ss-title">
      <header class="panel-header">
        <div>
          <span class="kicker">SourceStamp</span>
          <h2 id="ss-title">Which case does this belong to?</h2>
        </div>
        <button class="icon-button" type="button" data-close aria-label="Close SourceStamp">×</button>
      </header>
      <div class="selection-block">
        <span class="field-label">Selected fact</span>
        <blockquote data-selection></blockquote>
      </div>
      <form novalidate>
        <div class="field-group" data-existing-group>
          <label class="field-label" for="ss-case-select">Existing case</label>
          <select id="ss-case-select" data-case-select>
            <option value="">Select a case</option>
          </select>
        </div>
        <div class="separator" data-separator><span>or</span></div>
        <div class="field-group">
          <label class="field-label" for="ss-new-case" data-new-case-label>New case label</label>
          <input id="ss-new-case" data-new-case autocomplete="off" placeholder="Smith foreclosure 24CV123">
        </div>
        <p class="status" data-status role="status" aria-live="polite"></p>
        <div class="actions">
          <button class="secondary-button" type="button" data-cancel>Cancel</button>
          <button class="primary-button" type="submit" data-save>Save receipt</button>
        </div>
      </form>
    </section>
  `;

  let activeHost = null;

  function closePanel() {
    activeHost?.remove();
    activeHost = null;
  }

  function isOpen() {
    return Boolean(activeHost?.isConnected);
  }

  function populateCases(select, cases) {
    for (const caseLabel of cases) {
      const option = document.createElement("option");
      option.value = caseLabel;
      option.textContent = caseLabel;
      select.append(option);
    }
  }

  function createPanel(capture, cases) {
    const host = document.createElement("sourcestamp-capture-panel");
    host.style.setProperty("all", "initial", "important");
    host.style.setProperty("display", "block", "important");
    host.style.setProperty("position", "fixed", "important");
    host.style.setProperty("top", "16px", "important");
    host.style.setProperty("right", "16px", "important");
    host.style.setProperty("z-index", "2147483647", "important");

    const shadow = host.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = PANEL_STYLES;
    const container = document.createElement("div");
    container.innerHTML = PANEL_MARKUP;
    shadow.append(style, container);

    const selection = shadow.querySelector("[data-selection]");
    selection.textContent = capture.selection || "No highlighted text found.";
    selection.classList.toggle("is-empty", !capture.selection);

    const select = shadow.querySelector("[data-case-select]");
    populateCases(select, cases);
    shadow.querySelector("[data-existing-group]").hidden = cases.length === 0;
    shadow.querySelector("[data-separator]").hidden = cases.length === 0;
    shadow.querySelector("[data-new-case-label]").textContent =
      cases.length === 0 ? "Create the first case" : "New case label";

    return { host, shadow, select };
  }

  function setStatus(status, message, kind = "") {
    status.textContent = message;
    status.dataset.kind = kind;
  }

  function selectedCaseLabel(select, newCaseInput) {
    return newCaseInput.value.trim() || select.value;
  }

  function submitReceipt({ event, capture, select, newCaseInput, onSave, setSaving, status, saveButton }) {
    event.preventDefault();
    const caseLabel = selectedCaseLabel(select, newCaseInput);
    if (!caseLabel || !capture.selection) {
      return;
    }

    setSaving(true);
    setStatus(status, "Saving to this browser…");
    onSave(caseLabel)
      .then(() => {
        saveButton.textContent = "Saved";
        setStatus(status, "Receipt saved locally.", "success");
        globalScope.setTimeout(closePanel, 450);
      })
      .catch((error) => {
        setSaving(false);
        const message = error instanceof Error ? error.message : "The receipt could not be saved. Try again.";
        setStatus(status, message, "error");
      });
  }

  function wirePanel(elements, { capture, cases, initialError, onSave }) {
    const { host, shadow, select } = elements;
    const form = shadow.querySelector("form");
    const newCaseInput = shadow.querySelector("[data-new-case]");
    const saveButton = shadow.querySelector("[data-save]");
    const cancelButton = shadow.querySelector("[data-cancel]");
    const closeButton = shadow.querySelector("[data-close]");
    const status = shadow.querySelector("[data-status]");
    let saving = false;

    function updateSaveState() {
      saveButton.disabled = saving || !capture.selection || !selectedCaseLabel(select, newCaseInput);
    }

    function setSaving(nextSaving) {
      saving = nextSaving;
      select.disabled = nextSaving;
      newCaseInput.disabled = nextSaving;
      cancelButton.disabled = nextSaving;
      closeButton.disabled = nextSaving;
      saveButton.textContent = nextSaving ? "Saving…" : "Save receipt";
      updateSaveState();
    }

    const openingMessage = initialError || (!capture.selection ? "Highlight text on the page, then try again." : "");
    setStatus(status, openingMessage, openingMessage ? "error" : "");
    updateSaveState();

    select.addEventListener("change", updateSaveState);
    newCaseInput.addEventListener("input", updateSaveState);
    cancelButton.addEventListener("click", closePanel);
    closeButton.addEventListener("click", closePanel);
    shadow.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !saving) {
        closePanel();
      }
    });

    form.addEventListener("submit", (event) => {
      submitReceipt({
        event,
        capture,
        select,
        newCaseInput,
        onSave,
        setSaving,
        status,
        saveButton,
      });
    });

    globalScope.queueMicrotask(() => (cases.length ? select : newCaseInput).focus());
    document.documentElement.append(host);
  }

  function open(options) {
    if (isOpen()) {
      return;
    }

    const elements = createPanel(options.capture, options.cases);
    activeHost = elements.host;
    wirePanel(elements, options);
  }

  globalScope.SourceStampCaptureUI = Object.freeze({ isOpen, open });
})(globalThis);
