import { configFromWindow } from "../config.mjs";


/**
 * Element representing the generic skeleton of an Obsidian Canvas node.
 */
export class NodeElement extends HTMLElement {
    x
    y
    width
    height
    color

    // noinspection JSUnusedGlobalSymbols
    connectedCallback() {
        this.id = this.getAttribute("id")
        this.x = this.getAttribute("x")
        this.y = this.getAttribute("y")
        this.width = this.getAttribute("width")
        this.height = this.getAttribute("height")
        this.color = this.getAttribute("color")
    }

    colorToHex() {
        if(this?.color?.startsWith("#")) {
            // This is an hex color
            return this.color
        }
        else {
            // TODO: Check which colors correspond to what
            return {}[this.color]
        }
    }
}

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

/**
 * Element representing the skeleton of an Obsidian Canvas node pointing to a file.
 *
 * Requires the following attributes:
 * - `file`: wref to the target file
 * - `id`: id unique to the node
 * - `x`: horizontal translation
 * - `y`: vertical translation
 * - `width`: width of the card in px
 * - `height`: height of the card in px
 * - (optional) `color`: custom Obsidian color of the card
 */
export class NodeFileElement extends NodeElement {
    static type = "file"

    file
    fileName
    fileExtension

    fileLeaf() {
        return this.file.split("/").at(-1)
    }

    fileDetails() {
        const split = this.fileLeaf().split(".")
        const name = split.slice(0, -1)
        const extension = split.at(-1)
        return [name, extension]
    }

    static getTemplate() {
        return document.getElementById("template-node-file")
    }

    instanceElement
    nameSlotted
    placeholderSlotted
    contentsSlotted
    loadButton

    // noinspection JSUnusedGlobalSymbols
    connectedCallback() {
        super.connectedCallback()
        this.file = this.getAttribute("file")
        const [fileName, fileExtension] = this.fileDetails()
        this.fileName = fileName
        this.fileExtension = fileExtension

        const instanceDocument = NodeFileElement.getTemplate().content.cloneNode(true)
        const shadow = this.attachShadow({ mode: "open" })

        this.instanceElement = instanceDocument.querySelector(".node.node-file")

        this.instanceElement.style["left"] = `${this.x}px`
        this.instanceElement.style["top"] = `${this.y}px`
        this.instanceElement.style["width"] = `${this.width}px`
        this.instanceElement.style["height"] = `${this.height}px`
        this.instanceElement.style["--node-color"] = this.colorToHex()

        this.instanceElement.classList.add("node-empty")
        this.instanceElement.classList.remove("node-full")

        this.nameSlotted = document.createElement("span")
        this.nameSlotted.slot = "node-title"
        this.nameSlotted.innerText = this.fileName
        this.appendChild(this.nameSlotted)

        this.placeholderSlotted = document.createElement("div")
        this.placeholderSlotted.slot = "node-contents"
        this.loadButton = document.createElement("button")
        this.loadButton.innerText = "Load"
        this.loadButton.addEventListener("click", this.fillNode.bind(this))
        this.placeholderSlotted.appendChild(this.loadButton)
        this.appendChild(this.placeholderSlotted)

        shadow.appendChild(instanceDocument)
    }

    contents

    async fetchContents() {
        console.info("Fetching:", this.file)

        const url = new URL(this.file, configFromWindow()["vault"])
        const response = await fetch(url, {})

        if(!response.ok) throw new FetchError(response, "Fetch response is not ok")

        this.contents = await response.text()
    }

    async fillNode() {
        this.loadButton.disabled = true

        this.placeholderSlotted.remove()
        this.placeholderSlotted = null

        await this.fetchContents()

        this.instanceElement.classList.remove("node-empty")
        this.instanceElement.classList.add("node-full")

        this.contentsSlotted = document.createElement({
            "md": "x-markdown",
            "canvas": "x-canvas",
        }[this.fileExtension] ?? "div")
        this.contentsSlotted.slot = "node-contents"
        this.contentsSlotted.setAttribute("contents", this.contents)
        this.appendChild(this.contentsSlotted)
    }
}
