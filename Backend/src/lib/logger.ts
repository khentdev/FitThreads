import pino from "pino";
import { env } from "../configs/env.js";
import { randomUUID } from "crypto";

const prod = env.NODE_ENV === "production";
const logger = pino({
    level: prod ? "info" : "debug",
    transport:
        !prod
            ? {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "HH:MM:ss Z",
                    ignore: "pid,hostname",
                },
            }
            : undefined,
    formatters: {
        level: (label: string) => {
            return { level: label.toUpperCase() };
        },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
        env: env.NODE_ENV,
        id: randomUUID().slice(0, 8)
    },
});

export default logger;
