import { fileDetails } from "../utils/file.mjs";
import { CanvasElement } from "./canvas.mjs";
import { MarkdownElement } from "./markdown.mjs";
import { FetchError } from "./node.mjs";


export class DisplayElement extends HTMLElement {
    /**
     * Return the closest {@link DisplayElement} ancestor in the tree.
     *
     * @param initial {HTMLElement} The element to start the search from.
     */
    static findFirstDisplayAncestor(initial) {
        let current = initial
        while(current) {
            if(current instanceof ShadowRoot) {
                current = current.host
            }
            if(current instanceof DisplayElement) {
                return current
            }
            current = current.parentNode
        }
        return null
    }

    static getTemplate() {
        return document.getElementById("template-display")
    }

    containerSlotted
    loadButton

    // noinspection JSUnusedGlobalSymbols
    connectedCallback() {
        const instanceDocument = DisplayElement.getTemplate().content.cloneNode(true)
        const shadow = this.attachShadow({ mode: "open" })

        this.containerSlotted = document.createElement("div")
        this.containerSlotted.slot = "display-container"
        this.loadButton = document.createElement("button")
        this.loadButton.innerText = "Load"
        this.loadButton.addEventListener("click", this.load.bind(this))
        this.containerSlotted.appendChild(this.loadButton)
        this.appendChild(this.containerSlotted)

        shadow.appendChild(instanceDocument)
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

        const [, fileExtension] = fileDetails(this.getAttribute("wref"))

        this.containerSlotted = document.createElement({
            "md": customElements.getName(MarkdownElement),
            "canvas": this.getAttribute("root") !== undefined ? customElements.getName(CanvasElement) : "div",
        }[fileExtension] ?? "div")
        this.containerSlotted.slot = "display-container"
        this.containerSlotted.setAttribute("contents", this.data)
        this.appendChild(this.containerSlotted)
    }
}