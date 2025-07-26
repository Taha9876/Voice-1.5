document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("startButton")
  const stopButton = document.getElementById("stopButton")
  const statusDiv = document.getElementById("status")
  const transcriptDiv = document.getElementById("transcript")

  let recognition
  let isListening = false

  // Check for SpeechRecognition API support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const chrome = window.chrome // Declare the chrome variable

  if (SpeechRecognition) {
    recognition = new SpeechRecognition()
    recognition.continuous = false // Listen for a single utterance
    recognition.interimResults = false // Only return final results
    recognition.lang = "en-US"

    recognition.onstart = () => {
      isListening = true
      statusDiv.textContent = "Listening..."
      startButton.disabled = true
      stopButton.disabled = false
      transcriptDiv.textContent = ""
    }

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript
      transcriptDiv.textContent = `Heard: "${speechResult}"`
      statusDiv.textContent = "Processing command..."

      // Send the command to the content script (which will then send it to the Next.js app)
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              action: "VOICE_COMMAND_FROM_EXTENSION",
              command: speechResult,
            },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error("Error sending message to content script:", chrome.runtime.lastError.message)
                statusDiv.textContent = `Error: ${chrome.runtime.lastError.message}`
              } else {
                console.log("Response from content script:", response)
                statusDiv.textContent = "Command sent!"
              }
            },
          )
        }
      })
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      statusDiv.textContent = `Error: ${event.error}`
      isListening = false
      startButton.disabled = false
      stopButton.disabled = true
    }

    recognition.onend = () => {
      if (isListening) {
        // Only update status if it wasn't stopped manually
        statusDiv.textContent = "Ready"
      }
      isListening = false
      startButton.disabled = false
      stopButton.disabled = true
    }

    startButton.addEventListener("click", () => {
      if (!isListening) {
        recognition.start()
      }
    })

    stopButton.addEventListener("click", () => {
      if (isListening) {
        recognition.stop()
        statusDiv.textContent = "Stopped."
      }
    })

    // Listen for messages from the content script (responses from Next.js app)
    window.addEventListener("message", (event) => {
      if (event.source !== window) return
      if (event.data.type === "VOICE_COMMAND_RESPONSE_TO_EXTENSION") {
        console.log("Popup received response from content script:", event.data.response)
        if (event.data.response && event.data.response.speech) {
          statusDiv.textContent = `Response: ${event.data.response.speech}`
        } else if (event.data.error) {
          statusDiv.textContent = `Error: ${event.data.error}`
        } else {
          statusDiv.textContent = "Command processed."
        }
      }
    })
  } else {
    statusDiv.textContent = "Speech Recognition not supported in this browser."
    startButton.disabled = true
    stopButton.disabled = true
  }
})
