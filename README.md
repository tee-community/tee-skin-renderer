<p align="center"><b>tee-skin-renderer</b> - Teeworlds / DDNet skin renderer for you HTML pages</p>

<p align="center">
    <a href="https://render.tee.skin/"><b>Live Demo</b></a>
</p>

<p align="center">
    <a href="https://unpkg.com/tee-skin-renderer/dist/tee-skin-renderer.umd.js">
        <img
            src="https://img.badgesize.io/https://unpkg.com/tee-skin-renderer/dist/tee-skin-renderer.umd.js?compression=gzip&style=flat-square"
            alt="Gzip Size"
        />
    </a>
    <a href="https://www.npmjs.com/package/tee-skin-renderer">
        <img
            src="https://img.shields.io/npm/v/tee-skin-renderer.svg?style=flat-square&colorB=51C838"
            alt="NPM Version"
        />
    </a>
    <a href="https://www.npmjs.com/package/tee-skin-renderer">
        <img
            src="https://img.shields.io/npm/dt/tee-skin-renderer.svg?style=flat-square"
            alt="NPM Downloads"
        />
    </a>
    <a href="https://github.com/tee-community/tee-skin-renderer/blob/main/LICENSE">
        <img
            src="https://img.shields.io/github/license/tee-community/tee-skin-renderer.svg?style=flat-square"
            alt="License"
        />
    </a>
</p>

<p align="center">
    <a href="https://tee.community/discord">
        <img
            src="https://img.shields.io/discord/218693173130690561.svg?label=%E2%99%A5%20tee.community&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2&style=flat-square"
            alt="Discord"
        />
    </a>
</p>

---

## Getting Started

### Usage (UMD)

```html
<head>
    <!-- ... -->
    <link rel="preload" as="image" href="https://ddstats.tw/skins/default.png">
    <link rel="stylesheet" href="https://unpkg.com/tee-skin-renderer/dist/tee-skin-renderer.css">
    <!-- ... -->
</head>

<body>
    <!-- Basic skin -->
    <div
        class="tee"
        data-skin="https://skins.scrumplex.net/skin/pinky.png"
    >
    </div>

    <!-- Custom colors -->
    <div
        class="tee"
        data-skin="https://skins.scrumplex.net/skin/pinky.png"
        data-color-body="5498880"
        data-color-feet="3079936"
    >
    </div>

    <!-- All options -->
    <div
        class="tee"
        data-skin="https://skins.scrumplex.net/skin/pinky.png"
        data-color-body="5498880"
        data-color-feet="3079936"
        data-use-custom-color="true"
        data-eyes="happy"
        data-speed="10"
        data-fat="true"
        data-follow-mouse="true"
    >
    </div>

    <script src="https://unpkg.com/tee-skin-renderer/dist/tee-skin-renderer.umd.js"></script>
</body>
```

### Usage (ESM)

```console
npm install tee-skin-renderer --save
```

```js
import { createAsync } from 'tee-skin-renderer';
import 'tee-skin-renderer/css';

createAsync({
    skinUrl: 'https://skins.scrumplex.net/skin/pinky.png',
    colorBody: 5498880,
    colorFeet: 3079936,
    eyes: 'happy',
    speed: 10,
    inAir: false,
    fat: false,
    followMouse: true,
}).then((container) => {
    document.body.appendChild(container);
});
```

```js
import { init } from 'tee-skin-renderer';
import 'tee-skin-renderer/css';

init();
```

## Sizing

The tee container is `96em × 96em`. Since `.tee` sets `font-size: 1px` by default, this equals **96 × 96 px**. Change `font-size` to scale the tee:

```css
/* CSS classes */
.tee-xs { font-size: 0.35px; }  /* ~34px */
.tee-sm { font-size: 0.55px; }  /* ~53px */
.tee-md { font-size: 1px;    }  /* 96px (default) */
.tee-lg { font-size: 1.6px;  }  /* ~154px */
.tee-xl { font-size: 2.2px;  }  /* ~211px */
```

```html
<!-- Inline -->
<div class="tee" style="font-size: 1.5px" data-skin="..."></div>
```

```js
// Programmatic
container.style.fontSize = '2px';
```

## Animation

The renderer uses the same DDNet animation keyframes for idle, walking, running, AFK and in-air poses.

`speed` is the signed horizontal velocity in DDNet world units per tick. It controls both the animation mode and the cycle phase:

- `0` (or `|speed| <= 1 / 256`) — idle;
- `0 < |speed| < 5000 / 256` — walk;
- `|speed| >= 5000 / 256` — run;
- negative speed plays the leg cycle backwards while the tee keeps facing right;
- `inAir: true` — jump/fall pose, which takes priority over the movement animation.

The animation is advanced with `requestAnimationFrame`, using DDNet's 50 ticks per second.

```js
const container = await createAsync({
    skinUrl: 'https://ddstats.tw/skins/pinky.png',
    speed: 10, // walk
});

const tee = container.tee;
tee.speed = 20;  // run forward
tee.speed = -20; // run with the reverse leg phase
tee.inAir = true; // jump/fall pose
tee.inAir = false;
```

### Custom animations

Custom animations are programmatic and temporarily replace the visible DDNet pose. The built-in `idle`, `walk`, `run`, `sit` and `inAir` animations are fixed and cannot be redefined. Create a separate animation when you need different behavior.

While a custom animation is visible, the built-in movement phase keeps advancing in the background. Stopping the custom animation therefore returns the tee to the current DDNet pose without restarting its walk or run cycle.

#### Keyframe animations

Define a reusable keyframe animation and play it on any tee:

```js
import { createAsync, defineAnimation } from 'tee-skin-renderer';

const bounce = defineAnimation({
    kind: 'keyframes',
    name: 'bounce',
    duration: 800,
    loop: true,
    easing: 'ease-in-out',
    tracks: {
        body: [
            { time: 0, y: 0, scale: 1 },
            { time: 0.5, y: -12, scale: 1.08 },
            { time: 1, y: 0, scale: 1 },
        ],
        backFoot: [
            { time: 0, angle: -0.04 },
            { time: 0.5, y: -3, angle: 0.04 },
            { time: 1, angle: -0.04 },
        ],
        frontFoot: [
            { time: 0, angle: 0.04 },
            { time: 0.5, y: -3, angle: -0.04 },
            { time: 1, angle: 0.04 },
        ],
        eyes: [
            { time: 0, eyes: 'happy' },
            { time: 0.8, eyes: 'blink' },
            { time: 1, eyes: 'happy' },
        ],
    },
});

const container = await createAsync({
    skinUrl: 'https://ddstats.tw/skins/pinky.png',
});
const playback = container.tee.playAnimation(bounce);

playback.pause();
playback.resume();
playback.seek(400); // milliseconds
playback.stop();

const result = await playback.finished;
console.log(result.reason); // "stopped"
```

#### Procedural animations

For procedural motion, return a pose for each frame. The callback receives animation time plus the tee's current movement state:

```js
const hover = defineAnimation({
    kind: 'callback',
    name: 'hover',
    duration: 1200,
    loop: true,
    frame({ progress, elapsedMs, deltaMs, iteration, speed, inAir, afk }) {
        const wave = Math.sin(progress * Math.PI * 2);

        return {
            body: { y: wave * 5, angle: wave * 0.02 },
            backFoot: { y: -wave * 3, angle: -wave * 0.06 },
            frontFoot: { y: wave * 3, angle: wave * 0.06 },
            eyes: inAir || afk || Math.abs(speed) >= 5000 / 256
                ? 'surprise'
                : 'normal',
        };
    },
});

container.tee.playAnimation(hover, {
    playbackRate: 1,
    startAt: 0,
});
```

#### UMD usage

Use `TeeSkinRenderer.animation.define(...)` in a script build. `TeeSkinRenderer.defineAnimation(...)` is an equivalent direct export.

```html
<link rel="stylesheet" href="https://unpkg.com/tee-skin-renderer/dist/tee-skin-renderer.css">
<script src="https://unpkg.com/tee-skin-renderer/dist/tee-skin-renderer.umd.js"></script>
<script>
    const blink = TeeSkinRenderer.animation.define({
        kind: 'keyframes',
        duration: 300,
        tracks: {
            eyes: [
                { time: 0, eyes: 'normal' },
                { time: 0.5, eyes: 'blink' },
                { time: 1, eyes: 'normal' },
            ],
        },
    });

    TeeSkinRenderer.createAsync({
        skinUrl: 'https://ddstats.tw/skins/pinky.png',
    }).then((container) => {
        document.body.appendChild(container);
        container.tee.playAnimation(blink);
    });
</script>
```

Custom animations do not have a data attribute or global name registry. Keep the returned definition in your application and pass it directly to `playAnimation()`.

#### Definition reference

Every animation definition supports these fields:

| Field | Type | Default | Description |
|---|---|---|---|
| `kind` | `'keyframes' \| 'callback'` | required | Selects keyframe tracks or a procedural callback |
| `name` | `string` | — | Optional label for debugging and UI; it does not register or override an animation |
| `duration` | `number` | required | Duration of one iteration in milliseconds; must be greater than zero |
| `loop` | `boolean` | `false` | Repeats the animation until stopped |
| `fill` | `'none' \| 'forwards'` | `'none'` | Restores the DDNet pose or holds the final custom pose after completion |

Keyframe definitions additionally accept `tracks` and an animation-wide `easing`. Tracks are independent:

| Track | Keyframe shape | Description |
|---|---|---|
| `body` | `{ time, x?, y?, angle?, scale?, easing? }` | Body transform |
| `backFoot` | `{ time, x?, y?, angle?, scale?, easing? }` | Back foot transform |
| `frontFoot` | `{ time, x?, y?, angle?, scale?, easing? }` | Front foot transform |
| `eyes` | `{ time, eyes }` | Discrete eye-type changes |

`time` is normalized from `0` to `1`. Keyframes may be supplied in any order, but duplicate times are invalid. A single keyframe or values outside the first/last keyframe are held without interpolation.

Transform values are offsets from the neutral tee pose:

| Field | Neutral value | Unit |
|---|---:|---|
| `x` | `0` | DDNet's 64-unit tee coordinate space |
| `y` | `0` | DDNet's 64-unit tee coordinate space |
| `angle` | `0` | Turns; `0.25` equals 90 degrees |
| `scale` | `1` | Multiplier |

Missing transform fields use their neutral value at each keyframe; values are not implicitly copied from the previous keyframe. Eye frames switch discretely and support `normal`, `angry`, `pain`, `happy`, `dead`, `surprise` and `blink`.

Animation-wide and per-keyframe easing supports `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`, or `[x1, y1, x2, y2]`. A keyframe's `easing` controls interpolation from that keyframe to the next one.

#### Callback context

A callback definition uses `frame(context)` and returns the same `{ body, backFoot, frontFoot, eyes }` pose shape:

| Context field | Description |
|---|---|
| `progress` | Current iteration progress from `0` to `1` |
| `elapsedMs` | Total playback position in milliseconds, including completed loop iterations |
| `deltaMs` | Playback-adjusted frame delta, capped at 100 ms |
| `iteration` | Zero-based loop iteration |
| `speed` | Current signed DDNet horizontal speed |
| `inAir` | Current jump/fall state |
| `afk` | Current AFK state |

If a callback throws or returns an invalid pose, playback ends with reason `error` and the renderer restores the built-in DDNet pose.

#### Playback options and controller

`tee.playAnimation(definition, options?)` starts an animation and returns a controller. Starting another custom animation replaces the previous one.

| Playback option | Default | Description |
|---|---:|---|
| `loop` | definition value | Overrides looping for this playback |
| `fill` | definition value | Overrides `none`/`forwards` for this playback |
| `playbackRate` | `1` | Positive timeline speed multiplier |
| `startAt` | `0` | Initial timeline position in milliseconds |

| Controller member | Description |
|---|---|
| `definition` | Normalized, frozen animation definition |
| `playState` | `running`, `paused`, `finished` or `stopped` |
| `currentTime` | Current timeline position in milliseconds |
| `progress` | Current iteration progress from `0` to `1` |
| `pause()` / `resume()` | Pauses or continues timeline advancement |
| `seek(timeMs)` | Moves playback to an absolute timeline position |
| `stop()` | Stops playback and restores the built-in pose |
| `finished` | Promise that always resolves with `{ reason, error? }` |

Completion reasons are `completed`, `stopped`, `replaced`, `destroyed` and `error`. The promise never rejects. With `fill: 'forwards'`, `playState` becomes `finished` while the final pose remains active; call `stop()`, `tee.stopAnimation()`, or start another animation to release it.

## Skin Format

Supports standard Teeworlds/DDNet skin images with a **2:1 aspect ratio** at any resolution: 256×128, 512×256, 1024×512, 2048×1024, etc.

## Data Attributes

| Attribute | Type | Description |
|---|---|---|
| `data-skin` | `string` | Skin image URL (required) |
| `data-color-body` | `number` | Body color in Teeworlds format |
| `data-color-feet` | `number` | Feet color in Teeworlds format |
| `data-use-custom-color` | `boolean` | Enable/disable custom coloring |
| `data-eyes` | `string` | Eye type: `normal`, `angry`, `pain`, `happy`, `dead`, `surprise`, `blink` |
| `data-speed` | `number` | Signed horizontal velocity in DDNet world units per tick; controls walk/run and phase |
| `data-in-air` | `boolean` | Use the in-air/jump pose |
| `data-fat` | `boolean` | Fat skin mode (1.3× body scale) |
| `data-afk` | `boolean` | AFK state with sit pose and blink eyes |
| `data-follow-mouse` | `boolean` | Eyes follow mouse cursor |

## API

### `createAsync(config): Promise<TeeContainer>`

Creates a tee renderer programmatically.

```js
const container = await createAsync({
    skinUrl: 'https://ddstats.tw/skins/pinky.png',
    colorBody: 5498880,
    colorFeet: 3079936,
    useCustomColor: true,
    eyes: 'happy',
    speed: 10,
    inAir: false,
    fat: false,
    afk: false,
    followMouse: true,
});

document.body.appendChild(container);
```

### `init(simultaneously?: boolean): Promise<void>`

Auto-initializes all `.tee` elements on the page. By default initializes all tees simultaneously; pass `false` to initialize sequentially.

### TeeRenderer instance

Access the renderer via `container.tee`:

```js
const container = await createAsync({ skinUrl: '...' });
const tee = container.tee;

// Properties (get/set)
tee.skinUrl = '...';           // Change skin
tee.colorBody = 5498880;       // Set body color (or undefined to clear)
tee.colorFeet = 3079936;       // Set feet color (or undefined to clear)
tee.useCustomColor = true;     // Toggle custom colors
tee.eyes = 'angry';            // Change eye type
tee.speed = -20;                // Reverse the leg animation phase
tee.inAir = true;               // Use the jump/fall pose
tee.fat = true;                // Toggle fat mode
tee.afk = true;                // Toggle AFK state
tee.followMouse = true;        // Toggle mouse following

// Read-only
tee.colorBodyHsl;              // [h, s, l] or undefined
tee.colorBodyRgba;             // [r, g, b, a] or undefined
tee.colorFeetHsl;
tee.colorFeetRgba;
tee.skinBitmap;                // ImageBitmap or null

// Methods
tee.update();                  // Force re-render
tee.destroy();                 // Clean up resources
const playback = tee.playAnimation(animationDefinition, {
    loop: true,
    fill: 'none',
    playbackRate: 1,
    startAt: 0,
});
tee.currentAnimation;          // Active custom controller or null
tee.stopAnimation();           // Stop custom animation and restore DDNet pose
tee.renderToCanvas(canvas, {   // Render to canvas element
    size: 128,                 //   output size in px (default: 96)
    eyes: 'happy',             //   override eye type
});
```

The playback controller exposes `playState`, `currentTime`, `progress`, `pause()`, `resume()`, `seek()`, `stop()` and a `finished` promise. `finished` always resolves with `{ reason }`, where reason is `completed`, `stopped`, `replaced`, `destroyed` or `error`.

`renderToCanvas` uses the renderer's current built-in or custom animation frame. Its `eyes` option has priority over custom animation eyes.

### Events

```js
container.tee.addEventListener('tee:skin-loaded', (e) => {
    const { skin, success } = e.detail.payload;
    console.log(`Skin ${skin}: ${success ? 'loaded' : 'failed'}`);
});

container.tee.addEventListener('tee:rendered', (e) => {
    console.log('Tee rendered!');
});
```

### Color Utilities

```js
import { color } from 'tee-skin-renderer';

color.convertTeeColorToHsl(5498880);   // [h, s, l]
color.convertTeeColorToRgba(5498880);  // [r, g, b, a]
color.convertHslToRgba([120, 100, 75]); // [r, g, b, a]
```

## License

tee-skin-renderer is licensed under a [CC0-1.0 License](./LICENSE).
