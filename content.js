function onDomChanged(targetNode, callback) {
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
  return observer
}

function onKeywordsSaved(callback) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.keywords_saved) callback()
  })
}

function highlight({ ignoreUrls, keywords, mode }) {
  const currentUrl = window.location.href
  const shouldIgnore = (url) => ignoreUrls.some((regexString) => new RegExp(regexString).test(url))
  if (shouldIgnore(currentUrl)) return

  const target = document.body
  const hili = (target) => Hili[mode](target)({ keywords })
  const clear = () => Hili.clear()

  clear()
  hili(target)
  onDomChanged(target, (node) => hili(node))
}

function hi() {
  chrome.storage.sync.get(["ignoreUrls", "keywords", "mode"], highlight)
}

// Hi buddy!
hi()
onKeywordsSaved(() => hi())
