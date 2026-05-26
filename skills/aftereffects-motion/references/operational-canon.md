# Operational Canon

How a session actually runs. Load at session start.

## Bridge setup (user-side, once per session)

The MCP server only works if the AE-side bridge is active. If the user isn't getting responses, this is usually why.

1. Open the AE project (`.aep`).
2. Window menu > `mcp-bridge-auto.jsx`. A floating panel appears.
3. Tick the **Auto-run commands** checkbox in that panel.
4. Leave it open for the whole session.

If you make an MCP call and nothing happens, the panel is closed or the checkbox is off. Tell the user to reopen `Window > mcp-bridge-auto.jsx` and tick the box again.

## Choose Mode A or Mode B before acting

Mode A. Live MCP commands. Each tool call is one operation in AE. Round-trip is 3-5 seconds. Good for:

- Inspecting a comp (list layers, get a property value)
- One-off changes (add a Gaussian Blur to layer 1)
- Iterative adjustments while the user is watching

Mode B. JSX scripts. You write a `.jsx` file and the user runs it once via `File > Scripts > Run Script File...`. Good for:

- Building entire animations (50+ keyframes at once)
- Complex effects, masks, time remaps
- Anything you might re-run later
- Anything that would otherwise be 10+ MCP roundtrips

If a build is more than 5 MCP calls, switch to JSX. Don't ask.

The user can re-run a JSX file as many times as needed (as long as you wrote it idempotently, which you must, see `scripting-patterns.md`).

## The iteration loop in detail

1. **User describes the goal.** Plain language is fine. They will sometimes drop a reference image. Treat reference images as design direction, not pixel-exact targets, unless they say otherwise.

2. **Ask one blocking question, if any.** Examples of blocking: target duration unclear, target framerate/comp size unknown, source asset path missing. Don't ask design-taste questions ("should the easing be soft or sharp?"); make a call and let them push back.

3. **Build.** If JSX, save the file to the user's project folder (ask for the path once and remember it for the session). Recommended name pattern: `<purpose>_<vN>.jsx`, e.g. `lockup_reveal_v3.jsx`.

4. **Tell the user exactly what to do next.** If JSX, say: "Save your project (Cmd+S), then run `File > Scripts > Run Script File... > lockup_reveal_v3.jsx`." If Mode A, the work happens live.

5. **User previews.** They hit `0` on the numpad for RAM preview. They report what's wrong or what's right, ideally with a screenshot at a specific timestamp.

6. **You diagnose from the screenshot + their description, then patch.** Patches that touch what the user has changed manually need a state dump first (see below).

## Screenshot-driven debugging

Your only view of AE is what the user screenshots. When something looks wrong:

- Ask for a screenshot **at a specific time** (e.g. "screenshot at 2.5s with the comp panel visible at 100% zoom").
- If timing is the question, ask for two screenshots (start and end of the problematic range).
- If layering is the question, ask for the timeline panel screenshot too, not just the comp panel.

Treat the user as your eyes. They will know what's wrong before you do.

## State dump pattern

If the user has manually adjusted properties or added layers since your last script, your model of the comp is stale. Don't push changes blind. Write a one-shot diagnostic script that dumps the current comp state to JSON, ask the user to run it, then read the JSON file back via the MCP. Then patch.

The state dump script lives in `scripting-patterns.md` as a template. Common name: `_dump_state.jsx`.

## File organisation

Recommend the user keep a per-project folder:

```
~/Documents/<Project>/
├── <Project>.aep
├── structural_build.jsx
├── lockup_reveal.jsx
├── colorize_variants.jsx
└── _dump_state.jsx
```

When you write a new script, save it into that folder by default. Name it for what it does, not when it was made.

## Save discipline

Before running any non-trivial JSX, the user must save. Always say "Cmd+S first, then run." AE's Undo (Cmd+Z) is unreliable on script operations. If a script destroys work and AE didn't undo cleanly, the most recent save is the only recovery.

## Common commands the user might paste back at you

Worth recognising so you can respond fast:

| User says... | They mean... |
|---|---|
| "rerun the script" | Re-execute the JSX you wrote, no changes needed |
| "dump state" | Run `_dump_state.jsx` |
| "patch the timing" | Change keyframe times, not the structural script |
| "restart this section" | Throw away current approach, propose new one |
| "0 on numpad" | RAM preview (just FYI, no action needed) |
