import { CanvasElement } from "../canvas.mjs";
import { CanvasItemElement } from "../canvasitem.mjs";
import { findFirstAncestor } from "../../../utils/trasversal.mjs";


/**
 * An edge of a {@link CanvasElement}.
 */
export class EdgeElement extends CanvasItemElement {
    static get template() {
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
        this.canvas = findFirstAncestor(this, CanvasElement)
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

    static SVG_ELEMENT_SLOT = "edge-svg"

    /**
     * Recreate {@link svgElement} and {@link lineElement} with the current values of the element.
     * @returns {void}
     */
    recreateSvgElement() {
        if(this.svgElement) {
            this.svgElement.remove()
            this.svgElement = null
            this.lineElement = null
        }

        const [x1, y1] = this.fromNode.edgeHandle(this.nodeFromSide)
        const [x2, y2] = this.toNode.edgeHandle(this.nodeToSide)

        this.lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line")
        this.lineElement.setAttribute("x1", x1.toString())
        this.lineElement.setAttribute("y1", y1.toString())
        this.lineElement.setAttribute("x2", x2.toString())
        this.lineElement.setAttribute("y2", y2.toString())

        this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        this.svgElement.slot = this.constructor.SVG_ELEMENT_SLOT
        this.svgElement.style.setProperty("position", "absolute")
        this.svgElement.style.setProperty("left", "0")
        this.svgElement.style.setProperty("top", "0")
        this.svgElement.style.setProperty("overflow", "visible")

        this.svgElement.appendChild(this.lineElement)
        this.appendChild(this.svgElement)
    }

    onConnect() {
        super.onConnect()
        this.recalculateCanvas()
        this.recalculateFromTo()
        this.recreateSvgElement()
    }
}
