import { ColorHsl, ColorRgba, ColorTee, convertHslToRgba, convertTeeColorToHsl, convertTeeColorToRgba } from './color';
import { debounce, loadImage } from './helpers';

export interface TeeRendererConfig {
    colorBody?: ColorTee;
    colorFeet?: ColorTee;
    skinUrl: string;
}

export interface TeeContainerDatasetMap extends DOMStringMap {
    colorBody?: string;
    colorFeet?: string;
    skin: string;
}

export interface TeeContainer extends HTMLDivElement {
    readonly dataset: TeeContainerDatasetMap;
}

export class TeeRenderer {
    private _container: TeeContainer;
    private _colorBody: ColorTee | undefined;
    private _colorFeet: ColorTee | undefined;

    private _skinUrl: string;
    private _skinBitmap: ImageBitmap | null = null;
    private _skinLoading: boolean = false;
    private _skinLoadedCallback: Function | null = null;

    private _offscreen: OffscreenCanvas | null = null;
    private _offscreenContext: OffscreenCanvasRenderingContext2D | null = null;

    private readonly _debounceUpdateTeeImage: (...args: any[]) => void;

    constructor(
        container: HTMLDivElement,
        config: TeeRendererConfig,
    ) {
        console.log('TeeRenderer');

        Object.defineProperty(container, 'tee', {
            value: this,
            writable: false,
        });

        this._container = container as TeeContainer;
        this._colorBody = config.colorBody;
        this._colorFeet = config.colorFeet;
        this._skinUrl = config.skinUrl;
        this._debounceUpdateTeeImage = debounce(this.updateTeeImage, 10);

        this.updateSkin(this._skinUrl);
    }

    public get container(): TeeContainer {
        return this._container;
    }

    public get colorBody(): ColorTee | undefined {
        return this._colorBody;
    }

    public set colorBody(color: ColorTee | undefined) {
        if (color === undefined) {
            delete this._container.dataset.colorBody;
        }

        this._colorBody = color;
        this.update();
    }

    public get colorBodyHsl(): ColorHsl | undefined {
        return this._colorBody === undefined
            ? undefined
            : convertTeeColorToHsl(this._colorBody);
    }

    public get colorBodyRgba(): ColorRgba | undefined {
        return this._colorBody === undefined
            ? undefined
            : convertTeeColorToRgba(this._colorBody);
    }

    public get colorFeet(): ColorTee | undefined {
        return this._colorFeet;
    }

    public set colorFeet(color: ColorTee | undefined) {
        if (color === undefined) {
            delete this._container.dataset.colorFeet;
        }

        this._colorFeet = color;
        this.update();
    }

    public get colorFeetHsl(): ColorHsl | undefined {
        return this._colorFeet === undefined
            ? undefined
            : convertTeeColorToHsl(this._colorFeet);
    }

    public get colorFeetRgba(): ColorRgba | undefined {
        return this._colorFeet === undefined
            ? undefined
            : convertTeeColorToRgba(this._colorFeet);
    }

    public get useCustomColor(): boolean {
        return this._colorBody !== undefined
            || this._colorFeet !== undefined;
    }

    public get skinUrl(): string {
        return this._skinUrl;
    }

    public set skinUrl(url: string) {
        this.updateSkin(url);
    }

    public get skinBitmap(): ImageBitmap | null {
        return this._skinBitmap;
    }

    private setSkinVariableValue(value: string | null) {
        this._container.style.setProperty('--skin', value);
    };

    private updateTeeImage() {
        if (this.useCustomColor === false) {
            return;
        }

        if (this._skinBitmap === null) {
            return;
        }

        if (this._offscreen === null) {
            this._offscreen = new OffscreenCanvas(this._skinBitmap.width, this._skinBitmap.height);
            this._offscreenContext = this._offscreen.getContext('2d', {
                willReadFrequently: true,
            });
        } else {
            if (this._offscreen.width !== this._skinBitmap.width
                || this._offscreen.height !== this._skinBitmap.height
            ) {
                this._offscreen.width = this._skinBitmap.width;
                this._offscreen.height = this._skinBitmap.height;
            }

            this._offscreenContext!.clearRect(0, 0, this._offscreen.width, this._offscreen.height);
        }

        const colorBodyRgba = this.colorBodyRgba || convertTeeColorToRgba(0);
        const colorFeetRgba = this.colorFeetRgba || convertTeeColorToRgba(0);

        this._offscreenContext!.drawImage(this._skinBitmap, 0, 0);

        const imageData = this._offscreenContext!.getImageData(0, 0, this._offscreen.width, this._offscreen.height);
        const array = imageData.data;

        const footCoordXStart = this._offscreen.width * (6 / 8);
        const footCoordXEnd = this._offscreen.width * (8 / 8);
        const footCoordYStart = this._offscreen.height * (1 / 4);
        const footCoordYEnd = this._offscreen.height * (3 / 4);

        for (let index = 0; index < array.length; index += 4) {
            const x = (index / 4) % this._offscreen.width;
            const y = Math.floor((index / 4) / this._offscreen.width);

            const greyscale = (array[index] + array[index + 1] + array[index + 2]) / 3;
            const color =
                x >= footCoordXStart
                    && x <= footCoordXEnd
                    && y >= footCoordYStart
                    && y <= footCoordYEnd
                    ? colorFeetRgba
                    : colorBodyRgba;

            // r
            array[index] = (greyscale * color[0]) / 255;
            // g
            array[index + 1] = (greyscale * color[1]) / 255;
            // b
            array[index + 2] = (greyscale * color[2]) / 255;
            // a
            array[index + 3] = (array[index + 3] * color[3]) / 255;
        }

        this._offscreenContext!.putImageData(imageData, 0, 0);
        this._offscreen.convertToBlob().then((blob) => {
            const url = URL.createObjectURL(blob);
            this.setSkinVariableValue(`url('${url}')`);
        });
    }

    private update() {
        if (this.useCustomColor) {
            this._debounceUpdateTeeImage();
        } else {
            this.setSkinVariableValue(`url('${this._skinUrl}')`);
        }
    }

    private updateSkin(url: string) {
        if (this._skinLoading) {
            this._skinLoadedCallback = () => this.updateSkin(url);
            return;
        }

        this._skinLoading = true;

        loadImage(url).then(async (elImage) => {
            this._skinBitmap = await createImageBitmap(elImage);
            this._skinUrl = elImage.src;
            this._skinLoading = false;
            this._container.dataset.skin = this._skinUrl;

            this.update();

            if (this._skinLoadedCallback) {
                this._skinLoadedCallback();
                this._skinLoadedCallback = null;
            }
        }).catch(() => {
            console.warn(`TeeRenderer: cannot load skin '${url}'`);
        });
    }
}

export function createContainerElements(container: HTMLDivElement) {
    const footLeftOutline = document.createElement('div');
    const footLeft = document.createElement('div');

    const footRightOutline = document.createElement('div');
    const footRight = document.createElement('div');

    footLeftOutline.classList.add('tee__foot');
    footLeftOutline.classList.add('tee__foot_left');
    footLeftOutline.classList.add('tee__foot_outline');

    footLeft.classList.add('tee__foot');
    footLeft.classList.add('tee__foot_left');

    footRightOutline.classList.add('tee__foot');
    footRightOutline.classList.add('tee__foot_right');
    footRightOutline.classList.add('tee__foot_outline');

    footRight.classList.add('tee__foot');
    footRight.classList.add('tee__foot_right');

    container.replaceChildren();
    container.appendChild(footLeftOutline);
    container.appendChild(footLeft);
    container.appendChild(footRightOutline);
    container.appendChild(footRight);
}

export function createRenderer(container: HTMLDivElement): TeeRenderer {
    console.log('init');

    createContainerElements(container);

    const dataset = container.dataset as TeeContainerDatasetMap;
    const tee = new TeeRenderer(container, {
        colorBody: parseInt(dataset.colorBody!) || undefined,
        colorFeet: parseInt(dataset.colorFeet!) || undefined,
        skinUrl: dataset.skin,
    });

    return tee;
}
