# Contributing

Want to add a new tool skill or beef up an existing one? Brilliant. Here's everything you need to do it well.

---

## Before you write anything

Read [STYLE.md](STYLE.md) top to bottom. Yes, all of it. The voice rules are non-negotiable, and content that breaks them won't get merged, so save yourself the round-trip and soak them in first.

Then read the existing `aftereffects-motion/SKILL.md` and `aftereffects-motion/references/operational-canon.md`. These are your length and density templates. Match them and you're already most of the way there.

Read the existing `aftereffects-motion/SKILL.md` and `aftereffects-motion/references/operational-canon.md`. These are the length and density templates. Match them.

---

## Adding a new tool skill (e.g. `cinema4d-motion`)

### 1. Scaffold the structure

```
skills/
└── cinema4d-motion/
    ├── SKILL.md
    └── references/
        ├── operational-canon.md
        ├── limits-and-pitfalls.md
        └── ...
```

### 2. Write `SKILL.md` first

Model it on `aftereffects-motion/SKILL.md`. It must include:

- A `name` and `description` in the frontmatter. The description is what Claude uses to decide when to load the skill. Be specific about triggers. Be specific about what it does NOT trigger on.
- A "What you are not" section. Every skill has one. It sets hard constraints on the model's behavior.
- A "Hard rules" section with numbered rules. Hard rules dominate soft recommendations.
- A "When to load which reference" table. Every reference file needs an entry here.
- A "Voice" line at the end.

Target: 40–80 lines.

### 3. Write `references/operational-canon.md` second

This is the session workflow: how the connection works, how the iteration loop runs, what the user does vs what Claude does. It is loaded at session start.

### 4. Write `references/limits-and-pitfalls.md` third

What the MCP or scripting surface cannot do. Read this before scoping any build. This file prevents Claude from promising things the tool can't deliver.

### 5. Fill in the remaining references

Each reference file covers one domain. Aim for 200–600 lines each. Use the tool's actual API (correct method names, correct parameter names, correct syntax). The model will use this content verbatim to write scripts.

### 6. What the foundation skill assumes

The `motion-design` foundation skill is always available. Your tool skill does not need to explain what easing is, what stagger means, or what the 12 principles are. Reference `motion-design` for those. Your skill covers the tool-specific surface.

Cross-references use this pattern in SKILL.md:
```
Pair with motion-design (foundation skill) for principles, timing, and taste.
```

### 7. Quality bar

Quick gut-check before you submit. Run through this and you're golden:

1. A senior designer reading the skill does not roll their eyes.
2. The voice rules in STYLE.md are met (no em dashes, no AI phrasing, no corporate language).
3. Every reference is under 600 lines.
4. Hard rules dominate soft recommendations.
5. All code patterns are idempotent.
6. The skill works without the MCP attached (writing-level help is still useful).
7. The SKILL.md is under 80 lines.

---

## Extending an existing reference

See a `<!-- TODO: expand ... -->` in a reference? Consider it an open invitation. Fill in the missing section, match the existing voice and format, and delete the TODO comment when you're done.

The pattern for any thin reference: add concrete code examples, parameter tables, and the patterns people actually reach for. Model the density and format on `scripting-patterns.md`, `text-animators.md`, or `shape-layers.md` in aftereffects-motion. Those are the bar.

---

## What not to submit

- Content pulled verbatim from Adobe or Blender documentation. Distill, don't paste.
- References over 600 lines. Split into two focused files.
- New MCPs without confirming they work on macOS + current Claude Code version.
- Content that explains basics (what a keyframe is, what easing means). That belongs in the foundation skill or in a tutorial, not here.
