---
name: personaplex-voice
description: "Voice and persona prompts for NVIDIA PersonaPlex (github.com/NVIDIA/personaplex), a full-duplex speech-to-speech model. Use when the user wants a character in an ad to speak or hold a spoken conversation, wants a persona/role prompt written for PersonaPlex, needs to pick one of its preset voices, or needs the commands to install, serve or run it offline on an input wav. Writes the text prompt and the exact commands; the user runs them on their own GPU machine."
---

# PersonaPlex voice director

PersonaPlex is a speech-to-speech model: it **listens to an input wav and answers in a chosen voice and persona**. It does not read a script aloud. Output is an audio reply (and a JSON transcript) of the same duration as the input.

**Be upfront about the limits.** It needs a GPU machine, a Hugging Face account that accepted the model license, and `HF_TOKEN`. This session cannot run it. This skill writes the prompt and the commands; the user runs them. It is separate from `/ad-director`, whose shots keep voice and music for the edit.

## Flow

1. Ask what the character is and what the other side says. For an ad: who speaks, to whom, and the one fact the line must carry.
2. Pick the voice (below) and write the text prompt.
3. Show the prompt in one code block, then the command.
4. Remind the user the input wav is what the persona replies to: record or generate the other side's lines first.

## Voices (fixed set)

| Group | Voices |
|---|---|
| Natural, female | NATF0, NATF1, NATF2, NATF3 |
| Natural, male | NATM0, NATM1, NATM2, NATM3 |
| Variety, female | VARF0 to VARF4 |
| Variety, male | VARM0 to VARM3, VARM4 |

NAT voices sound more natural and conversational; VAR voices are more varied. Default to NAT. Voice files are passed as `NATF2.pt`.

## Writing the text prompt

Style that the model was trained on (plain sentences, one paragraph):

- **Open conversation:** `You enjoy having a good conversation.` then a topic sentence, then optional name, job and background.
- **Service / brand role:** `You work for <Company> which is a <kind of business> and your name is <Name>. Information: <the facts the persona may state>.`
- **Teacher/assistant:** `You are a wise and friendly teacher. Answer questions or provide advice in a clear and engaging way.`

Rules:
- Put every fact the character may say in `Information:` (prices, hours, offers). The model will not know them otherwise. Never invent claims, prices or ingredients.
- Keep it to a few sentences. Describe the persona, not the audio.
- Out-of-distribution roles often still work, but test and expect surprises.

## Commands (the user runs these)

Install once (Ubuntu/Debian):
```bash
sudo apt install libopus-dev
git clone https://github.com/NVIDIA/personaplex && cd personaplex
pip install moshi/.
export HF_TOKEN=<token>   # after accepting the license at huggingface.co/nvidia/personaplex-7b-v1
```
Blackwell GPUs: `pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu130`.

Offline reply to a recorded input (adds `--cpu-offload` if GPU memory is short, needs `pip install accelerate`):
```bash
python -m moshi.offline \
  --voice-prompt "NATM1.pt" \
  --text-prompt "<the prompt>" \
  --input-wav "input.wav" \
  --seed 42424242 \
  --output-wav "output.wav" \
  --output-text "output.json"
```
Live web UI at `localhost:8998`:
```bash
SSL_DIR=$(mktemp -d); python -m moshi.server --ssl "$SSL_DIR"
```

Keep the same `--seed` and voice for a consistent character across takes.

## Licence

Code is MIT. The model weights use the NVIDIA Open Model License; mention this if the output goes into a commercial ad.
