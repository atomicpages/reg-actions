<p align="center"><img src ="https://github.com/atomicpages/reg-actions/blob/main/logo.png?raw=true" /></p>

<p align="center">
    A visual regression test tool for github actions :octocat:.
</p>

---

> [!WARNING] v1, v2, and v3 are deprecated. Please use v4.

[![GitHub Actions Status](https://github.com/atomicpages/reg-actions/actions/workflows/test.yml/badge.svg)](https://github.com/atomicpages/reg-actions/actions/workflows/test.yml)

## Table of Contents

- [What is reg-actions](#what-is-reg-actions)
- [How to use](#how-to-use)
  - [Minimal setup](#minimal-setup)
  - [Action inputs](#action-inputs)
  - [Action outputs](#action-outputs)
- [Limitation](#limitation)
- [Troubleshooting](#troubleshooting)
- [Releases](#releases)
- [Contribute](#contribute)
- [License](#license)

## What is `reg-actions`

This repository provides a `GitHub Action` for visual regression testing. (See
also related projects [reg-suit](https://github.com/reg-viz/reg-suit) and
[reg-cli](https://github.com/reg-viz/reg-cli)).

This action uploads images and report as workflow artifact. The report is
commented to PR and workflow summary by downloading and comparing the artifacts
from the branch where the pull request will be merged.

So, this action does _not_ take screenshot, please generate images by your self.
If you use `storybook`, we recommend using
[storycap](https://github.com/reg-viz/storycap)

### PR Comment

![comment](./screenshot/comment.png)

You can also see an
[`example`](https://github.com/bokuweb/reg-actions-example/pull/2#issuecomment-1774125992)

### Workflow Summary

![summary](./screenshot/summary.png)

You can also see an
[`example`](https://github.com/bokuweb/reg-actions-example/actions/runs/6604684694#summary-17939150492).

## How to use

### Minimal setup

Let's start with a minimal workflow setup. Run it for pull requests and pushes to
`main` so pull requests can compare against the main branch baseline.
`github-token` defaults to `${{ github.token }}`; pass a PAT only when the
default token is not enough.

The workflow needs `contents: write` (image branch), `pull-requests: write` (PR
comments), and `actions: read` (list/download artifacts).

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

permissions:
  contents: write
  pull-requests: write
  actions: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: atomicpages/reg-actions@v4
        with:
          image-directory-path: "./images"
```

`v4` moves to the latest compatible v4 release. Pin an immutable version such
as `v4.0.0`, or a full commit SHA, when reproducibility is more important than
automatically receiving compatible updates.

### Action inputs

Input definitions are written in
[action.yml](https://github.com/atomicpages/reg-actions/blob/main/action.yml).

#### `github-token` (Optional)

- Type: String
- Default: `${{ github.token }}`

GitHub API access token. It is used to upload test report and add comment to
pull request. Override with a PAT when the default `GITHUB_TOKEN` cannot push to
the image branch or comment on the pull request.

#### `image-directory-path` (Required)

- Type: String
- Default: N/A

Path to images directory. The images stored in this directory will be compared
with the expected images from the last upload.

#### `enable-antialias` (Optional)

- Type: Boolean
- Default: `false`

Enable antialias. If omitted false.

#### `matching-threshold` (Optional)

- Type: Number
- Default: `0`

Matching threshold, ranges from 0 to 1. Smaller values make the comparison more
sensitive. Specifically, you can set how much of a difference in the YIQ
difference metric should be considered a different pixel. If there is a
difference between pixels, it will be treated as "same pixel" if it is within
this threshold.

#### `threshold-rate` (Optional)

- Type: Number
- Default: `0`

The rate threshold at which the image is considered changed. When the difference
ratio of the image is larger than the set rate detects the change. Applied after
`matchingThreshold`.

#### `threshold-pixel` (Optional)

- Type: Number
- Default: N/A (not applied when omitted)

The pixel threshold at which the image is considered changed. When the
difference pixel of the image is larger than the set pixel detects the change.
This value takes precedence over `thresholdRate`. Applied after
`matchingThreshold`. If omitted, pixel threshold is not applied.

#### `target-hash` (Optional)

- Type: String
- Default: N/A

The commit hash to be compared. For example you can determine the target hash
dynamically using a [github script](https://github.com/actions/github-script).
Please see
[test_with_target_hash.yml](./.github/workflows/test_with_target_hash.yml).

#### `custom-report-page` (Optional)

- Type: String
- Default: N/A

The custom report page link.

#### `report-file-path` (Optional)

- Type: String
- Default: `"./report.html"`

Path of the generated report html file. This file can be deployed in other
Actions steps, but is not included in the artifact. If omitted, treated as
`./report.html`.

#### `artifact-name` (Optional)

- Type: String
- Default: `"reg"`

The name of the artifact to be Uploaded. Default is "reg".

#### `branch` (Optional)

- Type: String
- Default: `"reg_actions"`

The branch name for uploading images. This action will upload the image to the
specified branch and use its URL in the comments. Default is "reg_actions".

#### `disable-branch` (Optional)

- Type: Boolean
- Default: `false`

The option to disable push to a branch. When set to true, the `branch` option is
ignored, and images will not be displayed in the comments.

#### `comment-report-format` (Optional)

- Type: String
- Default: `"raw"`

The option how to render changed file in comment. This action will change PR and
workflow summary report format. Available options are `raw` and `summarized`.
`raw` will render report comment with expanded results. `summarized` will render
report comment using `<details>` tag to summarize by changed files.

#### `outdated-comment-action` (Optional)

- Type: String
- Default: `"none"`

The option to handle outdated comments in the PR. Available options are `none`,
`minimize`, and `update`.

- `none`: Do nothing with previous comments.
- `minimize`: Minimize (collapse) outdated action comments.
- `update`: Edit the existing comment in place (sticky comment). When combined
  with `comment-mode: changes`, the existing comment will still be updated to
  show "resolved" when visual differences are fixed.

#### `comment-mode` (Optional)

- Type: String
- Default: `"always"`

When to post PR comments. Available options are `always`, `changes`, and
`never`.

- `always`: Always post a comment with the comparison results.
- `changes`: Only post a comment when visual differences are detected. When
  combined with `outdated-comment-action: update`, existing comments will still
  be updated to show "resolved" when differences are fixed.
- `never`: Never post PR comments (silent mode). Results are still available in
  the workflow summary and artifacts.

#### `retention-days` (Optional)

- Type: Number
- Default: `30`

Duration in days for which images are stored in the branch.

### Action outputs

#### `passed-count`

Number of images that matched the expected baseline.

#### `failed-count`

Number of images that differed from the expected baseline.

#### `new-count`

Number of images with no expected baseline.

#### `deleted-count`

Number of expected images missing from the actual set.

#### `has-changed`

`true` if any images failed, were added, or were deleted; otherwise `false`.

#### `artifact-id`

ID of the uploaded workflow artifact, if upload succeeded.

```yaml
- uses: atomicpages/reg-actions@v4
  id: reg
  with:
    image-directory-path: "./images"
- run: echo "changed=${{ steps.reg.outputs.has-changed }}"
```

## Limitation

- If the `artifact` is deleted, the report will also be deleted, see
  [`Artifact and log retention policy`](https://docs.github.com/en/actions/learn-github-actions/usage-limits-billing-and-administration#artifact-and-log-retention-policy)
  for the retention period of the `artifact`.

## Troubleshooting

- `Error: HttpError: Resource not accessible by integration`.

Please go to the `Settings > Actions > General > Workflow permissions` of the
relevant repository and change the permission from
`Read repository contents permission` to `Read and write permissions`.

## Releases

Pull request titles must follow
[Conventional Commits](https://www.conventionalcommits.org/) and should be
squash-merged using the pull request title. Release Please converts `fix:`,
`feat:`, and breaking `type!:` changes into patch, minor, and major versions.
It creates GitHub releases and immutable `v4.x.y` tags, then moves the `v4` tag
to the latest v4 release. This project is not published to npm.

Set a `RELEASE_PLEASE_TOKEN` repository secret to a fine-grained token with
contents and pull request write access when release pull requests must trigger
CI. Without it, releases use `GITHUB_TOKEN`; GitHub does not start new workflow
runs for pull requests created by that token.

## Contribute

Thanks for your help improving the project! We are so happy to have you!

## License

The MIT License (MIT)

Copyright (c) 2023 bokuweb

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

![reg-viz](https://raw.githubusercontent.com/reg-viz/artwork/master/repository/footer.png)
