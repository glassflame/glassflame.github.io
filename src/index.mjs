import { CanvasElement, HashtagElement, MarkdownElement, NodeFileElement, WikilinkElement } from "./elements/index.mjs";

customElements.define("x-node-file", NodeFileElement)
customElements.define("x-markdown", MarkdownElement)
customElements.define("x-wikilink", WikilinkElement)
customElements.define("x-hashtag", HashtagElement)
customElements.define("x-canvas", CanvasElement)
