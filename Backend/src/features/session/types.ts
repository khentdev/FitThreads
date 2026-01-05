import {
    JwtAlgorithmNotImplemented,
    JwtTokenExpired,
    JwtTokenInvalid,
    JwtTokenIssuedAt,
    JwtTokenNotBefore,
    JwtTokenSignatureMismatched,
} from 'hono/utils/jwt/types';
import { User } from '../../../generated/prisma/client.js';

//Token generation context
export type TokenPayload = {
    deviceId: string
    userId: string
    iss: string
}

export type TokenPayloadNoIss = Omit<TokenPayload, "iss">

export type JwtErrorConstructor =
    | typeof JwtAlgorithmNotImplemented
    | typeof JwtTokenInvalid
    | typeof JwtTokenExpired
    | typeof JwtTokenIssuedAt
    | typeof JwtTokenNotBefore
    | typeof JwtTokenSignatureMismatched;
//


export type StoreTokenParams = { userId: string, token: string, expiresAt: Date }

export type SessionPayloadParams = {
    user: User
    deviceId: string
    oldToken: string
}
export type SessionPayloadVariables = {
    sessionPayload: SessionPayloadParams
}

export type RefreshSessionParams = {
    user: User,
    deviceId: string,
    oldToken: string
}

export type SessionCachePayload = {
    user: User,
    refreshToken: string
}
export type LogoutParamsService = Omit<LogoutParamsController, "csrfTokenName" | "sessionCookieName">
export type LogoutParamsController = {
    user: User
    oldToken: string
    csrfTokenName: string
    sessionCookieName:string
}
export type LogoutPayloadVariables = {
    logoutPayload: LogoutParamsController
}