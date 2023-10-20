import { Marked } from "https://unpkg.com/marked@9.1.2/lib/marked.esm.js";


/**
 * Element rendering the Markdown contents of an Obsidian page.
 */
export class MarkdownElement extends HTMLElement {
    static marked = new Marked({
        extensions: [
            {
                name: "frontmatter",
                level: "block",
                start(src) {
                    return src.match(/^---/)?.index
                },
                tokenizer(src, tokens) {
                    const match = src.match(/^---(.+)?\n(.+)\n---\n/)
                    if(match) {
                        return {
                            type: "frontmatter",
                            raw: match[0],
                            lang: match[1],
                            data: match[2],
                        }
                    }
                },
                renderer(token) {
                    return `<pre><code lang="${token.lang}">${token.data}</code></pre>`;
                }
            },
            {
                name: "wikilink",
                level: "inline",
                start(src) {
                    return src.match(/^\[\[/)?.index
                },
                tokenizer(src, tokens) {
                    const match = src.match(/^\[\[([^|\]]+)(?:\|([^\]]+))?]]/)
                    if(match) {
                        return {
                            type: "wikilink",
                            raw: match[0],
                            wref: match[1],
                            text: match[2],
                        }
                    }
                },
                renderer(token) {
                    return `<x-wikilink wref="${token.wref}"><span slot="wikilink-text">${token.text ?? token.wref}</span></x-wikilink>`
                },
            },
            {
                name: "hashtag",
                level: "inline",
                start(src) {
                    return src.match(/^#/)?.index
                },
                tokenizer(src, tokens) {
                    const match = src.match(/^#([A-Za-z0-9]+)/)
                    if(match) {
                        return {
                            type: "hashtag",
                            raw: match[0],
                            tag: match[1],
                        }
                    }
                },
                renderer(token) {
                    return `<x-hashtag><span slot="hashtag-text">#${token.tag}</span></x-hashtag>`
                }
            }
        ]
    })

    contentsElement

    static getTemplate() {
        return document.getElementById("template-markdown")
    }

    // noinspection JSUnusedGlobalSymbols
    connectedCallback() {
        const instanceDocument = MarkdownElement.getTemplate().content.cloneNode(true)
        const shadow = this.attachShadow({ mode: "open" })

        const markdown = this.getAttribute("contents")

        this.contentsElement = document.createElement("div")
        this.contentsElement.setAttribute("slot", "markdown-contents")
        this.contentsElement.innerHTML = MarkdownElement.marked.parse(markdown)

        this.appendChild(this.contentsElement)

        shadow.appendChild(instanceDocument)
    }
}

/**
 * Element rendering an Obsidian Hashtag.
 */
export class HashtagElement extends HTMLElement {
    static getTemplate() {
        return document.getElementById("template-hashtag")
    }

    // noinspection JSUnusedGlobalSymbols
    connectedCallback() {
        const instanceDocument = HashtagElement.getTemplate().content.cloneNode(true)
        const shadow = this.attachShadow({ mode: "open" })

        shadow.appendChild(instanceDocument)
    }
}

/**
 * Element rendering an Obsidian Wikilink.
 */
export class WikilinkElement extends HTMLElement {
    static getTemplate() {
        return document.getElementById("template-wikilink")
    }

    /**
     * Get the card this Wikilink points to via the `wref` attribute.
     *
     * @returns {String} The card target.
     */
    getWikilinkWref() {
        return this.getAttribute("wref")
    }

    // noinspection JSUnusedGlobalSymbols
    connectedCallback() {
        const instanceDocument = WikilinkElement.getTemplate().content.cloneNode(true)
        const shadow = this.attachShadow({ mode: "open" })

        const wref = this.getWikilinkWref()

        this.addEventListener("click", function() {
            console.warn("Would move to", wref, ", but navigation is not yet implemented.")
        })

        shadow.appendChild(instanceDocument)
    }
}
