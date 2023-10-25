import { CustomElement } from "src/elements/base.mjs";


/**
 * Abstract base class for elements drawn on a {@link CanvasElement}.
 * @abstract
 */
export class CanvasItemElement extends CustomElement {
    /**
     * @returns {number} The X coordinate of the top left vertex of this element.
     */
    get x() {
        return Number(this.getAttribute("x"))
    }

    /**
     * @returns {number} The Y coordinate of the top left vertex of this element.
     */
    get y() {
        return Number(this.getAttribute("y"))
    }

    /**
     * @returns {number} The horizontal width of this element.
     */
    get width() {
        return Number(this.getAttribute("width"))
    }

    /**
     * @returns {number} The vertical height of this element.
     */
    get height() {
        return Number(this.getAttribute("height"))
    }

    /**
     * The color of this element, as stored in Obsidian Canvas files.
     * Can be either `null`, a `number`, or a `string`.
     * @returns {null|number|string} The value in question.
     */
    get obsidianColor() {
        const color = this.getAttribute("color")
        if(color === null) return null  // No color specified

        const maybeNumber = Number(color)
        if(!isNaN(maybeNumber)) return maybeNumber  // Numeric color specified

        return color  // Hex color specified
    }

    /**
     * Given an Obsidian Canvas color, return its corresponding CSS color.
     * @param color {null|number|string} The color, as serialized in Obsidian Canvas files, or as returned by {@link obsidianColor}.
     * @returns {string} The corresponding CSS color.
     */
    static obsidianColorToCssColor(color) {
        if(color === null || color === "") {
            return "var(--color-gray)"
        }
        else if(color.match(/^#[0-9A-F]{3}$|^#[0-9A-F]{6}$/i)) {
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

    /**
     * The CSS color of this element, converted from {@link obsidianColor} with {@link obsidianColorToCssColor}.
     */
    get cssColor() {
        return this.constructor.obsidianColorToCssColor(this.obsidianColor)
    }

    /**
     * The CSS selector of the element in the template representing the canvas item.
     * @type {string}
     */
    static CANVAS_ITEM_SELECTOR = ".canvas-item"

    /**
     * The element in the instance representing the canvas item.
     * Can be set via {@link recalculateCanvasItemElement}.
     * @type {HTMLElement}
     */
    canvasItemElement

    /**
     * Update the value of the {@link canvasItemElement} by querying the current {@link instance} with {@link CANVAS_ITEM_SELECTOR}.
     */
    recalculateCanvasItemElement() {
        this.canvasItemElement = this.instance.querySelector(this.constructor.CANVAS_ITEM_SELECTOR)
    }

    /**
     * Set the CSS properties of {@link canvasItemElement}, making sure it gets rendered properly.
     * @returns {void}
     */
    resetCanvasItemCssProperties() {
        this.canvasItemElement.style.setProperty("box-sizing", "border-box")
        this.canvasItemElement.style.setProperty("position", "absolute")
        this.canvasItemElement.style.setProperty("left", `${this.getAttribute("x")}px`)
        this.canvasItemElement.style.setProperty("top", `${this.getAttribute("y")}px`)
        this.canvasItemElement.style.setProperty("width", `${this.getAttribute("width")}px`)
        this.canvasItemElement.style.setProperty("height", `${this.getAttribute("height")}px`)
        this.canvasItemElement.style.setProperty("--color-node", this.constructor.obsidianColorToCssColor(this.getAttribute("color")))
    }

    onConnect() {
        super.onConnect()
        this.recalculateCanvasItemElement()
        this.resetCanvasItemCssProperties()
    }
}
