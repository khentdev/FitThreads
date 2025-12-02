import { startSessionCleanupWorker } from "./cleanup-sessions.js";
const sessionWorker = startSessionCleanupWorker();
export const startJobs = () => {
    sessionWorker.start();
};
export const stopJobs = () => {
    sessionWorker.stop();
};