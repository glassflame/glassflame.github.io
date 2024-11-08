import { CustomElement } from "./base.mjs";
import { sleep } from "../utils/sleep.mjs";
import {default as katex} from 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.mjs';


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
            if(this.#somethingInFetchQueue !== null) {
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
            if(this.#fetchQueue.length === 0) {
                const somethingInFetchQueue = new Promise(resolve => {
                    this.#somethingInFetchQueue = resolve
                })
                await somethingInFetchQueue
            }
            const promise = this.#fetchQueue.shift()
            promise()
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

    /**
     * The CSS selector of the element in the template containing the vault.
     * @type {string}
     */
    static VAULT_SELECTOR = ".vault"

    /**
     * The element in the instance representing the vault.
     * Can be set via {@link recalculateVaultElement}.
     * @type {HTMLElement}
     */
    vaultElement

    /**
     * Update the value of the {@link vaultElement} by querying the current {@link instance} with {@link VAULT_SELECTOR}.
     */
    recalculateVaultElement() {
        this.vaultElement = this.instance.querySelector(this.constructor.VAULT_SELECTOR)
    }

    /**
     * The accent color of this vault.
     * Can be set manually, or updated via {@link refetchAppearance}.
     * @type {string}
     */
    get accentColor() {
        return this.vaultElement.style.getPropertyValue("--color-accent")
    }
    set accentColor(value) {
        this.vaultElement.style.setProperty("--color-accent", value)
    }

    /**
     * Update {@link accentColor} using {@link fetchCooldown} on `.obsidian/appearance.json`.
     * @return {Promise<void>}
     */
    async refetchAppearance() {
        const response = await this.fetchCooldown(".obsidian/appearance.json")
        if(response.status >= 400) {
            return
        }
        const appearance = await response.json()
        const accentColor = appearance.accentColor
        if(accentColor.match(/^#[0-9A-F]{3}$|^#[0-9A-F]{6}$/i)) {
            this.accentColor = accentColor
        }
    }

    /**
     * Index containing information about the files available in the Vault.
     * Used to resolve Wikilinks.
     * @type {{basenames: {[basename: string]: string}, paths: []} | null}
     */
    fileIndex

    /**
     * Update {@link fileIndex} by fetching the `file-index.json` file located at the root of the Vault.
     * See <https://github.com/Steffo99/obsidian-file-index> for more details.
     * @returns {Promise<void>}
     */
    async refetchFileIndex() {
        const response = await this.fetchCooldown("file-index.json")
        if(response.status >= 400) {
            this.fileIndex = null
            return
        }
        this.fileIndex = await response.json()
        this.#fileIndexQueue.forEach(resolve => resolve(undefined))
    }

    /**
     * Array of resolve {@link Promise} objects of tasks awaiting {@link sleepUntilFileIndexIsAvailable}.
     * @type {((v: undefined) => void)[]}
     */
    #fileIndexQueue = []

    /**
     * Await until {@link fileIndex} becomes available.
     * @returns {Promise<void>}
     */
    async sleepUntilFileIndexIsAvailable() {
        if(this.fileIndex) {
            return
        }
        await new Promise(resolve => this.#fileIndexQueue.push(resolve))
    }

    /**
     * Macros to be used in every single {@link MathElement} of the vault.
     */
    katexMacros

    /**
     * Update {@link katexMacros} by fetching the `preamble.sty` file located at the root of the Vault, and then having KaTeX render it to a string, which is then discarded.
     * @returns {Promise<void>}
     */
    async refetchKatexMacros() {
        const response = await this.fetchCooldown("preamble.sty")
        if(response.status >= 400) {
            this.katexMacros = {}
            this.#katexMacrosQueue.forEach(resolve => resolve(undefined))
            return
        }
        const preamble = await response.text()
        this.katexMacros = {}
        katex.renderToString(preamble, {
            throwOnError: false,
            globalGroup: true,
            macros: this.katexMacros,
            trust: true,
        })
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

    async onConnect() {
        super.onConnect()
        this.recalculateVaultElement()
        this.#fetchQueueScheduler().then()
        await this.refetchAppearance()
        await this.refetchFileIndex()
        await this.refetchKatexMacros()
    }
}