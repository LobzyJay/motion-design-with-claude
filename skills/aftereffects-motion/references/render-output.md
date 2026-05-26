# Render and Output

<!-- TODO: expand with full Render Queue setup via ExtendScript, output module templates, codec recommendations per delivery type (web, broadcast, handoff), render settings for ProRes/H.264/PNG sequence -->

Claude cannot trigger renders. The user always runs the Render Queue themselves.

Your job before render: confirm settings are correct.

Key facts while this reference is incomplete:

- Claude can audit render settings via MCP or JSX: resolution, frame rate, output module codec, output path, comp in/out points.
- `comp.frameRate`, `comp.width`, `comp.height`, `comp.duration` are all readable via script.
- Render Queue items are accessible via `app.project.renderQueue.item(index)`.
- Output module: `renderQueueItem.outputModule(1).file` gives the output file path.
- Common delivery formats: H.264 (web, client review), ProRes 4444 (handoff with alpha), PNG sequence (frame-by-frame control, safest for iterating). Never render H.264 directly from AE for final output if quality matters; render ProRes or PNG sequence, then transcode.
- Before final render, tell the user: "Cmd+S first. Check Render Queue settings. Then hit Render."
- RAM preview (numpad 0) is not a render. It caches to RAM for real-time preview only. Render Queue writes to disk.
