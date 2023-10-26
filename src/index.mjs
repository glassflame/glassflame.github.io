import { CanvasElement, HashtagElement, NodeFileElement, WikilinkElement, DisplayElement, EdgeElement, NodeGroupElement, NodeTextElement, FrontMatterElement, MarkdownElement } from "./elements/index.mjs";

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
