import {CustomElement} from "../base.mjs";
import {default as katex} from 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.mjs';

/**
 * Element rendering TeX math.
 */
export class MathElement extends CustomElement {
    static get template() {
        return document.getElementById("template-math")
    }

    /**
     * The math to render, obtained from the `document` attribute.
     * @returns {string}
     */
    get texDocument() {
        return this.getAttribute("document")
    }
    set texDocument(value) {
        this.setAttribute("document", value)
    }

    /**
     * The display mode of the KaTeX element, obtained from the `block` attribute.
     * @returns {boolean} `true` if block, `false` if inline.
     */
    get isBlock() {
        return this.hasAttribute("block")
    }
    set isBlock(value) {
        if(value) {
            this.setAttribute("block", "")
        }
        else {
            this.removeAttribute("block")
        }
    }

    /**
     * The element displaying the math.
     * Can be recreated with {@link recreateKatexElement}.
     */
    katexElement

    /**
     * The name of the slot where {@link katexElement} should be placed in.
     * @type {string}
     */
    static KATEX_ELEMENT_SLOT = "math-katex"

    /**
     * Recreate {@link katexElement} with the current values of {@link texDocument} and {@link isBlock}.
     */
    recreateKatexElement() {
        if(this.katexElement) {
            this.katexElement.remove()
            this.katexElement = null
        }

        this.katexElement = document.createElement(this.isBlock ? "div" : "span")
        this.katexElement.slot = this.constructor.KATEX_ELEMENT_SLOT
        this.katexElement.classList.add("math")
        this.katexElement.classList.add(this.isBlock ? "math-block" : "math-inline")

        katex.render(
            this.texDocument,
            this.katexElement,
            {
                throwOnError: false,
                globalGroup: true,
            }
        )

        this.appendChild(this.katexElement)
    }

    onConnect() {
        super.onConnect()

        this.recreateKatexElement()
    }
}
