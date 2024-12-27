var ChromeStorage = {
  save: (data, callback) => chrome.storage.sync.set(data, callback),
  load: (data, callback) => chrome.storage.sync.get(data, callback),
}

chrome.storage.sync.get("mode", ({ mode }) => {
  const radios = document.querySelectorAll('input[name="mode"]')
  radios.forEach(radio => {
    radio.checked = radio.value === mode
  })
})

chrome.storage.sync.get("keywords", ({ keywords }) => {
  if (!keywords?.length) return
  document.getElementById("keywords").value = keywords.join("\n")
})

chrome.storage.sync.get("ignoreUrls", ({ ignoreUrls }) => {
  if (!ignoreUrls?.length) return
  document.getElementById("ignoreUrls").value = ignoreUrls.join("\n")
})

document.getElementById("save").addEventListener("click", () => {
  const modeData = new FormData(document.getElementById("mode"))
  const mode = modeData.get('mode')

  const keywords = document
    .getElementById("keywords")
    .value.split("\n")
    .filter(Boolean)

  const ignoreUrls = document
    .getElementById("ignoreUrls")
    .value.split("\n")
    .filter(Boolean)

  ChromeStorage.save({ keywords, ignoreUrls, mode }, async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    })
    chrome.tabs.sendMessage(tab.id, { keywords_saved: true })
  })
})
