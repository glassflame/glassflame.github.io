import { CustomElement } from "./base.mjs";
import { sleep } from "../utils/sleep.mjs";


/**
 * Element storing information about a Vault for its children.
 * The first direct children must have a `[slot="vault-child"]` attribute.
 */
export class VaultElement extends CustomElement {
    static get template() {
        return document.getElementById("template-vault")
    }

    /**
     * The base URL where the Vault is available at.
     */
    get base() {
        return this.getAttribute("base")
    }

    /**
     * {@link fetch} the file at the given path ignoring cooldowns.
     * @param path {string} The path where the file is located.
     * @returns {Promise<Response>} The resulting HTTP response.
     */
    async fetchImmediately(path) {
        const url = new URL(path, this.base)
        return await fetch(url, {})
    }

    /**
     * Cooldown between two {@link fetchCooldown} requests in milliseconds, as obtained from the `cooldown` parameter.
     */
    get cooldownMs() {
        return Number(this.getAttribute("cooldown"))
    }

    /**
     * Queue containing the `resolve` functions necessary to make the calls to {@link fetchCooldown} proceed beyond the waiting phase.
     * To be called by the preceding {@link fetchCooldown} if possible.
     * @type {((v: unknown) => void)[]}
     */
    #fetchQueue = []

    /**
     * @returns {Promise<void>} A Promise that will wait for this caller's turn in the {@link #fetchQueue}.
     */
    fetchQueueTurn() {
        return new Promise(resolve => {
            this.#fetchQueue.push(resolve)
        })
    }

    /**
     * A promise that will advance the fetch queue after {@link cooldownMs}.
     * @returns {Promise<void>}
     */
    async #scheduleNextFetchQueueTurn() {
        await sleep(this.cooldownMs)
        const resolve = this.#fetchQueue.shift()
        resolve()
    }

    /**
     * {@link fetch} the file at the given path, awaiting for cooldowns to expire.
     * @param path {string} The path where the file is located.
     * @returns {Promise<Response>} The resulting HTTP response.
     */
    async fetchCooldown(path) {
        // Sit waiting in queue
        if(this.#fetchQueue.length > 0) {
            await this.fetchQueueTurn()
        }
        // Perform the request
        const result = await this.fetchImmediately(path)
        // Start the next item in queue
        // noinspection ES6MissingAwait
        this.#scheduleNextFetchQueueTurn()
        // Return the request's result
        return result
    }

    onConnect() {
        super.onConnect()
    }
}