import { CanvasElement } from "src/elements/canvas/canvas.mjs";
import { CanvasItemElement } from "src/elements/canvas/canvasitem.mjs";
import { findFirstAncestor } from "src/utils/trasversal.mjs";


/**
 * An edge of a {@link CanvasElement}.
 */
export class EdgeElement extends CanvasItemElement {
    static getTemplate() {
        return document.getElementById("template-edge")
    }

    /**
     * The canvas this element is contained in.
     * Can be recalculated with {@link recalculateCanvas}.
     * @type {CanvasElement}
     */
    canvas

    /**
     * Recalculate the value of {@link canvas}.
     */
    recalculateCanvas() {
        findFirstAncestor(this, CanvasElement)
    }

    /**
     * The id of the node this edge starts at, obtained from the `node-from` attribute.
     * @returns {string}
     */
    get fromNodeId() {
        return this.getAttribute("node-from")
    }

    /**
     * The id of the node this edge ends at, obtained from the `node-to` attribute.
     * @returns {string}
     */
    get toNodeId() {
        return this.getAttribute("node-to")
    }

    /**
     * The node this edge starts at.
     * Can be recalculated with {@link recalculateFromTo}.
     * @type {NodeElement}
     */
    fromNode

    /**
     * The node this edge ends at.
     * Can be recalculated with {@link recalculateFromTo}.
     * @type {NodeElement}
     */
    toNode

    /**
     * Recalculate the values of {@link fromNode} and {@link toNode} using the current values of {@link fromNodeId}, {@link toNodeId}, and {@link canvas}.
     * @returns {void}
     */
    recalculateFromTo() {
        this.fromNode = this.canvas.nodeElementsById[this.fromNodeId]
        this.toNode = this.canvas.nodeElementsById[this.toNodeId]
    }

    /**
     * The side of the node this edge starts at, obtained from the `node-from-side` attribute.
     * @returns {"top"|"bottom"|"left"|"right"}
     */
    get nodeFromSide() {
        return this.getAttribute("node-from-side")
    }

    /**
     * The side of the node this edge ends at, obtained from the `node-to-side` attribute.
     * @returns {"top"|"bottom"|"left"|"right"}
     */
    get nodeToSide() {
        return this.getAttribute("node-to-side")
    }

    /**
     * The SVG element rendering the edge.
     * Can be recreated with {@link recreateSvgElement}.
     * @type {SVGElement}
     */
    svgElement

    /**
     * The line element rendering the edge.
     * Can be recreated with {@link recreateSvgElement}.
     * @type {SVGLineElement}
     */
    lineElement

    // TODO: Last time, you were here!

    /**
     * Recreate {@link svgElement} and {@link lineElement} with the current values of the element.
     * @returns {void}
     */
    recreateSvgElement() {
        const [x1, y1] = this.fromNode.edgeHandle(this.nodeFromSide)
        const [x2, y2] = this.toNode.edgeHandle(this.nodeToSide)
    }

    onConnect() {
        super.onConnect()
        this.recalculateCanvas()
        this.recalculateFromTo()
        this.recreateSvgElement()

        const fromNode = canvas.nodeElements[this.getAttribute("node-from")]
        const fromSide = this.getAttribute("node-from-side")
        const [x1, y1] = fromNode.getCenterCoordinatesOfSide(fromSide)

        const toNode = canvas.nodeElements[this.getAttribute("node-to")]
        const toSide = this.getAttribute("node-to-side")
        const [x2, y2] = toNode.getCenterCoordinatesOfSide(toSide)

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
        this.lineElement.style.setProperty("stroke", this.constructor.colorToCSS(this.getAttribute("color")))
        this.lineElement.style.setProperty("stroke-width", "var(--edge-width)")

        this.svgSlotted.appendChild(this.lineElement)
        this.appendChild(this.svgSlotted)
    }
}