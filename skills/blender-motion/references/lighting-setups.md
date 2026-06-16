# Lighting Setups

Concrete setups for common motion graphics lighting contexts. Load when setting up or diagnosing lights.

---

## The reference-image workflow

Before setting up lights from scratch, ask for a reference image. Extract:

- **Shadow direction and hardness.** Hard-edged shadows = small or distant source. Soft = large or close source.
- **Gradient quality on surfaces.** A broad gradient from light to dark across a face = large area light close to the object.
- **Highlight shape.** The specular highlight on a glossy surface reveals the light source shape. Round highlight = sphere/point. Rectangular = area light.
- **Color temperature.** Warm (orange/yellow) or cool (blue/white)? Is there a warm/cool split (key one temp, fill the opposite)?

State your reading before executing. Don't guess silently.

---

## bpy: add and configure a light

```python
import bpy

def add_area_light(name, energy, size, location, rotation_euler, color=(1.0, 1.0, 1.0)):
    light_data = bpy.data.lights.new(name=name, type='AREA')
    light_data.energy = energy
    light_data.size = size          # width; set size_y for non-square
    light_data.color = color
    light_data.shape = 'RECTANGLE'  # or 'SQUARE', 'DISK', 'ELLIPSE'

    light_obj = bpy.data.objects.new(name=name, object_data=light_data)
    bpy.context.collection.objects.link(light_obj)
    light_obj.location = location
    light_obj.rotation_euler = rotation_euler
    return light_obj
```

---

## Soft studio (brand / product / logo)

For flat editorial looks. Adewale's primary setup for top-down brand renders.

```python
import bpy, math

# Key light: large, overhead-left
add_area_light(
    name="Key",
    energy=800,
    size=0.6,                           # 600mm
    location=(-1.5, -1.0, 3.0),
    rotation_euler=(math.radians(40), 0, math.radians(-30)),
    color=(1.0, 0.98, 0.95)             # very slightly warm
)

# Fill light: large, opposite side, lower energy
add_area_light(
    name="Fill",
    energy=300,
    size=0.8,
    location=(2.0, -0.5, 2.0),
    rotation_euler=(math.radians(50), 0, math.radians(40)),
    color=(0.9, 0.93, 1.0)              # very slightly cool, contrast the key
)

# Rim light: small, behind the object
add_area_light(
    name="Rim",
    energy=150,
    size=0.2,
    location=(0.0, 2.5, 1.5),
    rotation_euler=(math.radians(60), 0, math.radians(180)),
    color=(1.0, 1.0, 1.0)
)
```

The warm key / cool fill split creates dimensionality without looking theatrical.

---

## Three-point (product, character, editorial)

Classic setup. More dimensionality than studio.

| Light | Energy | Size | Position |
|---|---|---|---| 
| Key | 600–1000W | 0.4m | 45° above, 45° to one side |
| Fill | 200–400W | 0.6–0.8m | Opposite side, lower angle |
| Back/Rim | 100–250W | 0.15–0.25m | Behind subject, pointing at camera |

The back light separates the subject from the background and adds perceived depth. Without it, the subject can visually merge with a dark background.

---

## Dramatic / high-contrast

One main source, minimal fill, strong shadows.

```python
# single large area light, steep angle
add_area_light(
    name="KeyDramatic",
    energy=1200,
    size=0.3,                           # smaller = harder shadows
    location=(2.0, -1.0, 4.0),
    rotation_euler=(math.radians(55), 0, math.radians(-45))
)
# no fill, shadows read as dramatic
```

For even harder shadows: switch from Area to Sun light (parallel rays, infinitely hard). Set `energy` in lux (start at 5–10 lux for Sun).

---

## HDRI environment lighting

For realistic reflections on glossy/metallic objects. Set via World shader, not a light object.

```python
import bpy

world = bpy.context.scene.world
world.use_nodes = True
nodes = world.node_tree.nodes
links = world.node_tree.links

bg = nodes.get("Background") or nodes.new('ShaderNodeBackground')
env_tex = nodes.new('ShaderNodeTexEnvironment')

env_tex.image = bpy.data.images.load("/path/to/hdri.hdr")

output = nodes.get("World Output") or nodes.new('ShaderNodeOutputWorld')

links.new(env_tex.outputs['Color'], bg.inputs['Color'])
links.new(bg.outputs['Background'], output.inputs['Surface'])

bg.inputs['Strength'].default_value = 1.0
```

HDRI eliminates the need for manual fill lights in most product renders. Set Strength to taste. 0.5–2.0 covers most uses.

---

## Common lighting problems to diagnose

| What the user sees | Diagnosis | Fix |
|---|---|---|
| Flat, no depth | Missing fill/rim, or key light too frontal | Add rim, move key off-axis to 30–45° |
| Too dark overall | Key energy too low or background absorbing light | Raise key energy, check for objects blocking light |
| Harsh, ugly shadows | Light too small or too far | Increase Area Light size or move it closer |
| No gradient on glossy surface | Light too small relative to object | Use a 600mm+ area light positioned close |
| Hot white highlight, no tone | Roughness too low, overexposed light | Raise roughness to 0.1+, reduce light energy |
| Cold / sterile look | No warm/cool split | Warm the key slightly (color 1.0, 0.97, 0.92), cool the fill |
| EEVEE shows no shadows | Shadow mode off in EEVEE settings | Enable Contact Shadows per light, enable Shadows in Render Properties |
