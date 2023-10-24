import { fileDetails } from "../utils/file.mjs";
import { CustomElement, NotImplementedError } from "./base.mjs";


/**
 * The renderer of an Obsidian Canvas.
 */
export class CanvasElement extends CustomElement {
    static getTemplate() {
        return document.getElementById("template-canvas")
    }

    /**
     * Parsed value of the `contents` attribute at the moment of connection to the DOM.
     * @type {any}
     */
    parsedContents

    /**
     * `<div>` containing all the {@link NodeElement}s of this Canvas.
     * @type {HTMLDivElement}
     */
    nodesContainer

    /**
     * `<div>` containing all the {@link NodeElement}s of this Canvas.
     * @type {HTMLDivElement}
     */
    edgesContainer

    /**
     * Mapping associating ids to their respective {@link NodeElement}s of this Canvas.
     * @type {{[id: string]: NodeElement}}
     */
    nodeElementsById = {}

    /**
     * Mapping associating names to their respective {@link NodeElement}s of this Canvas.
     * @type {{[name: string]: NodeElement}}
     */
    nodeElementsByName = {}

    /**
     * Mapping associating vault-relative paths to their respective {@link NodeElement}s of this Canvas.
     * @type {{[name: string]: NodeElement}}
     */
    nodeElementsByPath = {}

    /**
     * Mapping associating ids to their respective {@link EdgeElement}s of this Canvas.
     * @type {{[id: string]: EdgeElement}}
     */
    edgeElementsById = {}

    onConnected() {
        super.onConnected();

        this.parsedContents = JSON.parse(this.getAttribute("contents"))

        this.nodesContainer = document.createElement("div")
        this.nodesContainer.slot = "canvas-nodes"

        this.edgesContainer = document.createElement("div")
        this.edgesContainer.slot = "canvas-edges"

        let minX = { x: Infinity, width: 0 }
        let minY = { y: Infinity, height: 0 }
        let maxX = { x: -Infinity, width: 0 }
        let maxY = { y: -Infinity, height: 0 }

        for(const node of this.parsedContents["nodes"]) {
            let {x, y, width, height} = node
            x, y, width, height = Number(x), Number(y), Number(width), Number(height)

            if(x < minX.x) minX = node
            if(y < minY.y) minY = node
            if(x + width > maxX.x + width) maxX = node
            if(y + height > maxY.y + height) maxY = node
        }

        for(const node of this.parsedContents["nodes"]) {
            let {id, type, color, x, y, width, height} = node
            x, y, width, height = Number(x), Number(y), Number(width), Number(height)

            const element = document.createElement(`x-node-${type}`)

            element.setAttribute("id", `node-${id}`)
            element.setAttribute("x", `${x - minX.x}`)
            element.setAttribute("y", `${y - minY.y}`)
            element.setAttribute("width", `${width}`)
            element.setAttribute("height", `${height}`)
            if(color) element.setAttribute("color", color)

            this.nodeElementsById[id] = element

            switch(type) {
                case "text":
                    const {text} = node
                    element.setAttribute("text", text)
                    break

                case "file":
                    const {file} = node
                    const {name} = fileDetails(file)
                    element.setAttribute("file", file)
                    element.setAttribute("file-name", name)
                    this.nodeElementsByPath[file] = element
                    this.nodeElementsByName[name] = element
                    break

                case "group":
                    const {label} = node
                    element.setAttribute("label", label)
                    break

                default:
                    console.warn("Encountered node of unimplemented type: ", type)
                    break
            }

            this.nodesContainer.appendChild(element)
        }

        for(const edge of this.parsedContents["edges"]) {
            let {id, fromNode, fromSide, toNode, toSide, color, toEnd: arrows} = edge

            const element = document.createElement("x-edge")
            element.setAttribute("id", `edge-${id}`)
            element.setAttribute("node-from", fromNode)
            element.setAttribute("node-from-side", fromSide)
            element.setAttribute("node-to", toNode)
            element.setAttribute("node-to-side", toSide)
            if(edge["color"]) element.setAttribute("color", color)
            if(edge["arrows"]) element.setAttribute("arrows", arrows)

            this.edgeElementsById[id] = element
            this.edgesContainer.appendChild(element)
        }

        this.nodesContainer.style["width"] = `${maxX.x + maxX.width - minX.x}px`
        this.nodesContainer.style["height"] = `${maxY.y + maxY.height - minY.y}px`

        this.edgesContainer.style["width"] = `${maxX.x + maxX.width - minX.x}px`
        this.edgesContainer.style["height"] = `${maxY.y + maxY.height - minY.y}px`

        this.appendChild(this.nodesContainer)
        this.appendChild(this.edgesContainer)
    }
}


export class CanvasItemElement extends CustomElement {
    colorToHex() {
        const color = this.getAttribute("color")

        if(color === undefined || color === null || color === "") {
            return "var(--color-gray)"
        }
        else if(color.startsWith("#")) {
            // This is an hex color
            return color
        }
        else {
            return {
                "0": "var(--color-gray)",
                "1": "var(--color-red)",
                "2": "var(--color-orange)",
                "3": "var(--color-yellow)",
                "4": "var(--color-green)",
                "5": "var(--color-blue)",
                "6": "var(--color-purple)",
            }[color]
        }
    }

    constructor() {
        super();

        if(this.constructor === CanvasItemElement) {
            throw new NotImplementedError("CanvasItemElement is being used as-is.")
        }
    }
}
