---
trigger: always_on
---


- Comments in English only
- Prefer functional programming over OOP
- Use separate OOP classes only for connectors and interfaces to external systems
- Write all other logic with pure functions (clear input/output, no hidden state changes)
- Functions must ONLY modify their return values – never modify input parameters, global state, or any data not explicitly returned
- Make minimal, focused changes
- Follow DRY, KISS, and YAGNI principles
- Use strict typing (function returns, variables) in all languages
- Use named parameters in function calls when possible
- No duplicate code; check if some logic is already written before writing it
- Avoid unnecessary wrapper functions without clear purpose
- Prefer strongly-typed collections over generic ones when dealing with complex data structures
- Consider creating proper type definitions for non-trivial data structures
- Native types are fine for simple data structures, but use proper models for complex ones
- Try to avoid using untyped variables and generic types where possible
- Never use default parameter values in function definitions – make all parameters explicit

## Error Handling
- Always raise errors explicitly, never silently ignore them
- If an error occurs in any logical part of code, raise it immediately and do not continue execution
- Use specific error types that clearly indicate what went wrong
- Avoid catch-all exception handlers that hide the root cause
- Error messages should be clear and actionable
- Log errors with appropriate context before raising them


- Every public function/component/route must have a single, obvious responsibility
- Never commit code with console.log / debug statements
- Always validate and sanitize external input (API, forms, query params, env vars)
- Prefer immutable data structures and patterns (especially in frontend state)
- Write code that fails fast and loudly in development, gracefully in production
- If a function is longer than 25–30 lines, it probably needs to be split
- Refactor first when you see complexity or duplication – don’t just pile on top
- TypeScript: never use `as unknown as Type`, `!` non-null assertion, or `@ts-ignore` without a damn good reason and a comment
- Always handle loading, success, and error states explicitly in UI/data-fetching code
- Ship only production-ready code: formatted, linted, type-checked, tested (or at minimum test-covered in reasoning)
- When in doubt, clarify requirements instead of guessing
- Less code > more code. Delete ruthlessly.

These rules apply globally to every file, every suggestion, every refactor.