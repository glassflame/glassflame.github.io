import {CustomElement} from "../base.mjs";
import {default as katex} from 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.mjs';
import { MarkdownElement } from "./renderer.mjs";
import { findFirstAncestor } from "../../utils/traversal.mjs";

/**
 * Element rendering TeX math.
 */
export class MathElement extends CustomElement {
    static get template() {
        return document.getElementById("template-math")
    }

    /**
     * Element representing the Markdown context where this math formula is displayed in.
     * Can be recalculated with {@link recalculateRenderer}.
     * @type {MarkdownElement}
     */
    renderer

    /**
     * Recalculate the value of {@link browse} and {@link vault} using this element's current position in the DOM.
     * @returns {void}
     */
    recalculateRenderer() {
        this.renderer = findFirstAncestor(this, MarkdownElement)
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
    async recreateKatexElement() {
        if(this.katexElement) {
            this.katexElement.remove()
            this.katexElement = null
        }

        this.katexElement = document.createElement(this.isBlock ? "div" : "span")
        this.katexElement.slot = this.constructor.KATEX_ELEMENT_SLOT
        this.katexElement.classList.add("math")
        this.katexElement.classList.add(this.isBlock ? "math-block" : "math-inline")

        await this.renderer.sleepUntilKatexMacrosAreAvailable()

        katex.render(
            this.texDocument,
            this.katexElement,
            {
                throwOnError: false,
                globalGroup: true,
                macros: this.renderer.katexMacros,
                trust: true,
            }
        )

        this.appendChild(this.katexElement)
    }

    onConnect() {
        super.onConnect()
        this.recalculateRenderer()
        this.recreateKatexElement()
    }
}
