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
    <link rel="preload" as="image" href="https://skins.ddnet.org/skin/community/default.png">
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
        data-direction="left"
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
    direction: 'right',
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
| `data-direction` | `string` | Facing direction: `left`, `right` |
| `data-fat` | `boolean` | Fat skin mode (1.3× body scale) |
| `data-afk` | `boolean` | AFK state with sit pose and blink eyes |
| `data-follow-mouse` | `boolean` | Eyes follow mouse cursor |

## API

### `createAsync(config): Promise<TeeContainer>`

Creates a tee renderer programmatically.

```js
const container = await createAsync({
    skinUrl: 'https://skins.ddnet.org/skin/community/pinky.png',
    colorBody: 5498880,
    colorFeet: 3079936,
    useCustomColor: true,
    eyes: 'happy',
    direction: 'right',
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
tee.direction = 'left';        // Change facing direction
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
tee.renderToCanvas(canvas, {   // Render to canvas element
    size: 128,                 //   output size in px (default: 96)
    eyes: 'happy',             //   override eye type
    direction: 'left',         //   override direction
});
```

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
