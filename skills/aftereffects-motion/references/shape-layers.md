# Shape Layers

Building and animating shape layers via ExtendScript. Load when working with vector shapes, Trim Paths, strokes, or the Repeater. For the JSX object model and idempotent template, see `references/scripting-patterns.md`. For keyframe and easing detail, see `references/animation-and-keyframes.md`.

Shape layers are the primary vector animation surface in AE. MCP cannot reach into shape contents; all shape work is JSX.

---

## The Contents tree

Everything lives under `Contents`, nested by group. The tree is the thing people get wrong.

```
layer ("ADBE Vector Layer")
  Contents ("ADBE Root Vectors Group")
    Group ("ADBE Vector Group")
      Contents ("ADBE Vectors Group")        // the group's own contents
        Path     ("ADBE Vector Shape - Group")
        Stroke   ("ADBE Vector Graphic - Stroke")
        Fill     ("ADBE Vector Graphic - Fill")
        Trim     ("ADBE Vector Filter - Trim")
        Repeater ("ADBE Vector Filter - Repeater")
      Transform  ("ADBE Vector Transform Group")  // the group's transform, not the layer's
```

Order matters. A stroke listed above a fill draws on top of it. Trim Paths and Repeater are modifiers; they affect everything above them in the same group.

---

## Creating a shape layer from script

```js
var comp = app.project.activeItem;
app.beginUndoGroup("Build shape v1");

// cleanup if re-run
for (var i = comp.numLayers; i >= 1; i--) {
    if (comp.layer(i).name === "Ring") comp.layer(i).remove();
}

var shapeLayer = comp.layers.addShape();
shapeLayer.name = "Ring";
var contents = shapeLayer.property("Contents");

var group = contents.addProperty("ADBE Vector Group");
group.name = "RingGroup";
var groupContents = group.property("ADBE Vectors Group");

// an ellipse primitive
var ellipse = groupContents.addProperty("ADBE Vector Shape - Ellipse");
ellipse.property("ADBE Vector Ellipse Size").setValue([400, 400]);

// stroke, no fill
var stroke = groupContents.addProperty("ADBE Vector Graphic - Stroke");
stroke.property("ADBE Vector Stroke Color").setValue([1, 1, 1, 1]);
stroke.property("ADBE Vector Stroke Width").setValue(12);

app.endUndoGroup();
```

For a custom path instead of a primitive, build a `Shape` object and set it on `ADBE Vector Shape - Group`:

```js
var pathGroup = groupContents.addProperty("ADBE Vector Shape - Group");
var myShape = new Shape();
myShape.vertices = [[0, 0], [200, 0], [200, 200], [0, 200]];
myShape.closed = true;
pathGroup.property("ADBE Vector Shape").setValue(myShape);
```

---

## Trim Paths (the line-draw workhorse)

Trim Paths is the standard way to draw on a stroke, build progress rings, and reveal outlines. It is a group-level modifier, not a layer property.

```js
var trim = groupContents.addProperty("ADBE Vector Filter - Trim");
var end = trim.property("ADBE Vector Trim End");   // 0..100 percent
end.setValueAtTime(0, 0);
end.setValueAtTime(1.2, 100);
end.setInterpolationTypeAtKey(1, KeyframeInterpolationType.BEZIER);
end.setInterpolationTypeAtKey(2, KeyframeInterpolationType.BEZIER);
end.setTemporalEaseAtKey(2, [new KeyframeEase(0, 80)], [new KeyframeEase(0, 80)]);

// offset rotates the start point around the path; animate it for a chasing dash
trim.property("ADBE Vector Trim Offset").setValue(0);
```

Trim properties: `ADBE Vector Trim Start`, `ADBE Vector Trim End`, `ADBE Vector Trim Offset`. To draw out then retract, animate End up and Start up behind it. For a progress ring, animate End alone and start the path at 12 o'clock with Offset.

---

## Stroke and Fill keyframing

Stroke and Fill are group-level graphic properties. Keyframe them exactly like Transform properties.

```js
var fill = groupContents.addProperty("ADBE Vector Graphic - Fill");
var color = fill.property("ADBE Vector Fill Color");
color.setValueAtTime(0, [0.1, 0.1, 0.1, 1]);
color.setValueAtTime(0.5, [0.9, 0.2, 0.3, 1]);

var width = stroke.property("ADBE Vector Stroke Width");
width.setValueAtTime(0, 0);
width.setValueAtTime(0.4, 12); // stroke grows in
```

Dashes live under the stroke's `ADBE Vector Stroke Dashes` group (add a `ADBE Vector Stroke Dash 1` property). Animate the dash offset for marching-ants and chase effects.

---

## Repeater (grids, radials, bursts)

The Repeater duplicates everything above it in the group with a compounding transform. It is the fastest way to a grid, a radial burst, or a row of ticks.

```js
var rep = groupContents.addProperty("ADBE Vector Filter - Repeater");
rep.property("ADBE Vector Repeater Copies").setValue(12);
var repTransform = rep.property("ADBE Vector Repeater Transform");
repTransform.property("ADBE Vector Repeater Position").setValue([0, 0]);
repTransform.property("ADBE Vector Repeater Rotation").setValue(30); // 12 copies x 30deg = full circle
// stagger opacity across copies for a fade-in burst:
repTransform.property("ADBE Vector Repeater Opacity Start").setValue(100);
repTransform.property("ADBE Vector Repeater Opacity End").setValue(0);
```

Animate Copies for a count-up, or animate the Repeater's Offset to march the pattern. To stagger the copies in time you pair the Repeater with an expression or split into separate layers; the Repeater itself cannot offset copies temporally.

---

## Scripting against a hand-built shape layer

Hand-built layers default to generic names ("Shape 1", "Group 1"), and the tree may not match what you expect. Do not assume. Dump the contents tree first:

```js
function dumpContents(propGroup, indent) {
    indent = indent || "";
    var out = "";
    for (var i = 1; i <= propGroup.numProperties; i++) {
        var p = propGroup.property(i);
        out += indent + p.name + "  [" + p.matchName + "]\n";
        if (p.numProperties && p.numProperties > 0) {
            out += dumpContents(p, indent + "  ");
        }
    }
    return out;
}
var layer = app.project.activeItem.layer("Shape Layer 1");
alert(dumpContents(layer.property("Contents")));
```

Read the real names back, then target them exactly.

---

## Common mistakes

- Adding modifiers (Trim, Repeater) at the layer level instead of inside the group's `ADBE Vectors Group`. They do nothing there.
- Confusing the group's own Transform (`ADBE Vector Transform Group`) with the layer Transform. Animating the wrong one moves the wrong thing.
- Assuming primitive names. A "rectangle" the user drew might be a custom path, not `ADBE Vector Shape - Rect`. Dump first.
- Stroke drawn under fill, so the line-draw is hidden. Reorder so stroke sits above fill in the group.
