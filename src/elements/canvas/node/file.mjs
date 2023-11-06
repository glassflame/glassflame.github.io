import { NodeElement } from "./base.mjs";
import { DisplayElement } from "../../display.mjs";
import { fileDetails } from "../../../utils/file.mjs";
import {findFirstAncestor} from "../../../utils/trasversal.mjs";
import {VaultElement} from "../../vault.mjs";
import {BrowseElement} from "../../browse.mjs";


export class NodeFileElement extends NodeElement {
    static get template() {
        return document.getElementById("template-node-file")
    }

    /**
     * Get the path of the file displayed by this node, relative to the root of the vault, from the `path` attribute.
     * @returns {string} The path.
     */
    get pathRelativeToVault() {
        return this.getAttribute("path")
    }
    set pathRelativeToVault(value) {
        return this.setAttribute("path", value)
    }

    /**
     * Get the name of the file displayed by this node, with no extension.
     * @returns {string} The file name.
     */
    get fileName() {
        const {name} = fileDetails(this.pathRelativeToVault)
        return name
    }

    /**
     * The element displaying the name of the file.
     * @type {HTMLSpanElement}
     */
    labelElement

    /**
     * The name of the slot where {@link labelElement} should be placed in.
     * @type {string}
     */
    static LABEL_ELEMENT_SLOT = "node-file-label"

    /**
     * Recreate {@link labelElement} with the current value of {@link fileName} and {@link vault}.
     */
    recreateLabelElement() {
        if(this.labelElement) {
            this.labelElement.remove()
            this.labelElement = null
        }

        this.labelSlotted = document.createElement("x-wikilink")
        this.labelSlotted.slot = this.constructor.LABEL_ELEMENT_SLOT
        this.labelSlotted.target = this.pathRelativeToVault
        this.labelSlotted.text = this.fileName
        this.labelSlotted.heading = true
        this.appendChild(this.labelSlotted)
    }

    /**
     * The element displaying the contents of the file.
     * @type {DisplayElement}
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

        this.contentsElement = document.createElement("x-display")
        this.contentsElement.slot = this.constructor.CONTENTS_ELEMENT_SLOT
        this.contentsElement.path = this.pathRelativeToVault
        this.appendChild(this.contentsElement)
    }

    onConnect() {
        super.onConnect()
        this.recreateLabelElement()
        this.recreateContentsElement()
    }
}
