import {CustomElement} from "../base.mjs";

export class CalloutElement extends HTMLElement {
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
     * The element displaying the admonition of this callout, or `null` if {@link admonition} is `undefined`.
     * Can be recreated with {@link recreateAdmonitionElement}.
     * @type {HTMLElement}
     */
    admonitionElement

    /**
     * The slot where the admonition of this callout will be inserted in.
     * @type {HTMLSlotElement}
     */
    admonitionSlotElement

    /**
     * Recreate {@link collapseElement} with the current value of {@link collapse}.
     * {@link collapseElement} must not be null.
     * @returns {void}
     */
    recreateAdmonitionElement() {
        if(this.admonitionElement) {
            this.admonitionElement.remove()
            this.admonitionElement = null
            this.admonitionSlotElement = null
        }

            this.admonitionElement = document.createElement("summary")

            this.admonitionSlotElement = document.createElement("slot")
            this.admonitionSlotElement.name = "callout-admonition"
            this.admonitionElement.appendChild(this.admonitionSlotElement)

            this.collapseElement.appendChild(this.admonitionElement)
    }

    /**
     * The slot where the contents of this callout will be inserted in.
     * @type {HTMLSlotElement}
     */
    contentsSlotElement

    /**
     * Recreate {@link contentsElement} with the current value of {@link contents} and {@link collapseElement}.
     * @returns {void}
     */
    recreateContentsSlotElement() {
        if(this.contentsSlotElement) {
            this.contentsSlotElement.remove()
            this.contentsElement = null
        }

        this.contentsSlotElement = document.createElement("slot")
        this.contentsSlotElement.name = "callout-contents"

        this.collapseElement.appendChild(this.contentsSlotElement)
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
            this.admonitionElement = null
            this.admonitionSlotElement = null
            this.contentsElement = null
            this.contentsSlotElement = null
        }

        if(this.collapse === undefined) {
            this.collapseElement = document.createElement("div")
        }
        else {
            this.collapseElement = document.createElement("details")
            if(this.collapse === "+") {
                this.collapseElement.open = true
            }
            if(this.collapse === "-") {
                this.collapseElement.open = false
            }
        }

        this.shadowRoot.appendChild(this.collapseElement)
    }

    /**
     * Reset the style of the parent {@link HTMLQuoteElement}.
     * @returns {void}
     */
    resetParentBlockquoteStyle() {
        const parentClassList = this.parentElement.classList

        for(const className in parentClassList.entries()) {
            if(className.startsWith("callout")) {
                parentClassList.remove(className)
            }
        }

        parentClassList.add("callout")
        parentClassList.add(`callout-${this.kind.toLowerCase()}`)
    }

    // noinspection JSUnusedGlobalSymbols
    connectedCallback() {
        this.attachShadow({ mode: "open" })
        this.recreateCollapseElement()
        this.recreateAdmonitionElement()
        this.recreateContentsSlotElement()
        this.resetParentBlockquoteStyle()
    }
}