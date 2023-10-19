import {Marked} from "https://unpkg.com/marked@9.1.2/lib/marked.esm.js"

/**
 * The {@link Marked} instance to use for parsing page contents.
 *
 * @type {Marked}
 */
const marked = new Marked({
    extensions: [
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

/**
 * Parse the given text string as Markdown using {@link marked}, emitting HTML.
 *
 * @param contents The text string to parsed.
 * @returns {String} The resulting HTML.
 */
export function parsePageContents(contents) {
    return marked.parse(contents)
}
