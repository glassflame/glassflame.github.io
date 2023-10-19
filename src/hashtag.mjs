export class HashtagElement extends HTMLElement {
    connectedCallback() {
        const templateElement = document.getElementById("template-hashtag")
        const instanceElement = templateElement.content.cloneNode(true)

        const shadow = this.attachShadow({ mode: "open" })
        shadow.appendChild(instanceElement)
    }
}
