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
