import { NodeElement } from "src/elements/canvas/node/base.mjs";
import { DisplayElement } from "src/elements/display.mjs";


/**
 * A {@link NodeElement} directly rendering a Markdown document.
 */
export class NodeTextElement extends NodeElement {
    static getTemplate() {
        return document.getElementById("template-node-text")
    }

    /**
     * Get the Markdown source of this node from the `document` attribute.
     */
    get markdownDocument() {
        return this.getAttribute("text")
    }

    /**
     * The element displaying the contents of the node.
     * @type {MarkdownElement}
     */
    contentsElement

    /**
     * The name of the slot where {@link contentsElement} should be placed in.
     * @type {string}
     */
    static CONTENTS_ELEMENT_SLOT = "node-file-contents"

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
