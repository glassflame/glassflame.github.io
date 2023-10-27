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
    set base(value) {
        this.setAttribute("base", value)
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
        return Number(this.getAttribute("cooldown") ?? 5000)
    }
    set cooldownMs(value) {
        this.setAttribute("cooldown", value.toString())
    }

    /**
     * FIFO queue of {@link fetch} promises to be awaited, with a {@link cooldownMs} pause between each of them.
     * @type {((v: undefined) => void)[]}
     */
    #fetchQueue = []

    /**
     * Promise that can be called to resume {@link #fetchQueueScheduler} if {@link #fetchQueue} is no longer empty.
     * @type {((v: undefined) => void)|null}
     */
    #somethingInFetchQueue

    /**
     * @returns {Promise<void>} A Promise that will wait for this caller's turn in the {@link #fetchQueue}.
     */
    async fetchQueueTurn() {
        return new Promise(resolve => {
            this.#fetchQueue.push(resolve)
            console.debug("[Fetch queue] Waiting for my turn...")
            if(this.#somethingInFetchQueue !== null) {
                console.debug("[Fetch queue] Asking scheduler to resume...")
                this.#somethingInFetchQueue(undefined)
                this.#somethingInFetchQueue = null
            }
        })
    }

    /**
     * Resolves promises in the {@link #fetchQueue} with a cooldown.
     * @returns {Promise<void>}
     */
    async #fetchQueueScheduler() {
        while(this.isConnected) {
            console.debug("[Fetch scheduler] Scheduler running one iteration...")
            if(this.#fetchQueue.length === 0) {
                const somethingInFetchQueue = new Promise(resolve => {
                    this.#somethingInFetchQueue = resolve
                    console.debug("[Fetch scheduler] Nothing to do, waiting...")
                })
                await somethingInFetchQueue
            }
            const promise = this.#fetchQueue.shift()
            console.debug("[Fetch scheduler] Advancing...")
            promise()
            console.debug("[Fetch scheduler] Cooling down for:", this.cooldownMs)
            await sleep(this.cooldownMs)
        }
    }

    /**
     * {@link fetch} the file at the given path, awaiting for cooldowns to expire.
     * @param path {string} The path where the file is located.
     * @returns {Promise<Response>} The resulting HTTP response.
     */
    async fetchCooldown(path) {
        // Await for this request's turn in the fetchQueue
        await this.fetchQueueTurn()
        // Perform the request
        const result = await this.fetchImmediately(path)
        // Start the next item in queue
        // Return the request's result
        return result
    }

    onConnect() {
        super.onConnect()

        // noinspection JSIgnoredPromiseFromCall
        this.#fetchQueueScheduler()
    }
}