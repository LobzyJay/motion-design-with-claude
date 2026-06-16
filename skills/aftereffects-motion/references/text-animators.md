# Text Animators

Per-character, per-word, and per-line text animation via ExtendScript. Load when animating titles, reveals, or any type that moves as a system rather than as a single block. For the JSX object model and idempotent template, see `references/scripting-patterns.md`. For keyframe and easing detail, see `references/animation-and-keyframes.md`.

Text animators beat duplicating one layer per character. For a title with 10+ characters or words, animators are faster to build, faster to retime, and the only sane way to stagger a reveal.

---

## Property tree

The path is deep and exact. Get it wrong and the script throws.

```
layer.property("Source Text")                                   // the text content (TextDocument)
layer.property("Text")                                          // text group
layer.property("Text").property("Animators")                    // animator container
  .addProperty("ADBE Text Animator")                            // one animator group
    .property("Properties")                                     // the animated values live here
      .addProperty("ADBE Text Opacity")                         // opacity
      .addProperty("ADBE Text Position 3D")                     // position (use 3D matchName even for 2D)
      .addProperty("ADBE Text Scale 3D")                        // scale
      .addProperty("ADBE Text Rotation")                        // rotation
    // selector lives at the animator level:
  .property("Selectors").addProperty("ADBE Text Selector")      // Range Selector
```

Internal matchNames matter. Display names will not resolve through `addProperty`.

---

## Setting the text content

```js
var layer = comp.layer("Title");
var srcText = layer.property("Source Text");
var td = srcText.value;          // TextDocument
td.text = "MOTION";
td.fontSize = 120;
td.fillColor = [1, 1, 1];
td.justification = ParagraphJustification.CENTER_JUSTIFY;
srcText.setValue(td);            // must set back; editing the copy does nothing alone
```

---

## The Range Selector is the reveal engine

A Range Selector picks which characters the animator affects. You animate its Start or End, and the animated values sweep across the text. The Selector's Advanced group controls how the effect distributes (per character, word, or line) and the shape of the falloff.

```js
var animator = layer.property("Text").property("Animators").addProperty("ADBE Text Animator");
var sel = animator.property("Selectors").addProperty("ADBE Text Selector");

// Range start/end are 0..100 percent of the text
var selEnd = sel.property("ADBE Text Percent End");
selEnd.setValueAtTime(0, 0);
selEnd.setValueAtTime(0.8, 100); // sweep the selection across the whole title

// distribute per character (default), per word, or per line:
sel.property("ADBE Text Range Type2").setValue(1); // 1 = Characters, 2 = Words, 3 = Lines
```

Common selector properties (matchNames):

| Property | matchName | Use |
|---|---|---|
| Start | `ADBE Text Percent Start` | reveal from the end |
| End | `ADBE Text Percent End` | reveal from the start |
| Offset | `ADBE Text Percent Offset` | slide the whole selection window |
| Units | `ADBE Text Range Units` | percent vs index |
| Based on | `ADBE Text Range Type2` | characters / words / lines |

---

## Per-character fade-up reveal

The workhorse title reveal: each character fades and rises into place, staggered.

```js
// idempotent: clears prior animators this script manages before rebuilding
var comp = app.project.activeItem;
if (!comp || !(comp instanceof CompItem)) {
    alert("No active comp.");
} else {
    app.beginUndoGroup("Text fade-up reveal v1");
    var layer = comp.layer("Title");
    var animators = layer.property("Text").property("Animators");

    // cleanup: remove animators named by this script
    for (var i = animators.numProperties; i >= 1; i--) {
        if (animators.property(i).name === "FadeUp") animators.property(i).remove();
    }

    var anim = animators.addProperty("ADBE Text Animator");
    anim.name = "FadeUp";
    var props = anim.property("Properties");
    props.addProperty("ADBE Text Opacity").setValue(0);          // start invisible
    props.addProperty("ADBE Text Position 3D").setValue([0, 40, 0]); // start 40px low

    var sel = anim.property("Selectors").addProperty("ADBE Text Selector");
    var end = sel.property("ADBE Text Percent End");
    end.setValueAtTime(0, 0);
    end.setValueAtTime(0.9, 100);
    end.setInterpolationTypeAtKey(2, KeyframeInterpolationType.BEZIER);
    end.setTemporalEaseAtKey(2, [new KeyframeEase(0, 75)], [new KeyframeEase(0, 75)]);

    // smooth the per-character handoff
    var adv = sel.property("Advanced");
    adv.property("ADBE Text Range Shape").setValue(4); // 4 = Smooth ramp

    app.endUndoGroup();
}
```

Slide-in and scale-in are the same structure: swap the animated property. Position `[80, 0, 0]` for a horizontal slide, Scale `[0, 0, 0]` for a scale-in. Stack two animated properties in one animator for combined moves (fade + rise).

---

## Wiggly Selector

For organic, non-uniform character motion (jitter, hand-lettered feel), add a Wiggly Selector instead of animating a Range Selector. It needs no keyframes; it modulates over time on its own.

```js
var wiggly = anim.property("Selectors").addProperty("ADBE Text Wiggly Selector");
wiggly.property("ADBE Text Temporal Wiggle Max Amount").setValue(100);
wiggly.property("ADBE Text Temporal Wiggle Min Amount").setValue(-100);
wiggly.property("ADBE Text Temporal Freq").setValue(2); // wiggles per second
```

Use this sparingly. Default wiggle on text is as much a beginner tell as `wiggle(5,20)` on Position. Justify it or build a deliberate stagger instead.

---

## Retiming a reveal

The whole reveal is driven by one or two selector keyframes. To make it faster, move the End keyframe earlier; to add hold, push it later. You never touch individual characters. That is the entire reason to use animators.

---

## Common mistakes

- Adding animated properties to the animator root instead of its `Properties` group. They will not animate.
- Using `ADBE Text Position` (does not exist); the matchName is `ADBE Text Position 3D` even in a 2D comp.
- Forgetting `setValue(td)` after editing a TextDocument copy.
- Leaving the Range Shape as Square, which makes characters pop in groups instead of flowing. Set Smooth for a clean sweep.
