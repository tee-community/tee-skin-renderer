<p align="center"><b>tee-skin-renderer</b> - Teeworlds / DDNet skin renderer for you HTML pages</p>

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

## Skin Format

Supports standard Teeworlds/DDNet skin images with a **2:1 aspect ratio** at any resolution: 256x128, 512x256, 1024x512, 2048x1024, etc.

## Data Attributes

| Attribute | Type | Description |
|---|---|---|
| `data-skin` | `string` | Skin image URL (required) |
| `data-color-body` | `number` | Body color in Teeworlds format |
| `data-color-feet` | `number` | Feet color in Teeworlds format |
| `data-use-custom-color` | `boolean` | Enable/disable custom coloring |
| `data-eyes` | `string` | Eye type: `normal`, `angry`, `pain`, `happy`, `dead`, `surprise`, `blink` |
| `data-direction` | `string` | Facing direction: `left`, `right` |
| `data-fat` | `boolean` | Fat skin mode (1.3x body scale) |
| `data-follow-mouse` | `boolean` | Eyes follow mouse cursor |

## API

### `createAsync(config): Promise<TeeContainer>`

Creates a tee renderer programmatically.

### `init(): Promise<void>`

Auto-initializes all `.tee` elements with `data-skin` attribute.

### TeeRenderer instance

```js
const container = await createAsync({ skinUrl: '...' });
const tee = container.tee;

tee.skinUrl = '...';           // Change skin
tee.colorBody = 5498880;       // Set body color
tee.colorFeet = 3079936;       // Set feet color
tee.useCustomColor = true;     // Toggle custom colors
tee.eyes = 'angry';            // Change eye type
tee.direction = 'left';        // Change facing direction
tee.fat = true;                // Toggle fat mode
tee.followMouse = true;        // Toggle mouse following
tee.update();                  // Force re-render
tee.destroy();                 // Clean up resources
tee.renderToCanvas(canvas);    // Render to canvas element
```

## License

tee-skin-renderer is licensed under a [CC0-1.0 License](./LICENSE).
