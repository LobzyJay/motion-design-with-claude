# Style Guide

Voice and formatting rules for **skill content**: every SKILL.md and reference file. This is the voice Claude uses while it works, so it stays tight and professional. Read this before writing or editing any SKILL.md or reference file. These are not preferences.

**This guide does not govern the human-facing docs** (README, CONTRIBUTING). Those are read by people deciding whether to use the project, so they get a warmer, more casual voice with some personality. Keep the hard bans below everywhere though: no em dashes, no corporate filler, no AI-tell phrasing. Friendly is fine; fake is not.

---

## Voice

**Designer-to-designer.** The reader is a working senior designer. Don't explain what a keyframe is. Don't explain what easing means. Write as if briefing a capable colleague who is new to this specific tool or workflow, not a beginner.

**Hard rules over soft recommendations.** "Easing is a design decision" beats "you might want to consider non-linear easing." If something should always or never be done, say so directly.

**"Steer away from defaults" framing.** The defaults (linear easing, default wiggle, simultaneous animation, default keyframe interpolation) are the problem. Name them by name. Say why they're wrong. Give the specific fix.

**Direct.** No hedging. No "you might", "consider", "it's worth noting", "in conclusion", "let's start by." Get to the point. If a sentence starts with "It's important to note that", delete the first four words and the sentence is usually better.

---

## What not to write

**No em dashes.** Use commas, periods, semicolons, parentheses, or colons. If you find yourself reaching for `—`, restructure the sentence.

**No AI-sounding phrasing.** Banned:
- "I'll go ahead and"
- "Let me dive into"
- "Great question"
- "Absolutely"
- "Certainly"
- "I'd be happy to"
- "It's worth noting that"
- "In conclusion"
- "At the end of the day"
- "Moving forward"

**No corporate language.** Banned: "leverage", "synergize", "best-in-class", "stakeholder alignment", "circle back", "utilize" (use "use"), "facilitate" (use "help").

**No filler intros.** Don't start a reference file with "This document covers..." or "In this guide, you will learn..." Start with the content.

**No summaries.** Don't end a section with "In summary..." The content is already there. Repeating it is noise.

---

## Length targets

| File type | Target length |
|---|---|
| SKILL.md | 40–80 lines |
| Core reference (e.g. operational-canon, expressions) | 200–600 lines |
| Stub reference (TODO-marked) | 10–30 lines, key facts only |
| README | As long as it needs to be; install path is the priority section |

If a reference exceeds 600 lines, split it into two focused files.

---

## Formatting

**Code blocks for all code.** Every script, bpy snippet, expression, or shell command goes in a fenced code block with the language tag.

**Tables for mappings.** UI name vs ExtendScript name, situation vs reference, user phrase vs Claude action: all tables.

**No nested headers past `###`.** Three levels is enough. If you need a fourth level, the content needs restructuring.

**Stubs must be marked.** Every stub reference must include `<!-- TODO: expand ... -->` at the top and a sentence describing what's missing.

---

## Code patterns

**Idempotent by default.** Every JSX script and every bpy script that modifies scene state must be safe to re-run without accumulating side effects. Cleanup logic goes at the top.

**No silent failures.** Wrap risky operations in try/catch (ExtendScript) or explicit existence checks (bpy). If a script fails, it should say so clearly.

**Comment the why, not the what.** If code does something non-obvious, a short comment explaining why is appropriate. Don't comment every line. Don't explain what well-named variables already communicate.

---

## What goes in a SKILL.md vs a reference

**SKILL.md** is the skill's behavior contract. It tells the model:
- What triggers this skill
- What the model should not do
- Hard rules that apply in every session
- Which reference to load in which situation

**References** contain the actual knowledge. Expressions, patterns, catalogs, decision frameworks. The SKILL.md points to them; it does not contain them.

Never put code patterns, parameter tables, or detailed how-to content in a SKILL.md. That belongs in a reference.

---

## Adding a new tool skill

See [CONTRIBUTING.md](CONTRIBUTING.md).
