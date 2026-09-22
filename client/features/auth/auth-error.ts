export type FieldErrors = {
    name?: string
    email?: string
    password?: string
}

export class AuthError extends Error {
    fieldErrors?: FieldErrors

    constructor(
        message: string,
        fieldErrors?: FieldErrors
    ) {
        super(message)

        this.name = 'AuthError'
        this.fieldErrors = fieldErrors

        Object.setPrototypeOf(this, AuthError.prototype)
    }
}

export function getAuthError(error: unknown): AuthError {
    if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
    ) {
        const response = (
            error as {
                response?: {
                    data?: {
                        error?: string
                        message?: string
                        fieldErrors?: FieldErrors
                    }
                }
            }
        ).response

        const data = response?.data

        if (data) {
            return new AuthError(
                data.message ||
                data.error ||
                'Something went wrong. Please try again.',
                data.fieldErrors
            )
        }
    }

    return new AuthError(
        'Something went wrong. Please try again.'
    )
}