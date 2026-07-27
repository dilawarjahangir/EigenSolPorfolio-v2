# Spline image assets

All three assets are named `Untitled Image` in Spline. The filenames below are
stable study names, ordered top-to-bottom as they appear in the Assets panel.

| Study filename | Dimensions | Visual content | Likely use | Status |
|---|---:|---|---|---|
| `image-01-1024x1024.png` | 1024×1024 | Black reflective head/front image with bright white side arcs | Head/reflection source | Exact binary requires manual editor download |
| `image-02-256x256.png` | 256×256 | Purple-blue circuit-board normal map | Surface normal/detail source | Exact binary requires manual editor download |
| `image-03-654x330.png` | 654×330 | Black background with rows of white/gray dots | Dot mask/pattern source | Exact binary requires manual editor download |

## Acquisition note

Each asset can be opened from Spline's **Assets → Image Assets** section and has
a download icon in the upper-right of its preview. The editor exposes each
preview as a browser-local `blob:` URL. The in-app browser can trigger that
button but cannot hand the resulting blob path to the workspace, and direct
blob navigation is security-blocked. Download the three files manually and
place them in this directory using the stable filenames above.

After the files arrive:

1. Record byte size, MIME type, and SHA-256 here.
2. Determine which Spline material layer references each image.
3. Convert color/detail assets to KTX2 as appropriate; do not apply sRGB color
   handling to the normal map.

