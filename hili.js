let escapeHTMLPolicy = trustedTypes.createPolicy("forceInner", {
  createHTML: (to_escape) => to_escape,
})

let IsTextNode = (node) => node.nodeType === 3
let IsMarked = (node) => node.parentNode?.nodeName === "MARK"
let IsScriptTag = (node) => node.parentNode?.nodeName === "SCRIPT"
let IsNoScriptTag = (node) => node.parentNode?.nodeName === "NOSCRIPT"
let IsStyleTag = (node) => node.parentNode?.nodeName === "STYLE"
let IsFormTag = (node) => node.parentNode?.nodeName === "FORM"
let IsImgTag = (node) => node.nodeName === "IMG"
let IsInput = (node) =>
  node.parentNode?.nodeName === "TEXTAREA" ||
  node.parentNode?.nodeName === "INPUT"

let IsValidNode = (node) => [IsScriptTag, IsNoScriptTag, IsStyleTag, IsFormTag, IsMarked, IsInput].every((restrict) => !restrict(node))
let Element = (tag, html) => {
  const element = document.createElement(tag)
  element.innerHTML = html
  return element
}

let XML = new XMLSerializer()

function replaceWords(node, matches, replacement) {
  let restore = (node) => XML.serializeToString(node)
  let replace = (node, match) => node.nodeValue = node.nodeValue.replaceAll(match, replacement(match))

  let nodes = Array.from(node.childNodes)
  let isTextNodes = nodes.map(IsTextNode)
  let newNodes = matches.flatMap((match) => nodes.map((node, index) => 
    isTextNodes[index] 
      ? replace(node, match) 
      : restore(node)))

  return newNodes.join('')
}

let Walker = ({ matcher, transformer }) => {
  const walk = (node) => {
    if (IsTextNode(node) && IsValidNode(node)) {
      const matches = matcher(node)
      if (matches) {
        const targetNode = node.parentNode ?? node
        targetNode.innerHTML = transformer(targetNode, matches)
      }
    } else node.childNodes.forEach(walk)
  }

  return {
    walk,
  }
}

let Hili = {
  mark:
    (node) => ({ keywords }) => {
      if (!keywords?.length) return 
      // console.log('mark!')
      const regex = new RegExp(`(${keywords.join("|")})`, "gi")
      const transformer = (node, matches) => replaceWords(node, matches, (word) => `<mark id="hili">${word}</mark>`)
      const matcher = (node) => node.nodeValue.match(regex)
      const walker = Walker({ matcher, transformer })

      walker.walk(node)
    },
  hide:
    (node) =>
    ({ keywords }) => {
      if (!keywords?.length) return
      // console.log('hide!')
      const regex = new RegExp(`(${keywords.join("|")})`, "gi")
      const transformer = (node, matches) => replaceWords(node, matches, (word) => `<mark id="hili" class="hide">${word}</mark>`)
      const matcher = (node) => node.nodeValue.match(regex)
      const walker = Walker({ matcher, transformer })

      walker.walk(node)
    },
  clear: () => {
    // console.log('clear!')
    const marks = document.querySelectorAll("mark#hili")
    marks.forEach((node) => {
      node.classList.remove('hide')
      node.outerHTML = node.textContent
    })
  },
}
