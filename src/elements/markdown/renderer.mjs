import { Marked } from "https://unpkg.com/marked@9.1.2/lib/marked.esm.js";
import { CustomElement } from "../base.mjs";
import {toTitleCase} from "../../utils/case.mjs";
import {findFirstAncestor} from "../../utils/traversal.mjs";
import {VaultElement} from "../vault.mjs";


/**
 * Element rendering the Markdown contents of an Obsidian page.
 */
export class MarkdownElement extends CustomElement {
    static get template() {
        return document.getElementById("template-markdown")
    }

    /**
     * Element representing the Obsidian Vault.
     * Can be recalculated with {@link recalculateVault}.
     * @type {VaultElement}
     */
    vault

    /**
     * Recalculate the value of {@link browse} and {@link vault} using this element's current position in the DOM.
     * @returns {void}
     */
    recalculateVault() {
        this.vault = findFirstAncestor(this, VaultElement)
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * {@link Marked} Markdown renderer.
     * @type {Marked}
     */
    static MARKED = new Marked({
        tokenizer: {
            // Fix single, double, and triple equals on a single line being interpreted as headings
            lheading(raw) {
                const cap = /^(?![.+*] )((?:.|\n(?!\s*?\n|[.+*] ))+?)\n {0,3}(={4,}|-{4,}) *(?:\n+|$)/.exec(raw);
                if (cap) {
                    return {
                        type: 'heading',
                        raw: cap[0],
                        depth: cap[2].charAt(0) === '=' ? 1 : 2,
                        text: cap[1],
                        tokens: this.lexer.inline(cap[1])
                    };
                }
            },
            blockquote(raw) {
                const calloutMatch = raw.match(/^\[!(.+)]([-+])? ?([^\n]+)?(?:\n+(.*))?/)
                if(calloutMatch) {
                    const [, kind, collapse, rawAdmonition, rawContents] = calloutMatch
                    const admonition = []
                    const contents = []
                    this.lexer.inlineTokens(rawAdmonition, admonition)
                    this.lexer.blockTokens(rawContents, contents)
                    const result = {
                        type: "callout",
                        raw,
                        kind,
                        collapse,
                        admonition,
                        contents,
                    }
                    return result
                }
                return false
            }
        },
        renderer: {
            link(url, title, text) {
                title = title ?? ""

                if(text.startsWith("^")) {
                    return `<a href="${url}" title="${title}" class="citation"></a>`
                }
                else {
                    return `<a href="${url}" title="${title}">${text}</a>`
                }
            }
        },
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
                name: "mathBlock",
                level: "block",
                start(src) {
                    return src.match(/[$][$]/)?.index
                },
                tokenizer(src, _) {
                    const match = src.match(/^[$][$](.*?)[$][$]/s)
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
                name: "wikiimg",
                level: "block",
                start(src) {
                    return src.match(/!\[\[/)?.index
                },
                tokenizer(src, _) {
                    const match = src.match(/^!\[\[([^|\]]*)]]/)
                    if(match) {
                        return {
                            type: "wikiimg",
                            raw: match[0],
                            target: match[1]
                        }
                    }
                },
                renderer(token) {
                    return `<x-wikiimg target="${token.target}"></x-wikiimg>`
                },
            },
            {
                name: "wikilink",
                level: "inline",
                start(src) {
                    return src.match(/\[\[/)?.index
                },
                tokenizer(src, _) {
                    const match = src.match(/^\[\[([^|\]]*)(?:\|([^\]]*))?]]/)
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
                name: "mathInline",
                level: "inline",
                start(src) {
                    return src.match(/[$]/)?.index
                },
                tokenizer(src, _) {
                    const match = src.match(/^[$](.+?)[$]/)
                    if(match) {
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
            {
                name: "highlight",
                level: "inline",
                start(src) {
                    return src.match(/==/)?.index
                },
                tokenizer(src, _) {
                    const match = src.match(/^==(.*?)==/)
                    if(match) {
                        return {
                            type: "highlight",
                            raw: match[0],
                            text: match[1],
                        }
                    }
                },
                renderer(token) {
                    return `<mark>${token.text}</mark>`
                },
            },
            {
                name: "callout",
                level: "block",
                renderer(token) {
                    let admonition = this.parser.parseInline(token.admonition)
                    const contents = this.parser.parse(token.contents)

                    if(admonition === "") {
                        admonition = toTitleCase(token.kind)
                    }

                    return `<x-callout kind="${token.kind}" collapse="${token.collapse}"><span slot="callout-admonition">${admonition}</span><div slot="callout-contents">${contents}</div></x-callout>`
                }
            }
        ],
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
     * Macros to be used in every single {@link MathElement} of the renderer.
     */
    katexMacros

    /**
     * Update {@link katexMacros} from the root {@link VaultElement}.
     * @returns {Promise<void>}
     */
    async refetchKatexMacros() {
        await this.vault.sleepUntilKatexMacrosAreAvailable()
        this.katexMacros = {...this.vault.katexMacros}
        this.#katexMacrosQueue.forEach(resolve => resolve(undefined))
    }

    /**
     * Array of resolve {@link Promise} objects of tasks awaiting {@link sleepUntilKatexPreambleIsAvailable}.
     * @type {((v: undefined) => void)[]}
     */
    #katexMacrosQueue = []

    /**
     * Await until {@link katexPreamble} becomes available.
     * @returns {Promise<void>}
     */
    async sleepUntilKatexMacrosAreAvailable() {
        if(this.katexMacros !== undefined) {
            return
        }
        await new Promise(resolve => this.#katexMacrosQueue.push(resolve))
    }

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
        this.recalculateVault()
        this.recreateDocumentElement()
        this.refetchKatexMacros().then()
    }
}
