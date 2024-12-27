var ChromeStorage = {
  save: (data, callback) => chrome.storage.sync.set(data, callback),
  load: (data, callback) => chrome.storage.sync.get(data, callback),
}

ChromeStorage.load(["highlighted", "censored", "ignoreUrls"], ({ highlighted, censored, ignoreUrls }) => {
  if (highlighted?.length) {
    document.getElementById("highlighted").value = highlighted.join("\n")
  }

  if (censored?.length) {
    document.getElementById("censored").value = censored.join("\n")
  }

  if (ignoreUrls?.length) {
    document.getElementById("ignoreUrls").value = ignoreUrls.join("\n")
  }
})

document.getElementById("clear").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  })

  chrome.tabs.sendMessage(tab.id, { hili_clear: true })
})

document.getElementById("save").addEventListener("click", () => {
  let getValues = id => document.getElementById(id).value.split("\n").filter(Boolean)
  let highlighted = getValues("highlighted")
  let censored = getValues("censored")
  let ignoreUrls = getValues("ignoreUrls")

  ChromeStorage.save({ highlighted, censored, ignoreUrls }, async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    })
    chrome.tabs.sendMessage(tab.id, { hili_saved: true })
  })
})
