import { Marked } from "https://unpkg.com/marked@9.1.2/lib/marked.esm.js";
import { CustomElement } from "./base.mjs";


/**
 * Element rendering the Markdown contents of an Obsidian page.
 */
export class MarkdownElement extends CustomElement {
    static marked = new Marked({
        extensions: [
            {
                name: "frontmatter",
                level: "block",
                start(src) {
                    return src.match(/^(-{3,})/)?.index
                },
                tokenizer(src, _) {
                    const match = src.match(/^(-{3,})(.+)?\n((?:.+\n)*)\1\n/)
                    if(match) {
                        return {
                            type: "frontmatter",
                            raw: match[0],
                            lang: match[2],
                            data: match[3],
                        }
                    }
                },
                renderer(token) {
                    return `<x-frontmatter><code slot="frontmatter-contents" lang="${token.lang}">${token.data}</code></x-frontmatter>`;
                }
            },
            {
                name: "wikilink",
                level: "inline",
                start(src) {
                    return src.match(/^\[\[/)?.index
                },
                tokenizer(src, _) {
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
                tokenizer(src, _) {
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

    onConnect() {
        const markdown = this.getAttribute("contents")

        this.contentsElement = document.createElement("div")
        this.contentsElement.setAttribute("slot", "markdown-contents")
        this.contentsElement.innerHTML = MarkdownElement.marked.parse(markdown)

        this.appendChild(this.contentsElement)
    }
}

/**
 * Element rendering Obsidian front matter.
 */
export class FrontMatterElement extends CustomElement {
    static getTemplate() {
        return document.getElementById("template-frontmatter")
    }
}

/**
 * Element rendering an Obsidian Hashtag.
 */
export class HashtagElement extends CustomElement {
    static getTemplate() {
        return document.getElementById("template-hashtag")
    }
}

/**
 * Element rendering an Obsidian Wikilink.
 */
export class WikilinkElement extends CustomElement {
    static getTemplate() {
        return document.getElementById("template-wikilink")
    }

    onConnect() {
        const instanceElement = this.instance.querySelector(".wikilink")

        const destinationURL = new URL(window.location)
        destinationURL.hash = this.getAttribute("wref")

        instanceElement.href = destinationURL
    }
}
