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
    <!-- ... -->
    <div
        class="tee"
        data-skin="https://skins.scrumplex.net/skin/pinky.png"
    >
    </div>
    <!-- ... -->
    <div
        class="tee"
        data-skin="https://skins.scrumplex.net/skin/pinky.png"
        data-color-body="5498880"
        data-color-feet="3079936"
    >
    </div>
    <!-- ... -->
    <div
        class="tee"
        data-skin="https://skins.scrumplex.net/skin/pinky.png"
        data-color-body="5498880"
        data-color-feet="3079936"
        data-use-custom-color="false"
    >
    </div>
    <!-- ... -->
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

createAsync({ skinUrl: 'https://skins.scrumplex.net/skin/pinky.png' }).then((container) => {
    document.body.appendChild(container);
});
```

```js
import { init } from 'tee-skin-renderer';
import 'tee-skin-renderer/css';

init();
```

## License

tee-skin-renderer is licensed under a [CC0-1.0 License](./LICENSE).
