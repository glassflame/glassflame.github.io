import { fileDetails } from "../utils/file.mjs";
import { CustomElement, NotImplementedError } from "./base.mjs";


export class CanvasElement extends CustomElement {
    static getTemplate() {
        return document.getElementById("template-canvas")
    }

    parsedJSON

    nodesSlotted
    edgesSlotted
    nodeElements = {}
    edgeElements = {}

    onConnected() {
        super.onConnected();

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

            element.setAttribute("id", `node-${node["id"]}`)
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
                    element.setAttribute("file-name", fileDetails(node["file"]).name)
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
            element.setAttribute("id", `edge-${edge["id"]}`)
            element.setAttribute("node-from", edge["fromNode"])
            element.setAttribute("node-from-side", edge["fromSide"])
            element.setAttribute("node-to", edge["toNode"])
            element.setAttribute("node-to-side", edge["toSide"])
            if(edge["color"]) element.setAttribute("color", edge["color"])
            if(edge["arrows"]) element.setAttribute("arrows", edge["toEnd"])

            this.edgeElements[edge["id"]] = element
            this.edgesSlotted.appendChild(element)
        }

        this.nodesSlotted.style["width"] = `${maxX["x"] + maxX["width"] - minX["x"]}px`
        this.nodesSlotted.style["height"] = `${maxY["y"] + maxY["height"] - minY["y"]}px`

        this.edgesSlotted.style["width"] = `${maxX["x"] + maxX["width"] - minX["x"]}px`
        this.edgesSlotted.style["height"] = `${maxY["y"] + maxY["height"] - minY["y"]}px`

        this.appendChild(this.nodesSlotted)
        this.appendChild(this.edgesSlotted)
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
