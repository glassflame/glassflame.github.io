/**
 * Utilities to trasverse the DOM.
 */

/**
 * Find the first ancestor which is an `instanceof` the given constructor.
 * @param start The node to start at.
 * @param constructor The constructor to match.
 * @returns {HTMLElement|null} The found ancestor, or `null` if no such ancestor is found.
 */
export function findFirstAncestor(start, constructor) {
    let current = start
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