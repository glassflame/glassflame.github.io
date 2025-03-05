import { CustomElement } from "../base.mjs";
import {findFirstAncestor} from "../../utils/traversal.mjs";
import {BrowseElement} from "../browse.mjs";
import {VaultElement} from "../vault.mjs";
import {filePath} from "../../utils/file.mjs";
import {DisplayElement} from "../display.mjs";


/**
 * Element rendering an Obsidian Wikilink image.
 */
export class WikiImgElement extends CustomElement {
    static get template() {
        return document.getElementById("template-wikiimg")
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
     * The element displaying the wiki image.
     * Can be recreated with {@link recreateImageElement}.
     * @type {HTMLImageElement}
     */
    imageElement

    /**
     * The name of the slot where {@link imageElement} should be placed in.
     * @type {string}
     */
    static IMAGE_ELEMENT_SLOT = "wikiimg-image"

    /**
     * Reset the `src` property of an existing {@link imageElement}.
     * @returns {Promise<void>}
     */
    async resetImageElementSrc() {
        await this.vault.sleepUntilFileIndexIsAvailable()

        // TODO: Make sure this is correct
        let vaultPath = filePath(this.display.path + "/" + ".." + "/" + this.target).join("/")
        let absolutePath = this.display.vault.base + vaultPath

        this.imageElement.src = absolutePath
    }

    /**
     * Recreate {@link imageElement} with the current {@link target}, {@link text} and {@link heading}.
     * @returns {void}
     */
    recreateImageElement() {
        this.imageElement = document.createElement("img")
        this.imageElement.slot = this.constructor.IMAGE_ELEMENT_SLOT
        this.imageElement.classList.add("wikiimg")
        this.appendChild(this.imageElement)
        this.resetImageElementSrc().then()
    }

    onConnect() {
        super.onConnect()
        this.recalculateAncestors()
        this.recreateImageElement()
    }
}
