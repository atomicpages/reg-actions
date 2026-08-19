import * as core from "@actions/core";
import * as github from "@actions/github";
import { createClient } from "./client";
import type { CompareOutput } from "./compare";
import { getConfig } from "./config";
import { getEvent } from "./event";
import { log } from "./logger";
import { run } from "./service";

const setCompareOutputs = (result: CompareOutput & { id?: number }) => {
  const hasChanged =
    result.deletedItems.length > 0 ||
    result.failedItems.length > 0 ||
    result.newItems.length > 0;

  core.setOutput("passed-count", String(result.passedItems.length));
  core.setOutput("failed-count", String(result.failedItems.length));
  core.setOutput("new-count", String(result.newItems.length));
  core.setOutput("deleted-count", String(result.deletedItems.length));
  core.setOutput("has-changed", String(hasChanged));

  if (result.id !== undefined) {
    core.setOutput("artifact-id", String(result.id));
  }
};

const main = async () => {
  const config = getConfig();
  const { repo, runId, sha } = github.context;
  const date = new Date().toISOString().split("T")[0];

  log.info(`runid = ${runId}, sha = ${sha}`);
  const event = getEvent();

  log.info(`succeeded to get event, number = ${event.number}`);
  const octokit = github.getOctokit(config.githubToken);
  const client = createClient(repo, octokit);

  log.info(`start`);
  const result = await run({ event, runId, sha, client, date, config });
  setCompareOutputs(result);
};

main().catch((e) => core.setFailed(e.message));
