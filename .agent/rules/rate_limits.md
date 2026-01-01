---
trigger: always_on
---

# Rate Limiting Rules – FitThreads
These limits are **hard constraints**. All endpoints MUST enforce these exact limits using Redis-backed rate limiting with independent keys as specified.
## Authentication
### Login
- 20 req / 15 min / IP (independent key: `ratelimit:login:ip:{ip}`)
- 10 req / hr / email (independent key: `ratelimit:login:email:{email}`)

### Signup
- 5 req / hr / IP (independent key: `ratelimit:signup:ip:{ip}`)

### Magic Link Request
- 5 req / hr / email (independent key: `ratelimit:magic-link:email:{email}`)
- 15 req / hr / IP (independent key: `ratelimit:magic-link:ip:{ip}`)

### Verify OTP
- Max 5 attempts per OTP token (state tracking in token data: `otp:{token}`)
- OTP expires in 10 min (TTL on token)
- 10 req / 10 min / IP (independent key: `ratelimit:verify-otp:ip:{ip}`)
- 10 req / 10 min / email (independent key: `ratelimit:verify-otp:email:{email}`)

### Resend OTP
- 3 resends / hr / email (independent key: `ratelimit:resend-otp:email:{email}`)
- 10 resends / hr / IP (independent key: `ratelimit:resend-otp:ip:{ip}`)

## Feed
### Create Post
- 6 posts / 2 hr / user (independent key: `ratelimit:create-post:user:{userId}`)
- 12 posts / 10 min / IP (independent key: `ratelimit:create-post:ip:{ip}`)

### Like / Favorite
- 60 actions / min / user (combined for both, key: `ratelimit:like-fav:user:{userId}`)

### Search
- 30 req / min / IP (independent key: `ratelimit:search:ip:{ip}`)
- 100 req / min / user (authenticated only, key: `ratelimit:search:user:{userId}`)
- 120 req / min / IP (authenticated, key: `ratelimit:search:ip:{ip}`)

### Read Endpoints (Feed, Profile, Single Post)
- 120 req / min / IP (independent key: `ratelimit:read:ip:{ip}`)

## Implementation Notes
### Key Strategy
- Use **independent layered keys** (not composite) for defense in depth
- Each limit operates separately and must be checked independently
- If ANY limit is exceeded, reject the request

### Redis Key Format
- All keys must follow the format shown above for consistency
- Use TTL matching the time window (e.g., 15 min limit = 900s TTL)

### Error Responses
- Return `429 Too Many Requests` when rate limit exceeded
- Include `Retry-After` header with seconds until limit resets
- Provide clear error message indicating which limit was hit