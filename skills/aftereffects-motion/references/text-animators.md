# Text Animators

<!-- TODO: expand with full Text Animator property access, per-character animation patterns, Range Selector usage, Wiggly Selector, common reveal patterns (fade up, slide in, character scale-in) via JSX -->

Text animators in AE allow per-character, per-word, or per-line animation without creating separate layers per character. They are accessible via ExtendScript but the property path is specific.

Key facts while this reference is incomplete:

- Text content: `layer.property("Source Text").setValue(new TextDocument("Hello"))`.
- Animator group: `layer.property("Text").property("Animators").addProperty("ADBE Text Animator")`.
- Each animator has a Range Selector and one or more properties (position, opacity, scale, rotation, character offset, fill color).
- Range Selector controls which characters are affected and how the effect propagates over time. The "Start" and "End" properties of the selector animate the reveal.
- For a simple per-character fade-up reveal: add an animator, add Opacity (0) and Position (0, 40), animate the Range Selector End from 0% to 100%.
- Text animators are faster to set up than per-layer text. For title sequences with 10+ words, prefer animators over duplicating layers.
