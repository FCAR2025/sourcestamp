"use strict";

const CAPTURE_COMMAND = "capture-selection";
const OPEN_CAPTURE_MESSAGE = "SOURCESTAMP_OPEN_CAPTURE";

function sendCaptureMessage(tabs) {
  const tabId = tabs[0]?.id;
  if (typeof tabId !== "number") {
    return;
  }

  chrome.tabs.sendMessage(tabId, { type: OPEN_CAPTURE_MESSAGE }, () => {
    if (chrome.runtime.lastError) {
      return;
    }
  });
}

function relayCaptureCommand(command) {
  if (command !== CAPTURE_COMMAND) {
    return;
  }

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, sendCaptureMessage);
}

chrome.commands.onCommand.addListener(relayCaptureCommand);
