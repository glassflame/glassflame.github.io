import {CustomElement} from "../base.mjs";

export class CalloutElement extends CustomElement {
    static get template() {
        return document.getElementById("template-callout")
    }

    /**
     * The kind of callout this element represents, in UPPERCASE.
     *
     * For a list of all builtin callouts, see <https://help.obsidian.md/Editing+and+formatting/Callouts>.
     *
     * @return {string}
     */
    get kind() {
        return this.getAttribute("kind").toUpperCase()
    }
    set kind(value) {
        this.setAttribute("kind", value.toUpperCase())
    }

    /**
     * Whether this callout should be collapsible, and if it should start collapsed or not.
     *
     * Possible values are:
     * - `undefined`: non-collapsible
     * - `"+"`: collapsible, start expanded by default
     * - `"-"`: collapsible, start collapsed by default
     *
     * @return {undefined|"+"|"-"}
     */
    get collapse() {
        const value = this.getAttribute("collapse")
        if(value === "undefined") {
            return undefined
        }
        return value
    }
    set collapse(value) {
        if(value === undefined) {
            this.removeAttribute("collapse")
            return
        }
        this.setAttribute("collapse", value)
    }

    /**
     * The title of this callout, in UPPERCASE, as casing is handled by CSS, or `undefined`, if the {@link kind} should be used.
     *
     * @return {string|undefined}
     */
    get admonition() {
        return this.getAttribute("admonition")?.toUpperCase()
    }
    set admonition(value) {
        if(value === undefined) {
            this.removeAttribute("admonition")
            return
        }
        this.setAttribute("admonition", value.toUpperCase())
    }

    /**
     * The contents of this callout, or `undefined`, if there are none.
     *
     * @return {string}
     */
    get contents() {
        const value = this.getAttribute("contents")
        if(value === "undefined") {
            return undefined
        }
        return value
    }
    set contents(value) {
        if(value === undefined) {
            this.removeAttribute("contents")
            return
        }
        this.setAttribute("contents", value)
    }

    /**
     * Whether this element should consume its parent {@link onConnect}.
     * @return {boolean}
     */
    get cronus() {
        return this.hasAttribute("cronus")
    }
    set cronus(value) {
        if(value) {
            this.setAttribute("cronus", "")
        }
        else {
            this.removeAttribute("cronus")
        }
    }

    /**
     * Replace the contents of the {@link parentElement} with this element.
     * Also sets {@link cronus} to `false`.
     * @returns {void}
     */
    replaceParentElement() {
            const grandpa = this.parentElement.parentElement
            this.remove()
            this.parentElement.remove()
            this.cronus = false
            grandpa.appendChild(this)
    }

    /**
     * The element displaying the admonition of this callout, or `null` if {@link admonition} is `undefined`.
     * Can be recreated with {@link recreateAdmonitionElement}.
     * @type {HTMLElement}
     */
    admonitionElement

    /**
     * Recreate {@link collapseElement} with the current value of {@link collapse}.
     * {@link collapseElement} must not be null.
     * @returns {void}
     */
    recreateAdmonitionElement() {
        if(this.admonitionElement) {
            this.admonitionElement.remove()
            this.admonitionElement = null
        }

        this.admonitionElement = document.createElement("summary")
        this.admonitionElement.innerText = this.admonition

        this.collapseElement.appendChild(this.admonitionElement)
    }

    /**
     * The element displaying the contents of this callout, or `null` if {@link contents} is `undefined`.
     * Can be recreated with {@link recreateContentsElement}.
     * @type {HTMLDivElement|null}
     */
    contentsElement

    /**
     * Recreate {@link contentsElement} with the current value of {@link contents} and {@link collapseElement} or {@link containerElement}.
     * @returns {void}
     */
    recreateContentsElement() {
        if(this.contentsElement) {
            this.contentsElement.remove()
            this.contentsElement = null
        }

        if(this.contents) {
            this.contentsElement = document.createElement("summary")
            this.contentsElement.innerText = this.contents

            if(this.collapseElement) {
                this.collapseElement.appendChild(this.contentsElement)
            }
            else {
                this.containerElement.appendChild(this.contentsElement)
            }
        }
    }

    /**
     * The element collapsing this callout, or `null` if {@link collapse} is `undefined`.
     * Can be recreated with {@link recreateCollapseElement}.
     * @type {HTMLDetailsElement|null}
     */
    collapseElement

    /**
     * Recreate {@link collapseElement} with the current value of {@link collapse}.
     * @returns {void}
     */
    recreateCollapseElement() {
        if(this.collapseElement) {
            this.collapseElement.remove()
            this.collapseElement = null
        }

        if(this.collapse !== undefined) {
            this.collapseElement = document.createElement("details")
            this.containerElement.appendChild(this.collapseElement)
        }
    }

    /**
     * The element containing this callout.
     * Can be recreated with {@link recreateContainerElement}.
     * @type {HTMLQuoteElement}
     */
    containerElement

    /**
     * The name of the slot where {@link containerElement} should be placed in.
     * @type {string}
     */
    static CONTAINER_ELEMENT_SLOT = "callout-contents"

    /**
     * @returns {void}
     */
    recreateContainerElement() {
        if(this.containerElement) {
            this.containerElement.remove()
            this.containerElement = null
        }

        this.containerElement = document.createElement("blockquote")
        this.containerElement.slot = this.constructor.CONTAINER_ELEMENT_SLOT
        this.appendChild(this.containerElement)
    }

    onConnect() {
        super.onConnect()
        if(this.cronus) {
            this.replaceParentElement()
        }
        else {
            this.recreateContainerElement()
            this.recreateCollapseElement()
            this.recreateAdmonitionElement()
            this.recreateContentsElement()
        }
    }
}