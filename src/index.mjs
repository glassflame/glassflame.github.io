import {
    CanvasElement,
    HashtagElement,
    NodeFileElement,
    WikilinkElement,
    DisplayElement,
    EdgeElement,
    NodeGroupElement,
    NodeTextElement,
    FrontMatterElement,
    MarkdownElement,
    VaultElement,
    BrowseElement,
    LandingElement,
    MathElement,
    CalloutElement,
} from "./elements/index.mjs";

customElements.define("x-landing", LandingElement)
customElements.define("x-vault", VaultElement)
customElements.define("x-display", DisplayElement)
customElements.define("x-canvas", CanvasElement)
customElements.define("x-node-group", NodeGroupElement)
customElements.define("x-node-file", NodeFileElement)
customElements.define("x-node-text", NodeTextElement)
customElements.define("x-edge", EdgeElement)
customElements.define("x-markdown", MarkdownElement)
customElements.define("x-frontmatter", FrontMatterElement)
customElements.define("x-hashtag", HashtagElement)
customElements.define("x-wikilink", WikilinkElement)
customElements.define("x-math", MathElement)
customElements.define("x-callout", CalloutElement)
customElements.define("x-browse", BrowseElement, {extends: "body"})