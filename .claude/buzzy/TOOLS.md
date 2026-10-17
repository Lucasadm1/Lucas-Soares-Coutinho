# Buzzy tool map

Buzzy's MCP endpoint is `https://mcp.buzzy.now/mcp`, OAuth-protected (sign in with a Buzzy account). In Claude Code its tools are served under a connector id, so their names look like `mcp__<id>__GenerateImage`; search for them with ToolSearch "GenerateImage" or "buzzy" when they are deferred. This map was verified against the live server on 2026-10-06.

**Rule for both skills.** Before the first Buzzy call of a session, confirm the live tool names match this map. Where a name or a parameter differs, use the live one and say in one line that the map is out of date. Never guess a parameter the live schema does not have. Never invent a cost: Buzzy exposes no balance tool, so the only cost signal is a task failing for credits.

## Capability map

| Capability | Buzzy tool | What the skill passes | Notes |
|---|---|---|---|
| Models | `list_model` | nothing | Returns every model with `resolutions`, `aspect_ratios`, `max_images`, `max_text_length`, `min_duration` / `max_duration`. Copy values verbatim, never invent one |
| Upload | `UploadFile` → `curl PUT` → `ConfirmFileUpload` | `filename`, `content_length` in bytes, `content_type` | Three steps for a local file. `UploadFile` returns a presigned `upload_url` and the final CDN `url`. PUT the bytes with `curl -X PUT -H 'If-None-Match: *' -H 'Content-Type: <mime>' --upload-file <path> '<upload_url>'` (never `--data-binary`). On HTTP 200 call `ConfirmFileUpload` with the CDN `url`. Only then is the URL usable as a reference. For a file that already has a public https URL, `UploadResource` with `url` imports it instead |
| Generate image | `GenerateImage` | `prompt`, `model`, `aspect_ratio`, `resolution`, `image_urls` (references, in order), `project_id` | Returns `task_id` and `project_id` immediately. Reuse the `project_id` on every later call of the session so the whole kit and spot sit in one Buzzy project |
| Generate video | `GenerateVideo` | `prompt`, `model`, `aspect_ratio`, `resolution`, `duration` (seconds), `image_urls` (references, in order), `project_id` | Same task pattern. `first_last_frame: true` with exactly two images for a start-to-end-frame clip, only on models that flag it |
| Status + result | `get_task` | `task_id` | Poll until `TASK_STATE_SUCCEEDED` or a failure state (`failed_reasons`). Returns `node_id` and `resources` with the result URL. Video takes minutes: keep delivering the next shot, poll at the start of every following turn. Never resubmit a running task, that bills twice |
| Project | `createProject` | `name` | Optional. `GenerateImage` / `GenerateVideo` create a project on first call anyway; use `createProject` only to name it after the ad up front |
| Balance | none | | Buzzy has no balance tool. Say so if asked; report only what a failed task's `failed_reasons` says |

Buzzy also ships its own workflow skills (`load_workflow`, `VideoGenerationWorkflow`, `DirectorStoryboardWorkflow` and friends). The Ad Director does not use them: its prompts are the production documents, and they go to `GenerateImage` / `GenerateVideo` directly.

## References are URLs

Buzzy has no asset ids. A reference is a public https URL on Buzzy's CDN (`https://res-prod.buzzy.now/...`), either from an upload or from a finished task's `resources`. The Asset Registry and the Generation Board store these URLs. The order of `image_urls` is the `@imageN` order.

## Limits that shape the prompts (read off `list_model`, 2026-10-06)

| Model | Role | Refs | Prompt chars | Resolutions | Aspects | Duration |
|---|---|---|---|---|---|---|
| `Nano Banana Pro` | face lock, outfit base, product typography | 14 | 2000 | 1K, 2K, 4K | 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9 | |
| `gpt-image-2` | highest-detail: character sheet, scene plate | 16 | 2000 | 1k, 2k, 4k | 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3, 21:9, 9:21 | |
| `doubao-seedream-5-0-260128` | alternate high-detail image | 14 | 2000 | 2K, 3K, 4K | 1:1, 4:3, 3:4, 16:9, 9:16, 3:2, 2:3, 21:9 | |
| `Seedance 2.5` | every shot, the end card | 30 | 10000 | 480p, 720p, 1080p | 21:9, 16:9, 4:3, 1:1, 3:4, 9:16 | 4 to 30 s |
| `dreamina-seedance-2-0-260128` | Seedance 2.0, up to 4k | 9 | 10000 | 480p, 720p, 1080p, 4k | same | 4 to 15 s |
| `Kling 3.0` | alternate video | 4 | 2000 | 720p, 1080p, 4k | 16:9, 1:1, 9:16 | 4 to 15 s |

Resolution strings are case-sensitive per model (`1K` for Nano Banana, `1k` for gpt-image-2). Copy them from `list_model`.

**Three consequences the skills must respect:**

1. **Image prompts: 2000-character cap on every image model.** VERIFY whether Buzzy enforces or truncates it (see test log below). The character plates with the full LOCKED FLAT CLOSE run well past 2000 characters, so if it is enforced the plates need the compact flat close in `ad-assets`.
2. **Video prompts: the `GenerateVideo` prompt parameter accepts 8192 characters** and Seedance 2.x accepts 10000. A 1,400-word shot prompt is roughly 8,500 to 9,500 characters, so the top of the skill's length band does not fit. Keep shot prompts at or under about 1,250 words, or about 8,000 characters, and check the count before the kick-off.
3. **Minimum clip length is 4 seconds** on Seedance 2.x and Kling. A 2.0s or 2.5s shot is generated at 4s and trimmed in the edit; the HEADER inside the prompt keeps the true runtime. Say so once per spot. Durations are any whole number of seconds between the model's min and max (`durations` is empty, `min_duration` / `max_duration` rule).

## Test log

| Date | Test | Result |
|---|---|---|
| 2026-10-06 | `list_model` from a signed-in session | OK, catalogue above |
| 2026-10-06 | `UploadFile` → curl PUT → `ConfirmFileUpload` on a 132-byte PNG | OK, HTTP 200, CDN URL confirmed |
| 2026-10-06 | `GenerateImage`, Nano Banana Pro, 3:4, 1K, a 4,900-character face-lock prompt | submitted and running, see the result row below |
| 2026-10-06 | result of that task | accepted without any length error (the 2,000-character limit is not enforced at submission), `task_id` and `project_id` returned, `node_id` assigned, state `TASK_STATE_RUNNING` for over 15 minutes with no `failed_reasons`. A 1K image normally renders in under a minute, so the task is most likely queued or held on the account side (credits). Still to confirm: whether the long prompt was used in full or truncated |
