let READ_ONLY_NODES = [
  'HEAD',
  'META',
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

let Hili = {
  clearAll: () => {
    const marks = document.querySelectorAll('mark#hili')
    marks.forEach((node) => Hili.clear(node))
  },
  clear: (node) => {
    let parent = node.parentNode
    node.replaceWith(node.textContent)
    parent?.normalize()
  },
  mark: (node, { transform }) => {
    TransformWalker({ transform }).walk(node)
  },
}
