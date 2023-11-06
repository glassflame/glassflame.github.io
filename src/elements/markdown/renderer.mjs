import { Marked } from "https://unpkg.com/marked@9.1.2/lib/marked.esm.js";
import { CustomElement } from "../base.mjs";


/**
 * Element rendering the Markdown contents of an Obsidian page.
 */
export class MarkdownElement extends CustomElement {
    static get template() {
        return document.getElementById("template-markdown")
    }

    /**
     * {@link Marked} Markdown renderer.
     * @type {Marked}
     */
    static MARKED = new Marked({
        extensions: [
            {
                name: "frontmatter",
                level: "block",
                start(src) {
                    return src.match(/(-{3,})/)?.index
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
                    // TODO: Doesn't this break if token.data contains quotes?
                    return `<x-frontmatter lang="${token.lang}" data="${token.data.replaceAll('"', '&quot;')}"></x-frontmatter>`;
                }
            },
            {
                name: "wikilink",
                level: "inline",
                start(src) {
                    return src.match(/\[\[/)?.index
                },
                tokenizer(src, _) {
                    const match = src.match(/^\[\[([^|\]]+)(?:\|([^\]]+))?]]/)
                    if(match) {
                        return {
                            type: "wikilink",
                            raw: match[0],
                            target: match[1],
                            text: match[2],
                        }
                    }
                },
                renderer(token) {
                    return `<x-wikilink target="${token.target}" text="${token.text}"></x-wikilink>`
                },
            },
            {
                name: "hashtag",
                level: "inline",
                start(src) {
                    return src.match(/#/)?.index
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
                    return `<x-hashtag tag="${token.tag}"></x-hashtag>`
                }
            },
            {
                name: "mathBlock",
                level: "block",
                start(src) {
                    return src.match(/[$][$]/)?.index
                },
                tokenizer(src, _) {
                    const match = src.match(/^[$][$](.+?)[$][$]/s)
                    if(match) {
                        return {
                            type: "mathBlock",
                            raw: match[0],
                            document: match[1],
                        }
                    }
                },
                renderer(token) {
                    return `<x-math document="${token.document}" block></x-math>`
                }
            },
            {
                name: "mathInline",
                level: "inline",
                start(src) {
                    return src.match(/[$]/)?.index
                },
                tokenizer(src, _) {
                    const match = src.match(/^[$](.+?)[$]/)
                    if(match) {
                        console.log(match)
                        return {
                            type: "mathInline",
                            raw: match[0],
                            document: match[1],
                        }
                    }
                },
                renderer(token) {
                    return `<x-math document="${token.document}"></x-math>`
                }
            },
        ]
    })

    /**
     * Markdown source of the document to render, obtained from the `document` attribute.
     * @returns {string}
     */
    get markdownDocument() {
        return this.getAttribute("document")
    }

    /**
     * Element containing the rendered Markdown source.
     * Can be recreated with {@link recreateDocumentElement}.
     * @type {HTMLDivElement}
     */
    documentElement

    /**
     * The name of the slot where {@link documentElement} should be placed in.
     * @type {string}
     */
    static DOCUMENT_ELEMENT_SLOT = "markdown-document"

    /**
     * Recreate {@link documentElement} using the current value of {@link markdownDocument}.
     */
    recreateDocumentElement() {
        if(this.documentElement) {
            this.documentElement.remove()
            this.documentElement = null
        }

        this.documentElement = document.createElement("div")
        this.documentElement.slot = this.constructor.DOCUMENT_ELEMENT_SLOT
        this.documentElement.innerHTML = this.constructor.MARKED.parse(this.markdownDocument)
        this.appendChild(this.documentElement)
    }

    onConnect() {
        super.onConnect()
        this.recreateDocumentElement()
    }
}
