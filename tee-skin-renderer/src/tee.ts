import { debounce, loadImage } from './helpers';

export interface TeeRendererConfig {
    colorBody?: number;
    colorFeet?: number;
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
    private _colorBody: number | undefined;
    private _colorFeet: number | undefined;

    private _skinUrl: string;
    private _skinBitmap: ImageBitmap | null = null;
    private _skinLoading: boolean = false;
    private _skinLoadedCallback: Function | null = null;

    private _offscreen: OffscreenCanvas | null = null;
    private _offscreenContext: OffscreenRenderingContext | null = null;
    private _debounceUpdateTeeImage: (...args: any[]) => void;

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
    }

    private setSkinVariableValue(value: string | null) {
        this._container.style.setProperty('--skin', value);
    };

    private updateTeeImage() {

    }

    private updateSkin(url: string) {
        if (this._skinLoading) {
            this._skinLoadedCallback = () => this.updateSkin(url);
            return;
        }

        this._skinLoading = true;

        loadImage(url).then(async (elImage) => {
            this._skinBitmap = await createImageBitmap(elImage);

            if (this.useCustomColor) {
                this._debounceUpdateTeeImage();
            } else {
                this.setSkinVariableValue(`url('${elImage.src}')`);
            }

            this._container.dataset.skin = url;
            this._skinUrl = url;
            this._skinLoading = false;

            if (this._skinLoadedCallback) {
                this._skinLoadedCallback();
                this._skinLoadedCallback = null;
            }
        });
    }

    public get container(): TeeContainer {
        return this._container;
    }

    public get colorBody(): number | undefined {
        return this._colorBody;
    }

    public get colorFeet(): number | undefined {
        return this._colorFeet;
    }

    public get skinUrl(): string {
        return this._skinUrl;
    }

    public get useCustomColor(): boolean {
        return this._colorBody !== undefined
            || this._colorFeet !== undefined;
    }

    public get skinBitmap(): ImageBitmap | null {
        return this._skinBitmap;
    }
}

export function createTeeElements(container: HTMLDivElement) {
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

    container.appendChild(footLeftOutline);
    container.appendChild(footLeft);
    container.appendChild(footRightOutline);
    container.appendChild(footRight);
}

export function createRenderer(container: HTMLDivElement): TeeRenderer {
    console.log('init');

    createTeeElements(container);

    const dataset = container.dataset as TeeContainerDatasetMap;
    const tee = new TeeRenderer(container, {
        colorBody: parseInt(dataset.colorBody!) || undefined,
        colorFeet: parseInt(dataset.colorFeet!) || undefined,
        skinUrl: dataset.skin,
    });

    return tee;
}
