<!-- INCOMPLETE: expand iteratively — add new effects as they come up in real sessions -->

# Effects Catalog

The model gets effect parameter names wrong because UI names and ExtendScript names don't match. This file is the ground truth for the most-used effects.

Format: Display name (what you see in AE) | ExtendScript name (`addProperty()` argument) | Parameters

---

## Gaussian Blur

Display: **Gaussian Blur**
ExtendScript: `"ADBE Gaussian Blur 2"`

| UI name | ExtendScript name |
|---|---|
| Blurriness | `"Blurriness"` |
| Blur Dimensions | `"Blur Dimensions"` |
| Repeat Edge Pixels | `"Repeat Edge Pixels"` |

```js
var blur = layer.property("Effects").addProperty("ADBE Gaussian Blur 2");
blur.property("Blurriness").setValue(20);
```

---

## Fast Box Blur

Display: **Fast Box Blur**
ExtendScript: `"ADBE Box Blur2"`

| UI name | ExtendScript name |
|---|---|
| Blur Radius | `"Blur Radius"` |
| Iterations | `"Iterations"` |
| Blur Dimensions | `"Blur Dimensions"` |
| Repeat Edge Pixels | `"Repeat Edge Pixels"` |

---

## Drop Shadow

Display: **Drop Shadow**
ExtendScript: `"ADBE Drop Shadow"`

| UI name | ExtendScript name |
|---|---|
| Shadow Color | `"Shadow Color"` |
| Opacity | `"Opacity"` |
| Direction | `"Direction"` |
| Distance | `"Distance"` |
| Softness | `"Softness"` |
| Shadow Only | `"Shadow Only"` |

```js
var shadow = layer.property("Effects").addProperty("ADBE Drop Shadow");
shadow.property("Distance").setValue(10);
shadow.property("Softness").setValue(20);
shadow.property("Opacity").setValue(60);
```

---

## Hue/Saturation

Display: **Hue/Saturation**
ExtendScript: `"ADBE HUE SATURATION"`

| UI name | ExtendScript name |
|---|---|
| Channel Control | `"Channel Control"` |
| Master Hue | `"Master Hue"` |
| Master Saturation | `"Master Saturation"` |
| Master Lightness | `"Master Lightness"` |
| Colorize | `"Colorize"` |
| Colorize Hue | `"Colorize Hue"` |
| Colorize Saturation | `"Colorize Saturation"` |
| Colorize Lightness | `"Colorize Lightness"` |

---

## Levels

Display: **Levels**
ExtendScript: `"ADBE Levels"`

| UI name | ExtendScript name |
|---|---|
| Channel | `"Channel"` |
| Input Black | `"Input Black"` |
| Input White | `"Input White"` |
| Gamma | `"Gamma"` |
| Output Black | `"Output Black"` |
| Output White | `"Output White"` |

---

## Curves

Display: **Curves**
ExtendScript: `"ADBE CurvesCustom"`

Note: Setting Curves values via ExtendScript is complex (custom point data). In practice, use Levels for brightness/contrast adjustments via script and Curves for manual tweaks in the UI.

---

## Tint

Display: **Tint**
ExtendScript: `"ADBE Tint"`

| UI name | ExtendScript name |
|---|---|
| Map Black To | `"Map Black To"` |
| Map White To | `"Map White To"` |
| Amount to Tint | `"Amount to Tint"` |

```js
var tint = layer.property("Effects").addProperty("ADBE Tint");
tint.property("Map Black To").setValue([0, 0, 0, 1]);    // black
tint.property("Map White To").setValue([1, 0.5, 0, 1]);  // orange
tint.property("Amount to Tint").setValue(100);
```

---

## Glow

Display: **Glow**
ExtendScript: `"ADBE Glo2"`

| UI name | ExtendScript name |
|---|---|
| Glow Threshold | `"Glow Threshold"` |
| Glow Radius | `"Glow Radius"` |
| Glow Intensity | `"Glow Intensity"` |
| Composite Original | `"Composite Original"` |
| Glow Colors | `"Glow Colors"` |
| Glow Color Loops | `"Glow Color Loops"` |
| Glow Dimensions | `"Glow Dimensions"` |

---

## Trim Paths

Not an effect — a shape layer property. MCP cannot access this. JSX only.

```js
// accessing Trim Paths on a shape layer
var shapeLayer = comp.layer("ShapeLayer");
var contents = shapeLayer.property("Contents");
var group = contents.property("Group 1");         // your shape group name
var trimPaths = group.property("Trim Paths 1");   // your trim paths name

trimPaths.property("Start").setValueAtTime(0, 0);
trimPaths.property("End").setValueAtTime(0, 0);
trimPaths.property("End").setValueAtTime(1.5, 100);
trimPaths.property("End").setInterpolationTypeAtKey(1, KeyframeInterpolationType.EASY_EASE);
trimPaths.property("End").setInterpolationTypeAtKey(2, KeyframeInterpolationType.EASY_EASE);
```

---

## Set Matte

Display: **Set Matte**
ExtendScript: `"ADBE Set Matte3"`

| UI name | ExtendScript name |
|---|---|
| Take Matte From Layer | `"Take Matte From Layer"` |
| Use For Matte | `"Use For Matte"` |
| Invert Matte | `"Invert Matte"` |
| If Layer Sizes Differ | `"If Layer Sizes Differ"` |
| Composite Matte with Original | `"Composite Matte with Original"` |
| Premultiply Matte Layer | `"Premultiply Matte Layer"` |

---

## Color Balance (HLS)

Display: **Color Balance (HLS)**
ExtendScript: `"ADBE Color Balance (HLS)"`

| UI name | ExtendScript name |
|---|---|
| Hue | `"Hue"` |
| Lightness | `"Lightness"` |
| Saturation | `"Saturation"` |

---

## Lumetri Color

Display: **Lumetri Color**
ExtendScript: `"ADBE lumetri"`

Lumetri has many nested parameters. Most useful for grading via script are Temperature and Tint under Basic Correction:

```js
var lumetri = layer.property("Effects").addProperty("ADBE lumetri");
// Basic correction params are nested under "Basic Correction"
var basic = lumetri.property("Basic Correction");
basic.property("Temperature").setValue(15);    // warm push
basic.property("Tint").setValue(-5);
```

Note: Lumetri's internal naming is inconsistent. Verify param names against the AE UI when setting up.
