import { fileDetails } from "../utils/file.mjs";
import { CanvasElement } from "./canvas/canvas.mjs";
import { MarkdownElement } from "./markdown.mjs";
import { FetchError } from "./node.mjs";
import { CustomElement } from "./base.mjs";


export class DisplayElement extends CustomElement {
    static getTemplate() {
        return document.getElementById("template-display")
    }

    containerSlotted
    loadButton

    onConnect() {
        this.containerSlotted = document.createElement("div")
        this.containerSlotted.slot = "display-container"
        this.loadButton = document.createElement("button")
        this.loadButton.innerText = "Load"
        this.loadButton.addEventListener("click", this.load.bind(this))
        this.containerSlotted.appendChild(this.loadButton)
        this.appendChild(this.containerSlotted)
    }

    data

    async fetchData() {
        const vref = this.getAttribute("vref")
        const wref = this.getAttribute("wref")
        const url = new URL(wref, vref)

        const response = await fetch(url, {})

        if(!response.ok) throw new FetchError(response, "Fetch response is not ok")

        this.data = await response.text()
    }

    async load() {
        this.loadButton.disabled = true

        await this.fetchData()

        this.containerSlotted.remove()
        this.containerSlotted = null

        const fileExtension = fileDetails(this.getAttribute("wref")).extension

        this.containerSlotted = document.createElement({
            "md": customElements.getName(MarkdownElement),
            "canvas": customElements.getName(CanvasElement),
        }[fileExtension])
        this.containerSlotted.slot = "display-container"
        this.containerSlotted.setAttribute("contents", this.data)
        this.appendChild(this.containerSlotted)
    }
}