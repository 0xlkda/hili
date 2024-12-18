var escapeHTMLPolicy = trustedTypes.createPolicy("forceInner", {
  createHTML: (to_escape) => to_escape,
})

var IsTextNode = (node) => node.nodeType === 3
var IsMarked = (node) => node.parentNode?.nodeName === "MARK"
var IsScriptTag = (node) => node.parentNode?.nodeName === "SCRIPT"
var IsNoScriptTag = (node) => node.parentNode?.nodeName === "NOSCRIPT"
var IsStyleTag = (node) => node.parentNode?.nodeName === "STYLE"
var IsFormTag = (node) => node.parentNode?.nodeName === "FORM"
var IsInput = (node) =>
  node.parentNode?.nodeName === "TEXTAREA" ||
  node.parentNode?.nodeName === "INPUT"

var IsValidNode = (node) => [IsScriptTag, IsNoScriptTag, IsStyleTag, IsFormTag, IsMarked, IsInput].every((test) => !test(node))
var Element = (tag, html) => {
  const element = document.createElement(tag)
  element.innerHTML = html
  return element
}

function replaceWords(node, matches, replacement) {
  let input = node.innerHTML || ""
  return matches.reduce(
    (str, match) => str.replaceAll(match, replacement(match)),
    input,
  )
}

var Walker = ({ matcher, transformer }) => {
  const walk = (node) => {
    if (IsTextNode(node) && IsValidNode(node)) {
      const matches = matcher(node)
      if (matches) {
        const targetNode = node.parentNode ?? node
        const newValue = transformer(targetNode, matches)
        targetNode.innerHTML = newValue
      }
    } else node.childNodes.forEach(walk)
  }

  return {
    walk,
  }
}

var Hili = {
  mark:
    (node) =>
    ({ keywords }) => {
      if (!keywords?.length) return
      const regex = new RegExp(`(${keywords.join("|")})`, "gi")
      const transformer = (node, matches) => replaceWords(node, matches, (word) => `<mark id="hili">${word}</mark>`)
      const matcher = (node) => node.nodeValue.match(regex)
      const walker = Walker({ matcher, transformer })

      walker.walk(node)
    },
  clear: () => {
    const marks = document.querySelectorAll("mark#hili")
    marks.forEach((node) => (node.outerHTML = node.textContent))
  },
}
