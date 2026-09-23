# Render and Color

Render engine choice, sample counts, denoising, color management. Load before any final render setup.

---

## Cycles vs EEVEE: the decision

| Criterion | Cycles | EEVEE |
|---|---|---|
| Final quality renders | Yes | Acceptable for stylized, not for photo-real |
| Volume materials (fog, frosted glass) | Accurate | Approximate |
| Subsurface scattering | Accurate | Approximate |
| Render speed | Slow (minutes to hours) | Fast (seconds) |
| Iteration feedback | Too slow | Correct use case |
| Caustics, global illumination | Yes | No |

Rule: EEVEE for previews during every iteration. Cycles for finals.

Do not tell the user to wait for Cycles via MCP. They press F12.

---

## bpy: set render engine

```python
import bpy

scene = bpy.context.scene

# for preview
scene.render.engine = 'BLENDER_EEVEE_NEXT'   # Blender 4.2+
# or
scene.render.engine = 'BLENDER_EEVEE'        # Blender < 4.2

# for final
scene.render.engine = 'CYCLES'
```

---

## Cycles settings for quality renders

```python
scene.render.engine = 'CYCLES'

# samples
scene.cycles.samples = 512                  # 256 for most brand work, 512 for high detail
scene.cycles.preview_samples = 64

# denoising (OIDN, Intel Open Image Denoise, GPU-agnostic)
scene.cycles.use_denoising = True
scene.cycles.denoiser = 'OPENIMAGEDENOISE'  # or 'OPTIX' for Nvidia

# device (GPU if available)
scene.cycles.device = 'GPU'                  # falls back to CPU if no GPU
```

Sample count guidance:

| Use case | Samples |
|---|---|
| Draft / fast preview | 64–128 |
| Most brand / product work | 256–512 |
| High-detail glass, volumetrics | 512–1024 |
| Maximum quality (slow) | 1024–4096 |

With OIDN denoising, 256 samples often produces clean results that would need 1024+ without denoising.

---

## Output resolution and format

```python
render = scene.render

# resolution
render.resolution_x = 3840
render.resolution_y = 2160
render.resolution_percentage = 100

# output path
render.filepath = "/tmp/render_output/"     # Blender appends frame numbers

# format
render.image_settings.file_format = 'PNG'  # 'PNG', 'OPEN_EXR', 'JPEG', 'FFMPEG'
render.image_settings.color_mode = 'RGBA'  # 'RGB' for no alpha, 'RGBA' for alpha
render.image_settings.color_depth = '16'   # '8' or '16' for PNG

# for animation output: PNG sequence is safest
render.image_settings.file_format = 'PNG'
```

Common formats:
- **PNG sequence:** safest for animation. Each frame is a file. Re-render individual frames if something breaks. 16-bit for color grading headroom.
- **OpenEXR:** maximum quality, HDR, multi-layer. Use when handing off to a compositor.
- **JPEG:** lossy, not for finals. Only for rough previews.
- **FFMPEG (MP4/H.264):** convenient but lossy and can't re-render individual frames. Use for client previews, not final delivery.

---

## Color management: AgX

AgX is Blender's modern tone mapper (Blender 4.0+). Use it for all renders.

```python
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'  # or 'None', 'Medium Contrast', etc.
scene.view_settings.exposure = 0.0
scene.view_settings.gamma = 1.0
```

AgX look options (from flattest to most contrast):
- `'AgX - Very Low Contrast'`
- `'AgX - Low Contrast'`
- `'AgX - Base Contrast'` (default)
- `'AgX - Medium Contrast'`
- `'AgX - Medium High Contrast'` (most common for brand/product)
- `'AgX - High Contrast'`
- `'AgX - Very High Contrast'`

Avoid `'Filmic'` (previous default) for new projects. AgX handles highlight rolloff better and avoids the hue shifts that Filmic introduced.

Avoid `'Standard'` (no tone mapping). Blown-out whites, no highlight recovery.

---

## EEVEE preview render via bpy

For the iteration loop, trigger a quick EEVEE render and save to a temp path:

```python
import bpy

def eevee_preview(output_path="/tmp/eevee_preview.png", res_x=1280, res_y=720):
    scene = bpy.context.scene
    prev_engine = scene.render.engine
    prev_x = scene.render.resolution_x
    prev_y = scene.render.resolution_y
    prev_path = scene.render.filepath
    prev_format = scene.render.image_settings.file_format

    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.render.resolution_x = res_x
    scene.render.resolution_y = res_y
    scene.render.filepath = output_path
    scene.render.image_settings.file_format = 'PNG'

    bpy.ops.render.render(write_still=True)

    # restore
    scene.render.engine = prev_engine
    scene.render.resolution_x = prev_x
    scene.render.resolution_y = prev_y
    scene.render.filepath = prev_path
    scene.render.image_settings.file_format = prev_format

    return output_path

eevee_preview()
```

After running, read the output image back via MCP and show the result to the user.

---

## Pre-render checklist (run before F12)

```python
import bpy

scene = bpy.context.scene
issues = []

if not scene.camera:
    issues.append("No active camera.")
if scene.render.engine != 'CYCLES':
    issues.append(f"Render engine is {scene.render.engine}, not CYCLES.")
if scene.cycles.samples < 128:
    issues.append(f"Sample count is low ({scene.cycles.samples}). Consider 256+.")
if not scene.cycles.use_denoising:
    issues.append("Denoising is off.")

for obj in scene.objects:
    if obj.hide_render and obj.type == 'MESH':
        issues.append(f"'{obj.name}' is hidden from render.")

if not scene.render.filepath or scene.render.filepath == "//":
    issues.append("Output path not set.")

if issues:
    print("Pre-render issues:")
    for issue in issues:
        print(f"  - {issue}")
else:
    print("All clear. Press F12 to render.")
```
