import { CanvasItemElement } from "./canvas.mjs";
import { DisplayElement } from "./display.mjs";


/**
 * Error in the fetching of a file.
 */
export class FetchError extends Error {
    /**
     * The {@link Response} object of the failed request.
     */
    response

    constructor(response, message) {
        super(message)
        this.response = response
    }
}


export class NodeElement extends CanvasItemElement {
    getCenterCoordinatesOfSide(side) {
        switch(side) {
            case "top":
                return [
                    Number(this.getAttribute("x")) + Number(this.getAttribute("width")) / 2,
                    Number(this.getAttribute("y")),
                ]
            case "bottom":
                return [
                    Number(this.getAttribute("x")) + Number(this.getAttribute("width")) / 2,
                    Number(this.getAttribute("y")) + Number(this.getAttribute("height")),
                ]
            case "left":
                return [
                    Number(this.getAttribute("x")),
                    Number(this.getAttribute("y")) + Number(this.getAttribute("height")) / 2,
                ]
            case "right":
                return [
                    Number(this.getAttribute("x")) + Number(this.getAttribute("width")),
                    Number(this.getAttribute("y")) + Number(this.getAttribute("height")) / 2,
                ]
        }
    }
}


export class NodeGroupElement extends NodeElement {
    static getTemplate() {
        return document.getElementById("template-node-group")
    }

    instanceElement
    labelSlotted

    onConnected() {
        this.instanceElement = this.instance.querySelector(".node-group")

        this.instanceElement.style.setProperty("left", `${this.getAttribute("x")}px`)
        this.instanceElement.style.setProperty("top", `${this.getAttribute("y")}px`)
        this.instanceElement.style.setProperty("width", `${this.getAttribute("width")}px`)
        this.instanceElement.style.setProperty("height", `${this.getAttribute("height")}px`)
        this.instanceElement.style.setProperty("--color-node", this.colorToHex())

        this.labelSlotted = document.createElement("span")
        this.labelSlotted.slot = "node-label"
        this.labelSlotted.innerText = this.getAttribute("label")
        this.appendChild(this.labelSlotted)
    }
}


export class NodeFileElement extends NodeElement {
    static getTemplate() {
        return document.getElementById("template-node-file")
    }

    instanceElement
    nameSlotted
    contentsSlotted

    onConnect() {
        this.instanceElement = this.instance.querySelector(".node-file")

        this.instanceElement.style.setProperty("left", `${this.getAttribute("x")}px`)
        this.instanceElement.style.setProperty("top", `${this.getAttribute("y")}px`)
        this.instanceElement.style.setProperty("width", `${this.getAttribute("width")}px`)
        this.instanceElement.style.setProperty("height", `${this.getAttribute("height")}px`)
        this.instanceElement.style.setProperty("--color-node", this.colorToHex())

        this.nameSlotted = document.createElement("x-wikilink")
        this.nameSlotted.slot = "node-title"
        this.nameSlotted.setAttribute("wref", this.getAttribute("file"))
        const nameSlottedText = document.createElement("span")
        nameSlottedText.slot = "wikilink-text"
        nameSlottedText.innerText = this.getAttribute("file-name")
        this.nameSlotted.appendChild(nameSlottedText)
        this.appendChild(this.nameSlotted)

        this.contentsSlotted = document.createElement(customElements.getName(DisplayElement))
        this.contentsSlotted.slot = "node-contents"

        const firstDisplayAncestor = this.findFirstAncestor(DisplayElement)
        this.contentsSlotted.setAttribute("vref", firstDisplayAncestor.getAttribute("vref"))
        this.contentsSlotted.setAttribute("wref", this.getAttribute("file"))
        this.appendChild(this.contentsSlotted)
    }
}

export class NodeTextElement extends NodeElement {
    static getTemplate() {
        return document.getElementById("template-node-text")
    }

    instanceElement
    contentsSlotted

    onConnected() {
        this.instanceElement = this.instance.querySelector(".node-text")

        this.instanceElement.style.setProperty("left", `${this.getAttribute("x")}px`)
        this.instanceElement.style.setProperty("top", `${this.getAttribute("y")}px`)
        this.instanceElement.style.setProperty("width", `${this.getAttribute("width")}px`)
        this.instanceElement.style.setProperty("height", `${this.getAttribute("height")}px`)
        this.instanceElement.style.setProperty("--color-node", this.colorToHex())

        this.contentsSlotted = document.createElement("x-markdown")
        this.contentsSlotted.slot = "node-contents"
        this.contentsSlotted.setAttribute("contents", this.getAttribute("text"))
        this.appendChild(this.contentsSlotted)
    }
}
