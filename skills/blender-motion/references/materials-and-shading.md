# Materials and Shading

Principled BSDF covers the majority of motion graphics looks. Know the inputs that actually matter and the node patterns for the looks that come up repeatedly.

---

## Principled BSDF: the inputs that matter

Most BSDF inputs stay at defaults for most materials. These are the ones that change the look:

| Input | Range | What it controls |
|---|---|---|
| Base Color | RGB | The surface color. |
| Metallic | 0–1 | 0 = dielectric. 1 = metal. Don't mix; use 0 or 1, not 0.4. |
| Roughness | 0–1 | 0 = mirror. 1 = completely diffuse. Most brand materials live at 0.05–0.4. |
| IOR | 1.0–2.5 | Index of refraction. 1.45 for glass/plastic, 1.5 for common materials. |
| Alpha | 0–1 | Transparency. Works with Blend Mode on the material. |
| Emission Color | RGB | Self-emitting light. Pair with Emission Strength. |
| Emission Strength | 0+ | Higher values make the surface glow. 0 = off. |
| Subsurface Weight | 0–1 | Light penetration through surface. Use sparingly for soft organic looks. |
| Transmission Weight | 0–1 | Glass-like transmission. Pair with low Roughness for clear glass. |

Defaults that are wrong for most brand motion work:
- Roughness 0.5 is the default. It is too matte for most premium/product looks. Adjust first.
- Metallic 0 is the default. Correct for non-metals. Don't leave it at 0 for metals.

---

## bpy: set up Principled BSDF

```python
import bpy

def setup_material(obj, mat_name, base_color, roughness, metallic=0.0):
    mat = bpy.data.materials.get(mat_name) or bpy.data.materials.new(mat_name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new('ShaderNodeOutputMaterial')
    principled = nodes.new('ShaderNodeBsdfPrincipled')

    principled.inputs['Base Color'].default_value = (*base_color, 1.0)  # RGBA
    principled.inputs['Roughness'].default_value = roughness
    principled.inputs['Metallic'].default_value = metallic

    links.new(principled.outputs['BSDF'], output.inputs['Surface'])

    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

# usage
obj = bpy.data.objects["LogoMesh"]
setup_material(obj, "LogoMaterial", base_color=(0.35, 0.15, 0.85), roughness=0.07)
```

---

## Frosted acrylic

The most-requested premium motion graphics material. Source: Adewale's working values.

```python
import bpy

def frosted_acrylic(obj, mat_name, color_rgb=(0.35, 0.15, 0.85)):
    mat = bpy.data.materials.get(mat_name) or bpy.data.materials.new(mat_name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    mat.blend_method = 'BLEND'

    output   = nodes.new('ShaderNodeOutputMaterial')
    principled = nodes.new('ShaderNodeBsdfPrincipled')
    vol_abs  = nodes.new('ShaderNodeVolumeAbsorption')
    vol_scat = nodes.new('ShaderNodeVolumeScatter')
    mix_vol  = nodes.new('ShaderNodeMixShader')

    # surface: very low roughness, slight transmission
    principled.inputs['Base Color'].default_value = (*color_rgb, 1.0)
    principled.inputs['Roughness'].default_value = 0.07
    principled.inputs['Transmission Weight'].default_value = 0.15
    principled.inputs['IOR'].default_value = 1.45

    # volume: internal diffusion for frosted depth
    vol_abs.inputs['Color'].default_value  = (*color_rgb, 1.0)
    vol_abs.inputs['Density'].default_value = 0.8
    vol_scat.inputs['Color'].default_value  = (1.0, 1.0, 1.0, 1.0)
    vol_scat.inputs['Density'].default_value = 0.2

    mix_vol.inputs['Fac'].default_value = 0.6

    links.new(principled.outputs['BSDF'], output.inputs['Surface'])
    links.new(vol_abs.outputs['Volume'], mix_vol.inputs[1])
    links.new(vol_scat.outputs['Volume'], mix_vol.inputs[2])
    links.new(mix_vol.outputs['Shader'], output.inputs['Volume'])

    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

obj = bpy.data.objects["LogoMesh"]
frosted_acrylic(obj, "FrostedAcrylic")
```

For a cleaner look in Cycles: reduce `vol_scat` density to 0.05 and `vol_abs` density to 0.4.

---

## Emission / glow

```python
principled.inputs['Emission Color'].default_value = (0.9, 0.4, 0.1, 1.0)
principled.inputs['Emission Strength'].default_value = 3.0
```

Pair with Bloom in the compositor for post-process glow. EEVEE has built-in bloom (enable in Render Properties > Bloom). Cycles uses the compositor.

---

## Glass

```python
principled.inputs['Base Color'].default_value = (1.0, 1.0, 1.0, 1.0)
principled.inputs['Roughness'].default_value = 0.0
principled.inputs['Transmission Weight'].default_value = 1.0
principled.inputs['IOR'].default_value = 1.45
mat.blend_method = 'BLEND'
```

Note: glass in EEVEE requires enabling Screen Space Reflections and Refraction in Render Properties. Cycles handles it natively.

---

## Matte / painted surface

```python
principled.inputs['Base Color'].default_value = (0.12, 0.12, 0.12, 1.0)
principled.inputs['Roughness'].default_value = 0.85
principled.inputs['Metallic'].default_value = 0.0
```

---

## Brushed metal

```python
# add a Noise Texture to drive anisotropic variation
principled.inputs['Base Color'].default_value = (0.8, 0.8, 0.8, 1.0)
principled.inputs['Metallic'].default_value = 1.0
principled.inputs['Roughness'].default_value = 0.3
principled.inputs['Anisotropic'].default_value = 0.8
principled.inputs['Anisotropic Rotation'].default_value = 0.0
```

---

## Common material issues to diagnose

| Problem | Cause | Fix |
|---|---|---|
| Surface is completely black | `use_nodes = False` or no Surface link | Enable `mat.use_nodes = True`, connect BSDF to Output Surface |
| Volume not appearing | Volume not connected to Output Volume socket | Connect shader to `output.inputs['Volume']` |
| Material applied but wrong object | Active object mismatch | Confirm `bpy.context.view_layer.objects.active` is the right object |
| Glass looks opaque | `blend_method = 'OPAQUE'` | Set `mat.blend_method = 'BLEND'` |
| EEVEE volume looks wrong | EEVEE's volume approximation | Note to user that volumes will render accurately in Cycles |
