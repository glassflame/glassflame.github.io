import { CustomElement } from "../base.mjs";


/**
 * Element rendering Obsidian front matter.
 */
export class FrontMatterElement extends CustomElement {
    static get template() {
        return document.getElementById("template-frontmatter")
    }

    /**
     * The programming language used to define this front matter, obtained from the `lang` attribute.
     * @type {string}
     */
    get language() {
        return this.getAttribute("lang")
    }

    /**
     * The text contained in this front matter, obtained from the `data` attribute.
     */
    get data() {
        return this.getAttribute("data")
    }

    /**
     * The element marking the front matter as preformatted text.
     * Can be recreated with {@link recreatePreCodeElement}.
     * @type {HTMLPreElement}
     */
    preElement

    /**
     * The name of the slot where {@link preElement} should be placed in.
     * @type {string}
     */
    static PRE_ELEMENT_SLOT = "frontmatter-contents"

    /**
     * The element displaying the code of the front matter.
     * Can be recreated with {@link recreatePreCodeElement}.
     * @type {HTMLElement}
     */
    codeElement

    /**
     * Recreate {@link preElement} and {@link codeElement} with the current value of {@link language} and {@link data}.
     * @returns {void}
     */
    recreatePreCodeElement() {
        if(this.preElement) {
            this.preElement.remove()
            this.preElement = null
            this.codeElement = null
        }

        this.codeElement = document.createElement("code")
        this.codeElement.setAttribute("lang", this.language)
        this.codeElement.innerText = this.data

        this.preElement = document.createElement("pre")
        this.preElement.slot = this.constructor.PRE_ELEMENT_SLOT

        this.preElement.appendChild(this.codeElement)
        this.appendChild(this.preElement)
    }

    onConnect() {
        super.onConnect()
        this.recreatePreCodeElement()
    }
}
