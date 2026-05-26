# Shape Layers

<!-- TODO: expand with full shape layer property hierarchy, Trim Paths patterns, Repeater usage, fill/stroke keyframing via JSX -->

Shape layers are the primary animation surface for motion graphics in AE. Their property tree is nested: layer > Contents > Group > [Paths, Stroke, Fill, Transform, Trim Paths, Repeater].

MCP cannot access shape layer contents. All shape layer work is JSX.

Key facts while this reference is incomplete:

- Access shape groups via `layer.property("Contents").property("GroupName")`.
- Trim Paths lives inside the group, not at the layer level. See `references/effects-catalog.md` for the access pattern.
- Stroke and Fill are also group-level properties; keyframe them the same way as Transform properties.
- The Repeater modifier duplicates copies with offset transforms. Useful for grid/radial patterns. Set copies, offset, and rotation via ExtendScript.
- Shape layer names in the Contents tree default to generic names ("Shape 1", "Group 1"). If you're scripting against a hand-built shape layer, ask the user for the exact group name, or write a state dump to list the contents tree.
