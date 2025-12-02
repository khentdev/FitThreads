export const cacheScript = (): string =>
    `
redis.call('SETEX', KEYS[1], ARGV[1], ARGV[3])
redis.call('SETEX', KEYS[2], ARGV[2], ARGV[3])
`

export const releaseLockScript = (): string =>
    `
local lockKey = KEYS[1]
local lockValue = ARGV[1]

if redis.call('GET', lockKey) == lockValue then
   return redis.call('DEL', lockKey)
else    
    return 0
end
`

