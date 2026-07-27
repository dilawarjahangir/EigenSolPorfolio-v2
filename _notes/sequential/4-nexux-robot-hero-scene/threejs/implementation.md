# Three.js reconstruction plan

## Asset pass

1. Use one OBJ as the geometry reference; ignore the other 22 naming-only
   duplicates.
2. Import to Blender, repair/rebuild materials, and separate only the parts
   needed for pivots: head/top, upper arm, elbow, forearm, hand, pelvis, femur,
   shin, and foot.
3. Reconstruct the Spline primitive details where the flattened OBJ is
   insufficient, then mirror hands and legs with linked geometry.
4. Decimate conservatively, merge static primitives, generate UVs only where
   needed, and recalculate tangents/normals.
5. Export a named-node GLB; apply Meshopt or Draco and KTX2. Keep one
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

