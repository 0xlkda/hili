let READ_ONLY_NODES = [
  'HEAD',
  'META',
  'COMMENT',
  'SCRIPT',
  'NOSCRIPT',
  'STYLE',
  'MARK',
  'INPUT',
  'SELECT',
]

let ChangableFilter = {
  acceptNode: (node) => {
    return READ_ONLY_NODES.includes(node.parentNode.tagName)
      ? NodeFilter.FILTER_SKIP
      : NodeFilter.FILTER_ACCEPT
  }
}

let Tracker = {
  createTracker() {
    this.count = 0
    this.history = '\n'
    this.nodes = new Set()
    this.nodeValues = new Map()
    return this
  },
  track(node) {
    this.count += 1 
    this.history += `${node.nodeName}: ${node.nodeValue}\n`
    this.nodes.add(node)
    this.nodeValues.set(node, node.nodeValue)
  },
}

let TransformWalker = ({ transform }) => {
  const walk = (node) => {
    let tracker = Tracker.createTracker()
    let walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, ChangableFilter)

    while(node = walker.nextNode()) {
      tracker.track(node)
    }

    tracker.nodes.forEach(transform)
  }

  return { walk }
}

let highlight = new Highlight()
CSS.highlights.set("hili-highlight", highlight)

let censored = new Highlight()
CSS.highlights.set("hili-censored", censored)

let Hili = {
  highlight,
  censored,

  clear: () => {
    highlight.clear()
    censored.clear()
  },
  mark: (node, { transform }) => {
    TransformWalker({ transform }).walk(node)
  },
}
