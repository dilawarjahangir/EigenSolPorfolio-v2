# Nexus robot hero scene study

Compact reconstruction notes for the Spline scene at
<https://app.spline.design/file/1cb4e4ac-19c5-43b1-a4f6-c9fc4fa0cead>.
Captured from the live editor on 2026-07-28 for a later Three.js/Blender
migration.

## Main findings

- The scene contains a responsive frame, one animated perspective camera, one
  shadow-casting point light, a seven-path extruded logo, and an articulated
  robot assembled from meshes and Spline primitives.
- Motion is simple enough to reproduce without a Spline runtime: one camera
  intro, two cursor look-at behaviors, and five looping arm/hand rotations.
- The robot face uses a looping video layer. A Three.js version will need a
  `VideoTexture` or a lighter replacement.
- The local `model_0.obj` through `model_22.obj` files are 23 full duplicates
  of the same geometry, apart from their first two naming lines. They are not
  separate robot nodes.
- The local OBJ source has no UV coordinates or material assignments and is
  about 100k triangles. It should be optimized and converted to GLB before use.
- The later structured glTF export in `../6-nextbot-3d-model-with-texture/`
  preserves the robot hierarchy and is now the preferred geometry source.
- The three Spline image assets are identified in
  [assets/spline-images/README.md](./assets/spline-images/README.md).

## Notes map

- [specs.md](./specs.md) — cost and complexity summary
- [scene/hierarchy.md](./scene/hierarchy.md) — scene graph and major transforms
- [scene/geometry-primitives.md](./scene/geometry-primitives.md) — captured primitive construction details
- [scene/camera-lighting.md](./scene/camera-lighting.md) — global, camera, and light settings
- [scene/materials-assets.md](./scene/materials-assets.md) — material stacks, logo, and media
- [assets/spline-images/README.md](./assets/spline-images/README.md) — image inventory and file status
- [scene/interactions.md](./scene/interactions.md) — camera, cursor, and robot animation
- [threejs/implementation.md](./threejs/implementation.md) — migration approach
- [threejs/model-audit.md](./threejs/model-audit.md) — local OBJ evidence
- [threejs/scene-spec.json](./threejs/scene-spec.json) — machine-readable working spec

## Confidence

Values in these notes were read from the Spline inspector. Positions and sizes
are Spline scene units; rotations are the inspector's degree values. A few
collapsed primitive children and the exact image-to-layer mapping remain to be
verified during reconstruction. The images themselves are visually identified,
but their original blob files require a manual editor download. “Hide” labels
seen on mesh inspectors should
also be tested in an export before treating them as final runtime visibility.
