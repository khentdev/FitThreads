import { ContentfulStatusCode } from 'hono/utils/http-status';
import { AUTH_ERROR_DEF, AUTH_ERROR_CODES } from '../features/auth/errors.js';
import { SESSION_ERROR_DEF, SESSION_ERROR_CODES } from '../features/session/errors.js';

export type ErrorDefinitions = {
    code: string;
    status: ContentfulStatusCode;
    message: string;
};
export type AppErrorOptions = {
    cause?: unknown;
    field?: string;
    data?: Record<string, unknown>;
    messageOverride?: string
};

export const ERROR_CODES = {
    ...AUTH_ERROR_CODES,
    ...SESSION_ERROR_CODES,
    DATABASE_ERROR: "DATABASE_ERROR"
} as const

export const ERROR_DEFINITIONS: Record<ErrorCodes, ErrorDefinitions> = {
    ...AUTH_ERROR_DEF,
    ...SESSION_ERROR_DEF,
    DATABASE_ERROR: { code: "DATABASE_ERROR", status: 500, message: "Database Error" }
} as const

export type ErrorCodes = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
