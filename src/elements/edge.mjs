import { CanvasElement, CanvasItemElement } from "./canvas.mjs";


export class EdgeElement extends CanvasItemElement {
    static getTemplate() {
        return document.getElementById("template-edge")
    }

    svgSlotted
    lineElement

    // noinspection JSUnusedGlobalSymbols
    connectedCallback() {
        const instanceDocument = EdgeElement.getTemplate().content.cloneNode(true)
        const shadow = this.attachShadow({ mode: "open" })

        const canvas = CanvasElement.findFirstCanvasAncestor(this)

        const fromNode = canvas.nodeElements[this.getAttribute("node-from")]
        const fromSide = this.getAttribute("node-from-side")
        const [x1, y1] = fromNode.getCenterCoordinatesOfSide(fromSide)

        const toNode = canvas.nodeElements[this.getAttribute("node-to")]
        const toSide = this.getAttribute("node-to-side")
        const [x2, y2] = toNode.getCenterCoordinatesOfSide(toSide)

        const minX = Math.min(x1, x2)
        const minY = Math.min(y1, y2)
        const diffX = Math.abs(x1 - x2)
        const diffY = Math.abs(y1 - y2)

        const arrows = this.getAttribute("arrows") ?? "end"

        this.svgSlotted = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        this.svgSlotted.slot = "edge-svg"
        this.svgSlotted.style.setProperty("position", "absolute")
        this.svgSlotted.style.setProperty("left", "0")
        this.svgSlotted.style.setProperty("top", "0")
        this.svgSlotted.style.setProperty("overflow", "visible")

        this.lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line")
        this.lineElement.setAttribute("x1", x1)
        this.lineElement.setAttribute("y1", y1)
        this.lineElement.setAttribute("x2", x2)
        this.lineElement.setAttribute("y2", y2)
        this.lineElement.style.setProperty("stroke", this.colorToHex())
        this.lineElement.style.setProperty("stroke-width", "var(--edge-width)")

        this.svgSlotted.appendChild(this.lineElement)
        this.appendChild(this.svgSlotted)

        shadow.appendChild(instanceDocument)
    }
}