# Camera, lighting, and global scene

## Global

- Frame size: responsive
- Auto zoom: yes
- Screen UI: none
- Background: `#E3E3E3` at 100%
- Play camera: `Camera 2`
- Ambient light: no
- Shadow quality: `Low (faster)`
- Effects, fog, ambient shadows, and physics: off
- Gravity field: `-10` although physics is disabled
- Grid: XZ; snapping off

## Camera 2

| Property | Value |
|---|---|
| Projection | Perspective |
| Base position / rotation | `[0, 248.98, 360]` / `[0.83, 0, 0]` |
| State position / rotation | `[0, 146.98, 1000]` / `[0.40, 0, 0]` |
| Scale | `[1, 1, 1]` in both states |
| Near / far | `70` / `100000` |
| FOV | `45°` |
| Zoom | `2` |
| Collision | Based on visibility |

On scene start, the camera transitions from Base State to State over 3 seconds,
using a custom cubic Bézier. Delay is 0, with no repeat and no loop.

## Point Light

| Property | Value |
|---|---|
| Position | `[-595, 579, -393]` |
| Color | `#FFFFFF` |
| Intensity | `5` |
| Distance | `2000` |
| Decay | `1` |
| Shadows | Yes |
| Shadow resolution | Large |
| Radius | `98.88` |
| Collision | Based on visibility |

Three.js note: Spline's numerical light response is not guaranteed to match
Three.js. Start with these values, use a physically correct renderer, and tune
exposure, distance, and shadow bias against a visual reference.

