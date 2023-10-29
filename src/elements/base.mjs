import { NotImplementedError } from "../utils/errors.mjs";


/**
 * Abstract base utility class to simplify the construction of custom elements.
 * @abstract Implementors must override {@link template}.
 */
export class CustomElement extends HTMLElement {
    constructor() {
        super();
        // Prevent accidental instantiation of this class.
        if(this.constructor === CustomElement) {
            throw new NotImplementedError("CustomElement is being used as-is, but is an abstract class.")
        }
    }

    /**
     * Get the `<template>` to use when instantiating this element.
     * @abstract Must be overridden!
     */
    static get template() {
        throw new NotImplementedError("template has not been overridden.")
    }

    /**
     * Create a stylesheet which imports the stylesheet located at this module's path with `.mjs` replaced by `.css`.
     * @param importMetaURL The value of `import.meta.url` for the calling module.
     * @returns {CSSStyleSheet} The created stylesheet.
     */
    static makeModuleLikeStyleSheet(importMetaURL) {
        const importURL = importMetaURL.replace(/[.]mjs$/, ".css")
        const stylesheet = new CSSStyleSheet()
        stylesheet.replaceSync(`@import "${importURL}";`)
        return stylesheet
    }

    /**
     * A way to use inheritance with custom stylesheets.
     * @abstract Implementors should add their own stylesheets via this function.
     * @returns {CSSStyleSheet[]} An array of stylesheets that should be added to the {@link shadowRoot}.
     */
    static createStyleSheets() {
        return []
    }

    /**
     * The local cloned instance of the template node.
     * @type {Node}
     */
    #instance

    /**
     * The local cloned instance of the template node.
     * @returns {DocumentFragment}
     */
    get instance() {
        return this.#instance
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Callback automatically called when this element is added to the DOM.
     */
    connectedCallback() {
        // The shadow root, the inner contents of the element.
        const shadow = this.attachShadow({ mode: "open" })
        // Attach stylesheets to the shadow root.
        shadow.adoptedStyleSheets.push(...this.constructor.createStyleSheets())
        // The element contained inside the shadow root..
        this.#instance = this.constructor.template.content.cloneNode(true)
        // Call the custom callback.
        this.onConnect()
        // Add the instance to the DOM.
        shadow.appendChild(this.#instance)
    }

    /**
     * Do something just before `instance` is added to
     * @abstract Will do nothing if not overridden.
     */
    onConnect() {}
}
