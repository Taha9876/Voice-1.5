// Declare the chrome variable to fix the lint error
const chrome = window.chrome

chrome.runtime.onInstalled.addListener(() => {
  console.log("Shopify Voice Automation Extension Installed.")
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "executeVoiceCommand") {
    console.log("Background script received command:", request.command)
    // Forward the command to the content script of the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: "processCommandInContentScript",
            command: request.command,
            data: request.data, // Pass along any additional data
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error sending message to content script:", chrome.runtime.lastError.message)
              sendResponse({ success: false, error: chrome.runtime.lastError.message })
            } else {
              sendResponse(response)
            }
          },
        )
      } else {
        sendResponse({ success: false, error: "No active tab found." })
      }
    })
    return true // Indicates that sendResponse will be called asynchronously
  } else if (request.action === "getShopifyContext") {
    console.log("Background script received request for Shopify context.")
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "requestShopifyContext" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error requesting context from content script:", chrome.runtime.lastError.message)
            sendResponse({ success: false, error: chrome.runtime.lastError.message })
          } else {
            sendResponse(response)
          }
        })
      } else {
        sendResponse({ success: false, error: "No active tab found." })
      }
    })
    return true // Indicates that sendResponse will be called asynchronously
  }
})
