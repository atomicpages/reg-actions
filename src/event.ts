import * as fs from "node:fs";
import type { components } from "@octokit/openapi-types";
import { log } from "./logger";

export type Event = {
  before: string | null;
  after: string | null;
  pull_request: components["schemas"]["pull-request"] | null;
  app: components["schemas"]["nullable-integration"];
  repository: components["schemas"]["minimal-repository"];
  number?: number;
};

const readEvent = (): Event | undefined => {
  try {
    if (process.env.GITHUB_EVENT_PATH) {
      return JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
    }
  } catch (_e) {}
};

export const getEvent = (): Event => {
  const event = readEvent();

  log.debug(`event = `, event);

  if (!event) {
    throw new Error("Failed to get github event.json.");
  }

  return event;
};
