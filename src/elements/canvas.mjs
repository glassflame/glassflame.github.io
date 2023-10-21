import { fileDetails } from "../utils/file.mjs";


export class CanvasElement extends HTMLElement {
    /**
     * Return the closest {@link CanvasElement} ancestor in the tree.
     *
     * @param initial {HTMLElement} The element to start the search from.
     */
    static findFirstCanvasAncestor(initial) {
        let current = initial
        while(current) {
            if(current instanceof ShadowRoot) {
                current = current.host
            }
            if(current instanceof CanvasElement) {
                return current
            }
            current = current.parentNode
        }
        return null
    }

    static getTemplate() {
        return document.getElementById("template-canvas")
    }

    parsedJSON

    nodesSlotted
    edgesSlotted
    nodeElements = {}
    edgeElements = {}

    // noinspection JSUnusedGlobalSymbols
    connectedCallback() {
        const instanceDocument = CanvasElement.getTemplate().content.cloneNode(true)
        const shadow = this.attachShadow({ mode: "open" })

        this.parsedJSON = JSON.parse(this.getAttribute("contents"))

        this.nodesSlotted = document.createElement("div")
        this.nodesSlotted.slot = "canvas-nodes"

        this.edgesSlotted = document.createElement("div")
        this.edgesSlotted.slot = "canvas-edges"

        let minX = { x: Infinity, width: 0 }
        let minY = { y: Infinity, height: 0 }
        let maxX = { x: -Infinity, width: 0 }
        let maxY = { y: -Infinity, height: 0 }

        for(const node of this.parsedJSON["nodes"]) {
            if(node["x"] < minX["x"]) minX = node
            if(node["y"] < minY["y"]) minY = node
            if(node["x"] + node["width"] > maxX["x"] + node["width"]) maxX = node
            if(node["y"] + node["height"] > maxY["y"] + node["height"]) maxY = node
        }

        for(const node of this.parsedJSON["nodes"]) {
            const element = document.createElement(`x-node-${node["type"]}`)

            element.setAttribute("id", node["id"])
            element.setAttribute("x", node["x"] - minX["x"])
            element.setAttribute("y", node["y"] - minY["y"])
            element.setAttribute("width", node["width"])
            element.setAttribute("height", node["height"])
            if(node["color"]) element.setAttribute("color", node["color"])

            switch(node["type"]) {
                case "text":
                    element.setAttribute("text", node["text"])
                    break

                case "file":
                    element.setAttribute("file", node["file"])
                    element.setAttribute("fileName", fileDetails(node["file"])[0])
                    break

                case "group":
                    element.setAttribute("label", node["label"])
                    break

                default:
                    console.warn("Encountered node of unimplemented type: ", node["type"])
                    break
            }

            this.nodeElements[node["id"]] = element
            this.nodesSlotted.appendChild(element)
        }

        for(const edge of this.parsedJSON["edges"]) {
            const element = document.createElement("x-edge")
            element.setAttribute("id", edge["id"])
            element.setAttribute("node-from", edge["fromNode"])
            element.setAttribute("node-from-side", edge["fromSide"])
            element.setAttribute("node-to", edge["toNode"])
            element.setAttribute("node-to-side", edge["toSide"])
            if(edge["color"]) element.setAttribute("color", edge["color"])
            if(edge["arrows"]) element.setAttribute("arrows", edge["toEnd"])

            this.edgeElements[edge["id"]] = element
            this.edgesSlotted.appendChild(element)
        }

        this.nodesSlotted.style["position"] = "relative"
        this.nodesSlotted.style["left"] = "0"
        this.nodesSlotted.style["top"] = "0"
        this.nodesSlotted.style["width"] = `${maxX["x"] + maxX["width"] - minX["x"]}px`
        this.nodesSlotted.style["height"] = `${maxY["y"] + maxY["height"] - minY["y"]}px`

        this.edgesSlotted.style["position"] = "absolute"
        this.edgesSlotted.style["left"] = "0"
        this.edgesSlotted.style["top"] = "0"
        this.edgesSlotted.style["width"] = `${maxX["x"] + maxX["width"] - minX["x"]}px`
        this.edgesSlotted.style["height"] = `${maxY["y"] + maxY["height"] - minY["y"]}px`

        this.appendChild(this.nodesSlotted)
        this.appendChild(this.edgesSlotted)

        shadow.appendChild(instanceDocument)
    }
}


/**
 * Element representing the generic skeleton of an Obsidian Canvas item.
 */
export class CanvasItemElement extends HTMLElement {
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
            // TODO: Check which colors correspond to what
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
}
