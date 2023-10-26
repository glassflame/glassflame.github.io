import { NodeElement } from "./base.mjs";


/**
 * A {@link NodeElement} representing a group of nodes.
 * Visual only, does not actually contain any other nodes.
 */
export class NodeGroupElement extends NodeElement {
    static get template() {
        return document.getElementById("template-node-group")
    }

    /**
     * The label text of the group.
     * Obtained from the `label` attribute of the element.
     */
    get label() {
        return this.getAttribute("label")
    }

    /**
     * The element displaying the name of the group.
     * @type {HTMLSpanElement}
     */
    labelElement

    /**
     * The name of the slot where {@link labelElement} should be placed in.
     * @type {string}
     */
    static LABEL_ELEMENT_SLOT = "node-group-label"

    /**
     * Recreate {@link labelElement} with the current value of {@link label}.
     */
    recreateLabelElement() {
        if(this.labelElement) {
            this.labelElement.remove()
            this.labelElement = null
        }

        this.labelSlotted = document.createElement("span")
        this.labelSlotted.slot = this.constructor.LABEL_ELEMENT_SLOT
        this.labelSlotted.innerText = this.label
        this.appendChild(this.labelSlotted)
    }

    onConnect() {
        super.onConnect()
        this.recreateLabelElement()
    }
}
