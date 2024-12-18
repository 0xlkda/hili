function hili(node) {
  chrome.storage.sync.get("keywords", Hili.mark(node))
}

function clear_hili(node) {
  chrome.storage.sync.get("keywords", Hili.clear)
}

function onDomChanged(callback, targetNode) {
  const config = { attributes: false, childList: true, subtree: true }
  const observer = new MutationObserver((mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          callback(node)
        }
      }
    }
  })
  observer.observe(targetNode, config)
}

function onKeywordsSaved(callback) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.keywords_saved) callback()
  })
}

// Hi buddy!
chrome.storage.sync.get("ignoreUrls", ({ ignoreUrls }) => {
  const currentUrl = window.location.href
  const shouldIgnore = (url) =>
    ignoreUrls.some((regexString) => {
      const regex = new RegExp(regexString)
      return regex.test(url)
    })
  if (shouldIgnore(currentUrl)) return

  var target = document.body
  hili(target)
  onDomChanged((node) => hili(node), target)
  onKeywordsSaved(() => {
    clear_hili(target)
    hili(target)
  })
})
