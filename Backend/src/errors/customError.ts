import { ContentfulStatusCode } from "hono/utils/http-status";
import { AppErrorOptions, ERROR_DEFINITIONS, ErrorCodes } from "./index.js";

export class AppError extends Error {
    status: ContentfulStatusCode
    code: string
    field?: string
    data?: Record<string, unknown>

    constructor(code: ErrorCodes, options: AppErrorOptions = {}) {
        const message = options.messageOverride ?? ERROR_DEFINITIONS[code].message
        super(message, { cause: options.cause })
        this.status = ERROR_DEFINITIONS[code].status
        this.code = ERROR_DEFINITIONS[code].code
        this.field = options.field
        this.data = options.data
        this.name = "AppError"
    }
}
