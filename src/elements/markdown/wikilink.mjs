import { CustomElement } from "../base.mjs";
import {findFirstAncestor} from "../../utils/traversal.mjs";
import {BrowseElement} from "../browse.mjs";
import {VaultElement} from "../vault.mjs";
import {filePath} from "../../utils/file.mjs";
import {DisplayElement} from "../display.mjs";


/**
 * Element rendering an Obsidian Wikilink.
 */
export class WikilinkElement extends CustomElement {
    static get template() {
        return document.getElementById("template-wikilink")
    }

    /**
     * Element displaying the this one.
     * Can be recalculated with {@link recalculateAncestors}.
     * @type {DisplayElement}
     */
    display

    /**
     * Element representing the Obsidian Vault.
     * Can be recalculated with {@link recalculateAncestors}.
     * @type {VaultElement}
     */
    vault

     /**
     * Element handling the page navigation.
     * Can be recalculated with {@link recalculateAncestors}.
     * @type {BrowseElement}
     */
    browse

    /**
     * Recalculate the value of {@link browse} and {@link vault} using this element's current position in the DOM.
     * @returns {void}
     */
    recalculateAncestors() {
        this.display = findFirstAncestor(this, DisplayElement)
        this.vault = findFirstAncestor(this, VaultElement)
        this.browse = findFirstAncestor(this, BrowseElement)
    }

    /**
     * Get the path or name of the file this node points to.
     * @returns {string} The value in question.
     */
    get target() {
        return this.getAttribute("target")
    }
    set target(value) {
        this.setAttribute("target", value)
    }

    /**
     * Get the text that should be displayed in this wikilink.
     * @returns {string} The text in question.
     */
    get text() {
        // TODO: Dirty hack to hide "undefined"
        const text = this.getAttribute("text")
        // noinspection EqualityComparisonWithCoercionJS
        if(text == "undefined") {
            return this.target
        }
        return text
    }
    set text(value) {
        // TODO: Dirty hack to hide "undefined"
        // noinspection EqualityComparisonWithCoercionJS
        if(value == "undefined") {
            this.removeAttribute("text")
        }
        else {
            this.setAttribute("text", value)
        }
    }

    /**
     * Set the `heading` property of the wikilink, changing its style.
     * @returns {boolean} Whether the element is a heading or not.
     */
    get heading() {
        return this.hasAttribute("heading")
    }
    set heading(value) {
        if(value) {
            this.setAttribute("heading", "")
        }
        else {
            this.removeAttribute("heading")
        }
    }

    /**
     * The element displaying the wikilink.
     * Can be recreated with {@link recreateAnchorElement}.
     * @type {HTMLAnchorElement}
     */
    anchorElement

    /**
     * The name of the slot where {@link anchorElement} should be placed in.
     * @type {string}
     */
    static ANCHOR_ELEMENT_SLOT = "wikilink-anchor"

    /**
     * Reset the `href` property of an existing {@link anchorElement}.
     * @returns {Promise<void>}
     */
    async resetAnchorElementHref() {
        await this.vault.sleepUntilFileIndexIsAvailable()

        let path = null
        if(this.target.startsWith(".")) {
            path = filePath(this.display.path + "/" + this.target).join("/")
        }
        else if(this.target.includes("/")) {
            path = filePath(this.target).join("/")
        }
        else {
            if(this.vault.fileIndex !== null) {
                path = this.vault.fileIndex.basenames[this.target.toLowerCase()]
            }
        }

        if(path !== undefined && this.vault.fileIndex.paths?.includes(path)) {
            this.anchorElement.href = this.browse.urlFor({path}).toString()
        }
    }

    /**
     * Recreate {@link anchorElement} with the current {@link target}, {@link text} and {@link heading}.
     * @returns {void}
     */
    recreateAnchorElement() {
        this.anchorElement = document.createElement("a")
        this.anchorElement.slot = this.constructor.ANCHOR_ELEMENT_SLOT
        this.anchorElement.innerText = this.text
        this.anchorElement.classList.add("wikilink")
        if(this.heading) {
            this.anchorElement.classList.add("wikilink-heading")
        }
        this.appendChild(this.anchorElement)
        this.resetAnchorElementHref().then()
    }

    onConnect() {
        super.onConnect()
        this.recalculateAncestors()
        this.recreateAnchorElement()
    }
}
