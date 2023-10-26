/**
 * Sleep.
 * @returns {Promise<void>}
 */
export async function sleep(timeMs) {
    return await new Promise(resolve => setTimeout(resolve, timeMs))
}
