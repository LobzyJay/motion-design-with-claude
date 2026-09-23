# Skill QA Tool

Stress-tester for the motion design Claude skills. Auto-discovers skills, generates green/red test prompts, runs them with and without skill injection, grades each output, and scores per-skill health.

## Setup

```bash
cd skill-tester
ANTHROPIC_API_KEY=sk-ant-... node server.js
```

Then open `http://localhost:3737`.

Node.js 18+ required (uses native fetch). No npm install needed.

## What it does

1. **Discovers skills** from `../skills/` — reads every SKILL.md and parses name + description + body.
2. **Generates prompts** — a meta-Claude call reads the skill and generates N green (valid use-case) and N red (adversarial/edge-case) prompts.
3. **Runs each prompt twice** in parallel: once with the skill injected as system context, once without (baseline).
4. **Grades each output** via a second Claude call using the rubric in `grader-prompt.md`. Returns strict JSON scores.
5. **Shows a dashboard** — per-test cards with scores, verdict, and side-by-side diff. Per-skill health score (0–10).
6. **Exports** to JSON or Markdown.

## Grading rubric

| Field | Type | Meaning |
|---|---|---|
| `skill_adherence` | 0–10 | Did the output follow the skill's hard rules and voice? |
| `output_quality` | 0–10 | Is the output useful and craft-level for a working designer? |
| `edge_case_handling` | pass/fail | Did the model hold constraints under pressure? |
| `trigger_accuracy` | yes/no | Was the skill correctly triggered for this prompt type? |
| `verdict` | string | 1–2 sentence specific summary |

**Health score** = average of `(skill_adherence + output_quality) / 2` across all graded tests.

## Adding skills

Drop a `SKILL.md` into any new subdirectory under `skills/`. The server picks it up on next request — no restart needed.

## Port

Default: `3737`. Override with `PORT=8080 node server.js`.
