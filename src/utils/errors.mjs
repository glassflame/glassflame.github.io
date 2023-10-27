/**
 * Various common errors that can be thrown.
 */

/**
 * The called method is abstract, but has not been overridden by the child class.
 */
export class NotImplementedError extends Error {}

/**
 * Error in a {@link fetch} request.
 */
export class FetchError extends Error {
    /**
     * The {@link Response} object of the failed request.
     */
    response

    constructor(response, message) {
        super(message)
        this.response = response
    }
}

/**
 * A file is maliciously malformed.
 */
export class MalformedError extends Error {}