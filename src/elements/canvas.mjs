export class CanvasElement extends HTMLElement {
    static getTemplate() {
        return document.getElementById("template-canvas")
    }

    parsedJSON

    canvasElement
    nodeElements = []
    edgeElements = []

    constructor() {
        super()
        this.parsedJSON = JSON.parse(this.getAttribute("contents"))
    }

    // noinspection JSUnusedGlobalSymbols
    connectedCallback() {
        const instanceDocument = CanvasElement.getTemplate().content.cloneNode(true)
        const shadow = this.attachShadow({ mode: "open" })

        this.canvasElement = instanceDocument.querySelector(".canvas")

        let minX = { x: Infinity, width: 0 }
        let minY = { y: Infinity, height: 0 }
        let maxX = { x: -Infinity, width: 0 }
        let maxY = { y: -Infinity, height: 0 }

        for(const node of this.parsedJSON["nodes"]) {
            if(node["type"] === "file") {
                if(node["x"] < minX["x"]) minX = node
                if(node["y"] < minY["y"]) minY = node
                if(node["x"] + node["width"] > maxX["x"] + node["width"]) maxX = node
                if(node["y"] + node["height"] > maxY["y"] + node["height"]) maxY = node
            }
            else {
                console.warn("Encountered node of unimplemented type: ", node["type"])
            }
        }

        console.debug("minX:", minX, "| minY:", minY, "| maxX:", maxX, "| maxY:", maxY)

        for(const node of this.parsedJSON["nodes"]) {
            if(node["type"] === "file") {
                const element = document.createElement("x-node-file")
                element.setAttribute("file", node["file"])
                element.setAttribute("id", node["id"])
                element.setAttribute("x", node["x"] - minX["x"])
                element.setAttribute("y", node["y"] - minY["y"])
                element.setAttribute("width", node["width"])
                element.setAttribute("height", node["height"])
                element.setAttribute("color", node["color"])

                this.nodeElements.push(element)
                this.canvasElement.appendChild(element)
            }
            else {
                console.warn("Encountered node of unimplemented type: ", node["type"])
            }
        }

        this.canvasElement.style["width"] = `${maxX["x"] + maxX["width"] - minX["x"]}px`
        this.canvasElement.style["height"] = `${maxY["y"] + maxY["height"] - minY["y"]}px`

        shadow.appendChild(instanceDocument)
    }
}