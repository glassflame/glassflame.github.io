export class NotImplementedError extends Error {}


export class CustomElement extends HTMLElement {

    template
    shadow
    instance

    // noinspection JSUnusedGlobalSymbols
    connectedCallback() {
        // The template to duplicate.
        this.template = this.constructor.getTemplate()
        // The shadow root, the inner contents of the element..
        this.shadow = this.attachShadow({ mode: "open" })
        // The element contained inside the shadow root..
        this.instance = this.template.content.cloneNode(true)

        // Call the custom callback.
        this.onConnected()

        // Add the instance to the DOM.
        this.shadow.appendChild(this.instance)
    }

    findFirstAncestor(constructor) {
        let current = this
        // Keep iterating over nodes
        while(current) {
            // The ancestor has been found!
            if(current instanceof constructor) {
                return current
            }
            // Use .host to access the parent of a ShadowRoot
            else if(current instanceof ShadowRoot) {
                current = current.host
            }
            // Use .parentNode to access the parent of a HTMLElement
            else if(current instanceof HTMLElement) {
                current = current.parentNode
            }
            // Something went wrong?
            else {
                console.warn("[findFirstAncestor] Reached unknown node:", current)
            }
        }
        // The ancestor has NOT been found...
        return null
    }

    constructor() {
        super();

        if(this.constructor === CustomElement) {
            throw new NotImplementedError("CustomElement is being used as-is.")
        }
    }

    onConnected() {}

    static getTemplate() {
        throw new NotImplementedError("CustomElement.getTemplate has not been overridden.")
    }
}
