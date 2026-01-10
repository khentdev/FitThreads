/**
 * Seed runner for production environment
 * Only executes production seed if RUN_PROD_SEED env var is set to "true"
 * Safe to run on every deployment - will skip if already seeded or env var not set
 */

const shouldRunSeed = process.env.RUN_PROD_SEED === "true";

if (!shouldRunSeed) {
    console.log("RUN_PROD_SEED not set to 'true'. Skipping production seed.");
    process.exit(0);
}

console.log("RUN_PROD_SEED=true detected. Running production seed...");
import "./seed.prod.js";
