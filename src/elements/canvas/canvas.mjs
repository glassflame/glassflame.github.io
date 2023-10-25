import { fileDetails } from "../../utils/file.mjs";
import { CustomElement } from "../base.mjs";


/**
 * The renderer of an Obsidian Canvas.
 */
export class CanvasElement extends CustomElement {
    static get template() {
        return document.getElementById("template-canvas")
    }

    /**
     * The contents of the Canvas, as they were the last time they were updated.
     * @type {string}
     */
    #contents

    /**
     * The contents of the Canvas, as they were the last time they were updated.
     * @returns {string} The raw contents.
     */
    get contents() {
        return this.#contents
    }

    /**
     * The parsed contents of the Canvas, as they were the last time they were updated.
     * @type {Object}
     */
    #parsedContents

    /**
     * The parsed contents of the Canvas, as they were the last time they were updated.
     * @returns {Object} The parsed contents.
     */
    get parsedContents() {
        return this.#parsedContents
    }

    /**
     * Update the values of {@link contents} and {@link parsedContents} from the `contents` attribute of the element.
     * @throws SyntaxError If `contents` is not valid JSON.
     */
    recalculateContents() {
        this.#contents = this.getAttribute("contents")
        this.#parsedContents = JSON.parse(this.#contents)
    }

    /**
     * The minimum X node found in the items of this Canvas.
     * Used to compute this element's rect.
     * Can be computed from {@link contents} with {@link recalculateMinMax}.
     * @type {{x: number, width: number}}
     */
    minX

    /**
     * The minimum Y node found in the items of this Canvas.
     * Used to compute this element's rect.
     * Can be computed from {@link contents} with {@link recalculateMinMax}.
     * @type {{y: number, height: number}}
     */
    minY

    /**
     * The maximum X node found in the items of this Canvas.
     * Used to compute this element's rect.
     * Can be computed from {@link contents} with {@link recalculateMinMax}.
     * @type {{x: number, width: number}}
     */
    maxX

    /**
     * The maximum Y node found in the items of this Canvas.
     * Used to compute this element's rect.
     * Can be computed from {@link contents} with {@link recalculateMinMax}.
     * @type {{y: number, height: number}}
     */
    maxY

    /**
     * Compute {@link minX}, {@link minY}, {@link maxX}, {@link maxY} from {@link contents}.
     * @returns {void}
     */
    recalculateMinMax() {
        // Define initial values.
        this.minX = { x: Infinity, width: 0 }
        this.minY = { y: Infinity, height: 0 }
        this.maxX = { x: -Infinity, width: 0 }
        this.maxY = { y: -Infinity, height: 0 }
        // Iterate over nodes.
        for(const node of this.parsedContents["nodes"]) {
            // Convert node values from strings to numbers.
            let {x, y, width, height} = node
            x, y, width, height = Number(x), Number(y), Number(width), Number(height)
            // Update minX.
            if(x < this.minX.x) this.minX = node
            // Update minY.
            if(y < this.minY.y) this.minY = node
            // Update maxX.
            if(x + width > this.maxX.x + width) this.maxX = node
            // Update maxY.
            if(y + height > this.maxY.y + height) this.maxY = node
        }
    }

    /**
     * `<div>` containing all the {@link NodeElement}s of this Canvas.
     * @type {HTMLDivElement}
     */
    nodesContainer

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
     * Name of the slot where the node container should be placed.
     * @type {string}
     */
    static NODES_SLOT_NAME = "canvas-nodes"

    /**
     * Prefix to the name of the element to create for each node.
     * @type {string}
     */
    static NODE_ELEMENT_NAME_PREFIX = "x-node-"

    /**
     * Destroy and recreate the {@link nodesContainer} with the current {@link parsedContents}, {@link minX}, {@link minY}, {@link maxX}, {@link maxY}.
     * @returns {void}
     */
    recreateNodes() {
        if(this.nodesContainer) {
            this.nodesContainer.remove()
            this.nodesContainer = null
        }

        this.nodesContainer = document.createElement("div")
        this.nodesContainer.slot = this.constructor.NODES_SLOT_NAME

        for(const node of this.parsedContents["nodes"]) {
            let {id, type, color, x, y, width, height} = node
            x, y, width, height = Number(x), Number(y), Number(width), Number(height)

            const element = document.createElement(`${this.constructor.NODE_ELEMENT_NAME_PREFIX}${type}`)

            element.setAttribute("id", `node-${id}`)
            element.setAttribute("x", `${x - this.minX.x}`)
            element.setAttribute("y", `${y - this.minY.y}`)
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

        this.nodesContainer.style["width"] = `${this.maxX.x + this.maxX.width - this.minX.x}px`
        this.nodesContainer.style["height"] = `${this.maxY.y + this.maxY.height - this.minY.y}px`

        this.appendChild(this.nodesContainer)
    }

    /**
     * `<div>` containing all the {@link NodeElement}s of this Canvas.
     * @type {HTMLDivElement}
     */
    edgesContainer

    /**
     * Mapping associating ids to their respective {@link EdgeElement}s of this Canvas.
     * @type {{[id: string]: EdgeElement}}
     */
    edgeElementsById = {}

    /**
     * Name of the slot where the edge container should be placed.
     * @type {string}
     */
    static EDGES_SLOT_NAME = "canvas-nodes"

    /**
     * Prefix to the name of the element to create for each edge.
     * @type {string}
     */
    static EDGE_ELEMENT_NAME = "x-edge"

    /**
     * Destroy and recreate the {@link edgesContainer} with the current {@link parsedContents}, {@link minX}, {@link minY}, {@link maxX}, {@link maxY}.
     * @returns {void}
     */
    recreateEdges() {
        if(this.edgesContainer) {
            this.edgesContainer.remove()
            this.edgesContainer = null
        }

        this.edgesContainer = document.createElement("div")
        this.edgesContainer.slot = this.constructor.EDGES_SLOT_NAME

        for(const edge of this.parsedContents["edges"]) {
            let {id, fromNode, fromSide, toNode, toSide, color, toEnd: arrows} = edge

            const element = document.createElement(this.constructor.EDGE_ELEMENT_NAME)
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

        this.edgesContainer.style["width"] = `${this.maxX.x + this.maxX.width - this.minX.x}px`
        this.edgesContainer.style["height"] = `${this.maxY.y + this.maxY.height - this.minY.y}px`

        this.appendChild(this.edgesContainer)
    }

    onConnect() {
        this.recalculateContents()
        this.recalculateMinMax()
        this.recreateNodes()
        this.recreateEdges()
    }
}
