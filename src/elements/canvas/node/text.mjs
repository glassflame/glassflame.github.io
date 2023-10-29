import { NodeElement } from "./base.mjs"


/**
 * A {@link NodeElement} directly rendering a Markdown document.
 */
export class NodeTextElement extends NodeElement {
    static get template() {
        return document.getElementById("template-node-text")
    }

    static createStyleSheets() {
        return [...super.createStyleSheets(), this.makeModuleLikeStyleSheet(import.meta.url)]
    }

    /**
     * Get the Markdown source of this node from the `document` attribute.
     */
    get markdownDocument() {
        return this.getAttribute("document")
    }

    /**
     * The element displaying the contents of the node.
     * Can be recreated with {@link recreateContentsElement}.
     * @type {MarkdownElement}
     */
    contentsElement

    /**
     * The name of the slot where {@link contentsElement} should be placed in.
     * @type {string}
     */
    static CONTENTS_ELEMENT_SLOT = "node-text-contents"

    /**
     * Recreate {@link labelElement} with the current value of {@link fileName}.
     */
    recreateContentsElement() {
        if(this.contentsElement) {
            this.contentsElement.remove()
            this.contentsElement = null
        }

        this.contentsElement = document.createElement("x-markdown")
        this.contentsElement.slot = this.constructor.CONTENTS_ELEMENT_SLOT
        this.contentsElement.setAttribute("document", this.markdownDocument)  // TODO: Rename the property of x-markdown to "document"
        this.appendChild(this.contentsElement)
    }

    onConnect() {
        super.onConnect()
        this.recreateContentsElement()
    }
}
