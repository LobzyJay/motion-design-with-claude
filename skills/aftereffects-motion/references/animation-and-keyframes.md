# Animation and Keyframes

<!-- TODO: expand with spatial vs temporal keyframe controls, graph editor interpretation, velocity handles, hold frames, time remapping patterns, and common animation arc setups via JSX -->

This covers keyframe fundamentals and common gaps. For full scripting patterns, see `references/scripting-patterns.md`. For expressions, see `references/expressions.md`.

Key facts while this reference is incomplete:

- AE has two keyframe dimensions: temporal (when) and spatial (where, for position). Temporal interpolation controls easing in the graph editor. Spatial interpolation controls the path curve in the comp view.
- `KeyframeInterpolationType.BEZIER` enables manual handle control for both dimensions.
- `KeyframeInterpolationType.EASY_EASE` sets symmetrical ease-in-out handles automatically. The built-in shortcut is F9 in the UI.
- Hold keyframes (`KeyframeInterpolationType.HOLD`) are for snaps, cuts, and mechanical on/off states. Not for smooth motion.
- The velocity handles in the graph editor are not directly settable via basic ExtendScript keyframe calls. For precise velocity curves, set temporal ease with `setTemporalEaseAtKey`: pass `EaseObject` instances with `speed` and `influence` values.
- Time remapping (`layer.timeRemapEnabled = true`) lets you freeze, reverse, or ramp time on any layer. Useful for stutter effects and hold-at-peak moments.
