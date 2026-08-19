import logger from "loglevel";

if (process.env.NODE_ENV === "debug") {
  logger.setLevel("debug");
} else {
  logger.setLevel("info");
}

export const log = logger;
