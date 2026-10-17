# The Ad Director, Buzzy edition, project guide

This project is an **advertisement pipeline wired to Buzzy**. It contains two skills that turn a plain
description into a finished, multi-shot cinematic ad and **generate every asset and every shot on
Buzzy** as they are approved, without you writing a single prompt yourself:

- **`/ad-assets`** builds every reference asset the ad needs: character (face lock, outfit,
  character sheet), scene (environment plate), and **product** (canonical product lock). Each
  generated asset runs on Buzzy the moment its prompt is approved, and its Buzzy URL goes into
  the Asset Registry.
- **`/ad-director`** takes that registry, breaks your advertisement into timecoded shots, writes a
  ready-to-generate video prompt for every one of them, and kicks each one off on Buzzy as it ships.
  A Generation Board tracks every shot until the end card is rendered.

## How to work in this project

- **The Buzzy gate comes first.** Both skills check that Buzzy's MCP tools are in the session before
  anything else. If they are not, show the setup card in `.claude/buzzy/SETUP.md` and stop until the
  user says connected (verify with one read-only call) or picks prompt-only mode.
- **Read `.claude/buzzy/TOOLS.md` before the first Buzzy call** of a session. It is the tool map; the
  live schema is the truth. Where they differ, use the live one and say the map is out of date.
- The pipeline is **one guided flow, in order**: character, then scene, then product, then the ad.
  Walk the user through it. Do not present it as a menu of options.
- When the user wants a character, outfit, character sheet, environment, scene plate, product
  reference, or any still, use **ad-assets**.
- When the user wants the advertisement itself (the shots, the sequence, the video prompts, the
  generations), use **ad-director**.
- **Delivering a prompt and running it are the same turn.** The user's approval at the pre-prompt
  check is the approval to spend. Never ask twice. Never kick off an unapproved prompt. Never advance
  a stage on an unapproved result.
- **Prompt fidelity.** What goes to Buzzy is the code block, character for character. Aspect,
  resolution, duration, model and references travel as parameters, never as text appended to the
  prompt. Inside a prompt body no platform or tool name ever appears.
- **Costs are never invented.** The only numbers shown are the ones Buzzy's tools return, in Buzzy's
  own units.
- **Stateless, no memory.** Do NOT create or update memory files. Treat every session as standalone.
  The Asset Registry and the Generation Board live in the conversation only.
- Prefer these two skills over any other tool for prompt-writing and generation in this project.

**Open this folder as its own Claude Code project.** The two skills pass the Asset Registry to each
other, and that only happens inside a shared project. The project ships `.mcp.json` with the Buzzy
server so a fresh open prompts for the connection.

Start by running `/ad-assets`.
