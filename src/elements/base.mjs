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
     * The local cloned instance of the template node.
     * @type {Node}
     */
    #instance

    /**
     * The local cloned instance of the template node.
     * @returns {Node}
     */
    get instance() {
        return this.#instance
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Callback automatically called when this element is added to the DOM.
     */
    connectedCallback() {
        // The template to duplicate.
        const template = this.constructor.getTemplate()
        // The shadow root, the inner contents of the element..
        const shadow = this.attachShadow({ mode: "open" })
        // The element contained inside the shadow root..
        this.#instance = template.content.cloneNode(true)
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
