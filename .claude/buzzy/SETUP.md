# Buzzy setup card

Both skills show this when Buzzy's tools are not in the session. Show it verbatim, adapting only the bracketed bits. Nothing in the pipeline runs until the gate passes or the user picks prompt-only.

> **Buzzy isn't connected yet.** This project generates every asset and every shot directly on Buzzy, so it needs Buzzy's MCP in this session. Two minutes, once:
>
> **Claude Code (terminal, or the desktop app's Code tab)**
> 1. This project ships a `.mcp.json` with the Buzzy server. When Claude Code asked to allow the project's MCP server on opening, say yes. If you skipped that, run:
>    ```bash
>    claude mcp add --transport http buzzy https://mcp.buzzy.now/mcp
>    ```
> 2. Type `/mcp`, pick **buzzy**, choose **Authenticate**, and sign in with your Buzzy account in the browser tab that opens.
>
> **Claude app / claude.ai (connectors)**
> 1. Settings → Connectors → **Add custom connector**. Name it `Buzzy`, server URL `https://mcp.buzzy.now/mcp`, click Add.
> 2. Click **Connect** and sign in with your Buzzy account. Then enable the Buzzy connector for this session.
>
> No Buzzy account yet? Create one at buzzy.now first. I can't create accounts or sign in for you.
>
> When it's done, say **connected** and I'll verify. Or say **prompt-only** to run the classic flow, where I write the prompts and you paste them into Buzzy yourself.

## After the user answers

- **"connected":** re-check the tools (ToolSearch "buzzy" when tools are deferred), then make one read-only Buzzy call from `TOOLS.md` (models or balance). If it works, confirm in one line, name the workspace and balance only if Buzzy's tools report them and only in Buzzy's own units, then continue with the skill's map. If it fails, name what failed (server not listed, needs auth, tool missing) and show the matching step again.
- **"prompt-only":** run exactly as the classic skill. Never kick anything off. Mention once, at the bridge card or the first shot, that connecting Buzzy would run the kit automatically.
- **Anything else:** treat it as not connected and show the card once more, shorter.
