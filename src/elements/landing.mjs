import {CustomElement} from "./base.mjs";

export class LandingElement extends CustomElement {
    static get template() {
        return document.getElementById("template-landing")
    }

    onConnect() {
        super.onConnect()
    }
}