import { CanvasElement, HashtagElement, MarkdownElement, NodeFileElement, WikilinkElement, DisplayElement, EdgeElement, NodeGroupElement, NodeTextElement, FrontMatterElement } from "./elements/index.mjs";
import { configFromWindow } from "./config.mjs";

customElements.define("x-node-file", NodeFileElement)
customElements.define("x-node-text", NodeTextElement)
customElements.define("x-node-group", NodeGroupElement)
customElements.define("x-markdown", MarkdownElement)
customElements.define("x-frontmatter", FrontMatterElement)
customElements.define("x-wikilink", WikilinkElement)
customElements.define("x-hashtag", HashtagElement)
customElements.define("x-canvas", CanvasElement)
customElements.define("x-display", DisplayElement)
customElements.define("x-edge", EdgeElement)

const config = configFromWindow()
const displayElement = document.createElement("x-display")
displayElement.setAttribute("vref", config.vref)
displayElement.setAttribute("wref", config.wref)
displayElement.setAttribute("root", "")
document.body.appendChild(displayElement)
