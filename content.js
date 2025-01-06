const NOOP = void 0
const CLONE_DEEP = (node) => node.cloneNode(true)

function onNodeMutated(targetNode, { added, removed }) {
  const config = { subtree: true, childList: true }
  const observer = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) { 
          if (node.getRootNode() !== document) continue
          added(node)
        }

        for (const node of mutation.removedNodes) { 
          if (node.getRootNode() !== document) continue
          removed(node)
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

function createFragment(html) {
  return document.createRange().createContextualFragment(html)
}
    
function hili(node) {
  chrome.storage.sync.get(["ignoreUrls", "highlighted", "censored"], ({ ignoreUrls, highlighted, censored }) => {
    let match = url => pattern => RegExp(pattern).test(url)
    let IGNORED = ignoreUrls.some(match(window.location.href))
    let HIGHLIGHTED_REGEX = new RegExp(`(${highlighted.join('|')})`, 'gui')
    let CENSORED_REGEX = new RegExp(`(${censored.join('|')})`, 'gui')

    function makeRanges(regexExec) {
      let ranges = new Set()

      while (match = regexExec()) {
        let startIndex = match.index
        let endIndex = startIndex + match[0].length

        if (startIndex >= 0) {
          let range = new Range()
          range.applyTo = (node) => {
            range.setStart(node, startIndex)
            range.setEnd(node, endIndex)
          }
          ranges.add(range)
        }
      }

      return ranges
    }

    function transform(node, originHTML) {
      let oldHTML = node.nodeValue

      for (const range of makeRanges(() => HIGHLIGHTED_REGEX.exec(oldHTML))) {
        range.applyTo(node)
        Hili.highlight.add(range)
      }

      for (const range of makeRanges(() => CENSORED_REGEX.exec(oldHTML))) {
        range.applyTo(node)
        Hili.censored.add(range)
      }
    }

    if (IGNORED) NOOP
    else Hili.mark(node, { transform })
  })
}

// Hi buddy!
hili(document.body)
onClear(() => Hili.clear())
onSaved(() => {
  Hili.clear()
  hili(document.body)
})
onNodeMutated(document.body, { 
  added: (node) => hili(node),
  removed: (node) => NOOP
})
