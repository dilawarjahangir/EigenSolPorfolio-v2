# Three.js reconstruction plan

## Asset pass

1. Use the structured export in `../../6-nextbot-3d-model-with-texture/` as the
   geometry and pivot source. Keep one OBJ only as a comparison reference.
2. Import the structured glTF to Blender and restore material assignments.
3. Replace its 46 duplicate primitive payloads with linked geometry/instances;
   preserve distinct animation pivots.
4. Generate UVs for the 14 primitives that lack them where video/image mapping
   needs UV space, especially `Head2`.
5. Recenter the scene, resolve mirrored negative-scale transforms, decimate
   conservatively, and recalculate tangents/normals.
6. Export a named-node GLB; apply Meshopt or Draco and KTX2. Keep one
   uncompressed GLB for visual/debug comparison.

## Runtime graph

```text
HeroScene
├─ PerspectiveCamera
├─ PointLight
├─ Logo
└─ Bot
   ├─ TopPartLookTarget
   │  ├─ HeadLookTarget → HeadVideoMesh
   │  ├─ Neck
   │  ├─ LeftArmRig
   │  ├─ RightArmRig [mirrored geometry]
   │  └─ Body
   └─ Bottom
      ├─ Pelvis
      ├─ LeftLegRig
      └─ RightLegRig [mirrored geometry]
```

Do not animate vertices or duplicate complete meshes. Animate parent pivots or
GLTF bones. A lightweight tween loop is enough; no physics engine is required.

## Material mapping

- `Text`: white `MeshStandardMaterial`; tune roughness/metalness under the point
  light.
- `Body`: dark gray standard/physical material plus a subtle Fresnel or
  view-dependent gradient to suggest Spline's rainbow/matcap stack.
- `Parts`: near-black standard material with a stronger matcap-like reflection.
- `Head`: black base plus `VideoTexture`; add a restrained additive/rim term if
  needed for the Spline look.

Exact Spline blend layers do not map one-to-one to PBR. Match the reference
visually before introducing custom shaders.

## Render and behavior

- Use sRGB output and a tested tone-mapping/exposure pair.
- Cap renderer pixel ratio on mobile.
- Start with a 1024 shadow map; compare it against no shadow and a baked/contact
  shadow option.
- Update pointer look-at only while visible; damp with delta-time-correct
  quaternion interpolation.
- Load the hero after critical page content or behind a poster image.
- Honor `prefers-reduced-motion`; pause animation and video offscreen.
- Dispose GLTF geometries/materials, textures, video, and event listeners.

## Validation gates

- Screenshot match at desktop and mobile breakpoints.
- No pivot jump when a ping-pong cycle reverses.
- No inverted normals on negative-X mirrored nodes.
- Face video autoplays muted on Safari/Chrome mobile.
- Record compressed transfer size, decoded memory, LCP/first render, steady FPS,
  and the cost of shadows at DPR 1 and 2.

The numeric source for implementation is
[scene-spec.json](./scene-spec.json). It is a working reconstruction spec, not
an automated Spline export.
