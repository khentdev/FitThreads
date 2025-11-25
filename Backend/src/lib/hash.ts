import { createHmac } from 'crypto';
import { env } from '../configs/env.js';
export const hashData = (data: string) => createHmac("sha256", env.HASH_SECRET).update(data).digest("hex")
export const compareHashes = (hashed: string, hash: string) => hashData(hashed) === hash