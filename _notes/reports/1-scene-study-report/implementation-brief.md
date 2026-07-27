# Three.js implementation brief

## 1. Prepare the production model

Import the structured glTF into Blender. Preserve named empty parents, link the
46 duplicate mesh payloads, add a new recentering root, and normalize mirrored
geometry. Generate UVs only where an image or video needs them. Merge static
detail only when it does not remove an animation pivot.

Rebuild four materials:

- `Text`: white standard/physical material
- `Body`: dark gray base with restrained view-dependent color/reflection
- `Parts`: near-black, stronger reflective/matcap response
- `Head`: black base with video plus subtle rim/reflection response

Export a named-node GLB. Compare an uncompressed reference against a
Meshopt/Draco version. Convert suitable images to KTX2.

## 2. Build the runtime scene

Load the GLB under a recentering wrapper. Resolve named nodes once and retain
references for animation:

```text
Top part
Head
Hand LEFT / arm / elbow / forearm / Hand
Leg Left / femur / shin / Foot
Pelvic
```

Add the perspective camera and point light from study #4. Treat Spline light
numbers as starting values; tune Three.js exposure, radius, distance, shadow
bias, and map size against reference screenshots.

## 3. Recreate behavior

- Tween the camera from Base State to State over 3 seconds.
- Raycast the pointer onto a camera-facing plane.
- Convert the hit point into each tracking node's parent space.
- Dampen Top part and Head quaternions independently.
- Recreate five delayed, eased, infinite ping-pong rotations on named pivots.
- Use a muted inline video element and `VideoTexture` for Head2.
- Disable or freeze these effects for reduced-motion users.

No physics library or skeletal animation system is required.

## 4. Performance gates

- Reuse identical geometry before decimating.
- Cap device pixel ratio on mobile.
- Compare 1024 shadows against contact/baked/no-shadow alternatives.
- Lazy-load behind a poster after critical content.
- Pause video and updates when offscreen.
- Dispose geometries, materials, textures, video, and listeners on unmount.
- Measure compressed transfer, decoded memory, first render, LCP, and steady
  FPS at DPR 1 and 2.

## Recommended first milestone

Render the cleaned hierarchy in neutral black/gray materials with the correct
camera, point light, and animation pivots. Only after silhouette, framing, and
motion match should custom material blending and the head video be added.

