import { CanvasItemElement } from "src/elements/canvas/canvasitem.mjs";


/**
 * Abstract base class for nodes of a {@link CanvasElement}.
 * @abstract
 */
export class NodeElement extends CanvasItemElement {
    /**
     * Coordinates of the point where edges connected to the top of this node should attach to.
     * @type {[number, number]}
     */
    edgeHandleTop

    /**
     * Coordinates of the point where edges connected to the bottom of this node should attach to.
     * @type {[number, number]}
     */
    edgeHandleBottom

    /**
     * Coordinates of the point where edges connected to the left of this node should attach to.
     * @type {[number, number]}
     */
    edgeHandleLeft

    /**
     * Coordinates of the point where edges connected to the right of this node should attach to.
     * @type {[number, number]}
     */
    edgeHandleRight

    /**
     * Recalculate the values of {@link edgeHandleTop}, {@link edgeHandleBottom}, {@link edgeHandleLeft}, {@link edgeHandleRight} using the current values of {@link x}, {@link y}, {@link height}, {@link width}.
     */
    recalculateEdgeHandles() {
        this.edgeHandleTop = [
            this.x + this.width / 2,
            this.y,
        ]
        this.edgeHandleBottom = [
            this.x + this.width / 2,
            this.y + this.height,
        ]
        this.edgeHandleLeft = [
            this.x,
            this.y + this.height / 2,
        ]
        this.edgeHandleRight = [
            this.x + this.width,
            this.y + this.height / 2,
        ]
    }

    /**
     * Get the edge handle at the given side, selecting one of {@link edgeHandleTop}, {@link edgeHandleBottom}, {@link edgeHandleLeft}, or {@link edgeHandleRight}.
     * @param side {"top"|"bottom"|"left"|"right"} The side whose edge handle to get.
     * @returns {[number,number]} Coordinates of the edge handle.
     */
    edgeHandle(side) {
        switch(side) {
            case "top":
                return this.edgeHandleTop
            case "bottom":
                return this.edgeHandleBottom
            case "left":
                return this.edgeHandleLeft
            case "right":
                return this.edgeHandleRight
        }
    }

    onConnect() {
        super.onConnect()
        this.recalculateEdgeHandles()
    }
}
