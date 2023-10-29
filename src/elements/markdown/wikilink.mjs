import { CustomElement } from "../base.mjs";
import {findFirstAncestor} from "../../utils/trasversal.mjs";
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

    static createStyleSheets() {
        return [...super.createStyleSheets(), this.makeModuleLikeStyleSheet(import.meta.url)]
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

    /**
     * The CSS selector of the anchor element.
     * @type {string}
     */
    static ANCHOR_SELECTOR = "a.wikilink"

    /**
     * The element displaying the wikilink.
     * Can be recreated with {@link recreateTagElement}.
     * @type {HTMLAnchorElement}
     */
    anchorElement

    /**
     Update the value of the {@link canvasItemElement} by querying the current {@link instance} with {@link ANCHOR_SELECTOR}.
     * @returns {void}
     */
    recalculateAnchorElement() {
        this.anchorElement = this.instance.querySelector(this.constructor.ANCHOR_SELECTOR)
    }

    resetAnchorElementProperties() {
        let path = null
        if(this.target.startsWith(".")) {
            path = filePath(this.display.path + "/" + this.target).join("/")
        }
        else if(this.target.includes("/")) {
            path = filePath(this.target).join("/")
        }
        else {
            if(this.vault.fileIndex !== null) {
                path = this.vault.fileIndex.basenames[this.target]
            }
        }

        if(path !== null) {
            this.anchorElement.href = this.browse.urlFor({path}).toString()
        }
        this.anchorElement.innerText = this.text
    }

    onConnect() {
        super.onConnect()
        this.recalculateAncestors()
        this.recalculateAnchorElement()
        this.resetAnchorElementProperties()
    }
}
