---
name: openmontage
description: "Produce full videos with OpenMontage (github.com/calesthio/OpenMontage), the open-source agentic video studio: script, scene plan, stock footage or generated clips, narration, music and Remotion/HyperFrames composition. Use when the user wants a complete video made end to end (explainer, cinematic, documentary montage, screen demo, talking head, clip factory, podcast repurpose, localization/dub) rather than a single animated reel. Sets the framework up in its own folder and then follows its AGENT_GUIDE.md."
---

# OpenMontage

OpenMontage is its own project (about 90 MB, AGPLv3). Keep it in a separate folder, never copy its code into this repository.

## Setup (once per machine or cloud session)

```bash
git clone https://github.com/calesthio/OpenMontage.git ~/OpenMontage   # or /home/user/calesthio/OpenMontage in a cloud session
cd ~/OpenMontage
make setup        # Python venv + requirements, Remotion (npm), Piper TTS, HyperFrames cache, creates .env
```

Read `make setup` before running it on a new machine. It installs Python and npm packages and creates `.env`.

## Using it

1. `cd` into the OpenMontage folder and **read `AGENT_GUIDE.md` before doing anything**. Its routing rules decide the first step. OpenMontage's `CLAUDE.md` requires this.
2. Pick the pipeline that matches the request (`pipeline_defs/*.yaml`): `animated-explainer`, `animation`, `cinematic`, `documentary-montage`, `screen-demo`, `talking-head`, `avatar-spokesperson`, `clip-factory`, `podcast-repurpose`, `localization-dub`, `hybrid`.
3. Provider keys go in OpenMontage's `.env` (see `.env.example` and `docs/PROVIDERS.md`). Without keys it still renders with free tools (Remotion, Piper TTS, stock footage). Never ask the user to paste a key into chat.
4. `make preflight` lists which providers are available. `make demo` renders zero-key demo videos to check the install.

## Rules for this project

- Brand material for União Flora (logo, colours `#0A2F66`, `#1D5CA3`, `#1F9E96`, `#F1F6FB`, Montserrat, product photos) comes from the company catalogue. Pass it to OpenMontage as assets.
- Narration: prefer the ElevenLabs connector (Brazilian voice) when available; Piper is the offline fallback.
- Supplement content: no health or curative claims beyond those approved on the label, always include "Suplementos alimentares não são medicamentos e não substituem uma alimentação equilibrada.", and check claims with the ANVISA regulatory skill.
- The finished video is published only when the user says so.
