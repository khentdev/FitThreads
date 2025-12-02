import { env, tokenExpiry } from "../../configs/env.js";
import { sign, verify } from "hono/jwt"
import {
    JwtAlgorithmNotImplemented, JwtTokenExpired, JwtTokenInvalid, JwtTokenIssuedAt,
    JwtTokenNotBefore, JwtTokenSignatureMismatched
} from 'hono/utils/jwt/types';
import { randomUUID } from 'node:crypto';
import { AppError } from "../../errors/customError.js";
import { ERROR_CODES } from "../../errors/index.js";
import { SESSION_ERROR_CODES, SessionErrorCode } from "./errors.js";
import { JwtErrorConstructor, TokenPayload, TokenPayloadNoIss } from "./types.js";
import { hashData } from "../../lib/hash.js";


const generateAccessToken = (payload: TokenPayloadNoIss) => {
    const { accessTokenExpiry } = tokenExpiry()
    const now = Math.floor(Date.now() / 1000)
    return sign({
        deviceId: hashData(payload.deviceId),
        userId: payload.userId,
        iat: now,
        exp: accessTokenExpiry,
        iss: env.JWT_ISSUER,
        nonce: randomUUID().slice(0, 8)
    }, env.JWT_SECRET, "HS512")
}

const generateRefreshToken = (payload: TokenPayloadNoIss) => {
    const { refreshTokenExpiry } = tokenExpiry()
    const now = Math.floor(Date.now() / 1000)
    return sign({
        deviceId: hashData(payload.deviceId),
        userId: payload.userId,
        iat: now,
        exp: refreshTokenExpiry,
        iss: env.JWT_ISSUER,
        nonce: randomUUID().slice(0, 8)
    }, env.JWT_SECRET, "HS512")
}

export const generateTokens = async (payload: TokenPayloadNoIss) => {
    const { refreshTokenExpiry } = tokenExpiry()
    const accessToken = await generateAccessToken(payload)
    const refreshToken = await generateRefreshToken(payload)
    const csrfToken = randomUUID()
    return { accessToken, refreshToken, csrfToken, refreshTokenExpiry }
}

export const verifyTokenOrThrow = async (token: string) => {
    try {
        const payload = await verify(token, env.JWT_SECRET, 'HS512') as TokenPayload;
        if (payload.iss !== env.JWT_ISSUER) throw new AppError(ERROR_CODES.TOKEN_INVALID);
        return payload
    } catch (err) {
        if (err instanceof Error) throw mapTokenError(err);
        throw new AppError(ERROR_CODES.TOKEN_INVALID);
    }
};

const errMap = new Map<JwtErrorConstructor, SessionErrorCode>([
    [JwtAlgorithmNotImplemented, SESSION_ERROR_CODES.TOKEN_INVALID],
    [JwtTokenInvalid, SESSION_ERROR_CODES.TOKEN_INVALID],
    [JwtTokenSignatureMismatched, SESSION_ERROR_CODES.TOKEN_INVALID],
    [JwtTokenNotBefore, SESSION_ERROR_CODES.TOKEN_INVALID],
    [JwtTokenIssuedAt, SESSION_ERROR_CODES.TOKEN_INVALID],
    [JwtTokenExpired, SESSION_ERROR_CODES.TOKEN_EXPIRED],
]);

const mapTokenError = (err: Error) => {
    const code = errMap.get(err.constructor as JwtErrorConstructor);
    if (code) return new AppError(code);
    return new AppError(ERROR_CODES.TOKEN_INVALID);
};