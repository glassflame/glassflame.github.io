import {CardElement} from "./card.mjs"
import {WikilinkElement} from "./elements/wikilink.mjs";
import {HashtagElement} from "./elements/hashtag.mjs";

customElements.define("x-card", CardElement)
customElements.define("x-wikilink", WikilinkElement)
customElements.define("x-hashtag", HashtagElement)
