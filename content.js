function onNewNodeAdded(targetNode, callback) {
  const config = { subtree: true, childList: true }
  const observer = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) { 
          if (node.getRootNode() !== document) continue;
          callback(node)
        }
      }
    }
  })

  observer.observe(targetNode, config)
}

function onClear(callback) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.hili_clear) callback()
  })
}

function onSaved(callback) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.hili_saved) callback()
  })
}

const NOOP = void 0
const CLONE_DEEP = (node) => node.cloneNode(true)
const HIGHLIGHT = (match) => `<mark id="hili" class="HIGHLIGHT">${match}</mark>`
const CENSORED = (match) => `<mark id="hili" class="CENSORED">${match}</mark>`

const MODES = {
  mark: HIGHLIGHT,
  hide: CENSORED
}

function createFragment(html) {
  return document.createRange().createContextualFragment(html)
}
    
function hili(node) {
  chrome.storage.sync.get(["ignoreUrls", "highlighted", "censored"], ({ ignoreUrls, highlighted, censored }) => {
    const match = url => pattern => RegExp(pattern).test(url)
    const IGNORED = ignoreUrls.some(match(window.location.href))
    const HIGHLIGHTED_REGEX = new RegExp(`(${highlighted.join('|')})`, 'gi')
    const CENSORED_REGEX = new RegExp(`(${censored.join('|')})`, 'gi')

    function transform(node, originHTML) {
      let oldHTML = node.nodeValue

      if (HIGHLIGHTED_REGEX.test(oldHTML)) {
        let newHTML = oldHTML.replaceAll(HIGHLIGHTED_REGEX, HIGHLIGHT)
        let fragment = createFragment(newHTML)
        node.replaceWith(fragment)
      }
      
      if (CENSORED_REGEX.test(oldHTML)) {
        let newHTML = oldHTML.replaceAll(CENSORED_REGEX, CENSORED)
        let fragment = createFragment(newHTML)
        node.replaceWith(fragment)
      }
    }

    if (IGNORED) NOOP
    else Hili.mark(node, { transform })
  })
}

// Hi buddy!
hili(document.body)
onNewNodeAdded(document.body, (node) => hili(node))
onSaved(() => {
  Hili.clearAll()
  hili(document.body)
})
onClear(() => {
  Hili.clearAll()
})
