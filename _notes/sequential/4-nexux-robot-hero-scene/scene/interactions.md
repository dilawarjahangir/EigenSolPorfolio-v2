# Interactions and animation

## Cursor tracking

| Target | Plane | Distance | Damping | Direction | Speed | Reset |
|---|---|---:|---:|---|---:|---|
| `Top part` | Aligned with camera | 1000 | 50 | Z | 5 | No Reset |
| `Head` | Aligned with camera | 300 | 10 | Z | 20 | No Reset |

Implement with a ray from normalized pointer coordinates to a plane facing the
camera. Convert the hit point into parent-local space, orient the target's
chosen forward axis toward it, then damp the quaternion. Clamp pitch/yaw during
the Three.js pass if the unbounded Spline motion looks unnatural.

## Start-event animation

All robot rotations use Ease In Out, repeat forever, and cycle with Ping Pong
Reverse. Positions and scales remain unchanged.

| Node | Base rotation | State rotation | Duration | Initial delay | Repeat delay |
|---|---|---|---:|---:|---|
| `Hand LEFT` | `[0, 0, 4.93]` | `[0, 0, 24.47]` | 2 s | 5 s | End |
| `arm` | `[0, 0, 0]` | `[-34.09, 0, 0]` | 4 s | 5 s | End |
| `elbow` | `[0, -8.14, 0]` | `[0, 20.50, 0]` | 3 s | 7 s | End |
| `forearm` | `[0, 0, 0]` | `[-51.03, 0, 0]` | 2 s | 4 s | End |
| terminal `Hand` mesh | `[34.62, 53.78, 141.83]` | `[149.96, 20.30, 35.58]` | 1 s | 5 s | End |

Additional animation transforms:

- `Hand LEFT` position `[-40.59, 98.31, -3.47]`
- `arm` position `[24.87, 7.43, 2.20]`
- `elbow` position `[12.89, 30.33, -1.57]`
- `forearm` position `[0, 39.50, -18.25]`
- terminal `Hand` position `[-9.43, -91.20, 36.55]`, scale
  `[-1.40, 1.40, 1.40]`

## Camera and media

- `Camera 2`: Base State → State, 3 s, custom Bézier, no loop.
- `Head2`: start-event video playback, autoplay/mute, infinite loop.

For reduced-motion users, skip the camera tween, freeze the cursor look-at at
neutral, and either pause the arm at its base pose or use a very subtle loop.

