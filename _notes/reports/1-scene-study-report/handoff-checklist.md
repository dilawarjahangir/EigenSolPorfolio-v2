# Handoff checklist

## Before changing code or assets

- Read this report's `README.md`.
- Read sequential #4 `README.md`, `specs.md`, and `scene-spec.json`.
- Read sequential #6 `README.md` and `model-audit.json`.
- Do not use all 23 OBJ files.
- Do not assume `_Textured.gltf` contains any textures.
- Do not delete internal glTF parents or reset their transforms.

## Asset completion

- [ ] Download all three Spline images into
  `../../sequential/4-nexux-robot-hero-scene/assets/spline-images/`.
- [ ] Record filename, dimensions, byte size, MIME type, and SHA-256.
- [ ] Map each image to its Spline material layer.
- [ ] Acquire/convert the head MP4 or approve a lighter replacement.

## Blender preparation

- [ ] Link 46 duplicated primitive payloads.
- [ ] Add a recentering root.
- [ ] Resolve mirrored negative-scale nodes.
- [ ] Generate Head2 UVs and any other required missing UVs.
- [ ] Rebuild four material assignments.
- [ ] Export reference and compressed GLBs.

## Runtime reconstruction

- [ ] Match framing and camera intro.
- [ ] Match point-light and shadow appearance.
- [ ] Implement two pointer look-at targets.
- [ ] Implement five ping-pong rotation tracks.
- [ ] Add looping muted face video.
- [ ] Add reduced-motion and offscreen pause behavior.
- [ ] Record desktop/mobile visual and performance results.

## Repeatable audit

Run:

```sh
node ../../sequential/5-3d-study-env/inspect-gltf.mjs \
  ../../sequential/6-nextbot-3d-model-with-texture/3f0bc064969c41b4af3e9151468a50b7_Textured.gltf
```

Expected headline values: 201 nodes, 80 primitives, 79,816 triangles, and
34 unique primitive geometries.

