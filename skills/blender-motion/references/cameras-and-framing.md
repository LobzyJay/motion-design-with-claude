# Cameras and Framing

Camera type and framing are design decisions. Both communicate something about the subject.

---

## Orthographic vs perspective: the decision

| Use orthographic | Use perspective |
|---|---|
| Product shots, logos, brand renders | Scene shots, architectural, narrative |
| When you want zero depth distortion | When depth and scale should read naturally |
| When multiple sides of an object should read equally | When the camera should feel like a real camera |
| Technical / editorial feel | Natural / cinematic feel |
| Top-down brand layouts | Three-quarter views, hero shots |

Most motion graphics for brand and product work use orthographic. It's cleaner, more controllable, and doesn't skew geometry at close distances.

---

## bpy: set up a camera

```python
import bpy, math

def setup_camera(name, cam_type, location, rotation_euler,
                 ortho_scale=None, focal_length=None,
                 res_x=3840, res_y=2160):
    # create or get camera
    cam_data = bpy.data.cameras.get(name) or bpy.data.cameras.new(name)
    cam_obj  = bpy.data.objects.get(name)
    if not cam_obj:
        cam_obj = bpy.data.objects.new(name, cam_data)
        bpy.context.collection.objects.link(cam_obj)

    cam_obj.location = location
    cam_obj.rotation_euler = rotation_euler

    cam_data.type = cam_type  # 'ORTHO' or 'PERSP'
    if cam_type == 'ORTHO' and ortho_scale:
        cam_data.ortho_scale = ortho_scale
    if cam_type == 'PERSP' and focal_length:
        cam_data.lens = focal_length

    bpy.context.scene.camera = cam_obj

    bpy.context.scene.render.resolution_x = res_x
    bpy.context.scene.render.resolution_y = res_y

    return cam_obj
```

---

## Orthographic: top-down brand render

The standard for logo and product renders.

```python
setup_camera(
    name="CamOrtho",
    cam_type='ORTHO',
    location=(0, 0, 10),
    rotation_euler=(0, 0, 0),    # pure top-down
    ortho_scale=4.0,             # units of scene width visible; adjust to fit subject
    res_x=3840, res_y=2160
)
```

For a slightly angled orthographic (isometric-style):

```python
import math
setup_camera(
    name="CamIso",
    cam_type='ORTHO',
    location=(4, -4, 4),
    rotation_euler=(math.radians(54.7), 0, math.radians(45)),
    ortho_scale=5.0,
    res_x=3840, res_y=2160
)
```

`ortho_scale` sets how many Blender units fit across the frame horizontally. Adjust based on the size of your objects. For a logo that spans roughly 2 units wide, `ortho_scale=3` gives comfortable padding.

---

## Perspective: focal length conventions

Focal length determines distortion. In motion graphics, avoid extremes.

| Focal length | Character | Typical use |
|---|---|---|
| 18–24mm | Wide, dramatic distortion | Intentional stylization, not product |
| 35mm | Natural, slight depth | Editorial, scene-setting |
| 50mm | Near-human eye | Neutral product, safe default |
| 85mm | Slight telephoto compression | Portrait, hero product shot, premium feel |
| 135mm+ | Strong compression, flat background | Detail shots, brand hero |

For most motion graphics product/brand work: 85mm or 50mm. The telephoto compression at 85mm makes subjects look more premium.

---

## Depth of field

Blur foreground/background to direct focus to the subject.

```python
cam_data.dof.use_dof = True
cam_data.dof.focus_distance = 3.0      # distance to sharp focus point (Blender units)
cam_data.dof.aperture_fstop = 2.8      # lower = more blur
```

For EEVEE: enable Depth of Field in Render Properties. For Cycles: it's automatic once `use_dof = True`.

Rule: don't use DOF as a decoration. Use it when you want to push a specific element as the sole point of interest and actively suppress everything else. If the frame has multiple equally important elements, DOF fights the composition.

---

## Framing for brand renders

The subject should occupy 50–70% of the frame in the tightest dimension. Too tight and the frame feels cramped. Too loose and the subject loses authority.

Check with an audit prompt before final render:
```
"Confirm the camera is set to orthographic, the subject is centered, and the ortho_scale fits the logo with breathing room."
```

For animated reveals: start framing slightly tighter (subject at 70%) and pull out to comfortable (subject at 55%) during the reveal. The pull-out adds a sense of space opening up as the element lands.

---

## Common camera issues

| Problem | Fix |
|---|---|
| Camera not set as active camera | `bpy.context.scene.camera = cam_obj` |
| Orthographic but still looks perspective | `cam_data.type = 'ORTHO'` (not 'PERSP') |
| Clipping: objects disappear close to camera | `cam_data.clip_start = 0.01`, `cam_data.clip_end = 1000` |
| Resolution still at viewport preview size | Set `render.resolution_x` and `render.resolution_y` explicitly |
| Camera pointing wrong direction | Check `rotation_euler`, in Blender, camera looks in -Z by default; rotation applies from there |
