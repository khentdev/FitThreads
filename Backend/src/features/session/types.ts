import {
    JwtAlgorithmNotImplemented,
    JwtTokenExpired,
    JwtTokenInvalid,
    JwtTokenIssuedAt,
    JwtTokenNotBefore,
    JwtTokenSignatureMismatched,
} from 'hono/utils/jwt/types';

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
    user: { id: string, email: string, username: string }
    deviceId: string,
    oldToken: string
}
export type SessionPayloadVariables = {
    sessionPayload: SessionPayloadParams
}

export type RefreshSessionParams = {
    user: { id: string, email: string, username: string },
    deviceId: string,
    oldToken: string
}

export type SessionCachePayload = {
    user: { id: string, email: string, username: string },
    refreshToken: string
}