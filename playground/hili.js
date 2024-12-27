let TransformWalker = ({ transform }) => {
  const walk = (node) => {
    let walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
    while(node = walker.nextNode()) { transform(node) }
  }

  return { walk }
}

let Hili = {
  clear: () => {
    console.log('clear!')
    const marks = document.querySelectorAll('mark#hili')
    marks.forEach((node) => {
      node.classList.remove('hide')
      node.outerHTML = node.textContent
    })
  },
  mark: (node, { transform }) => TransformWalker({ transform }).walk(node),
}
