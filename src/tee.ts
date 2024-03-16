import { ColorHsl, ColorRgba, ColorTee, convertTeeColorToHsl, convertTeeColorToRgba } from './color';
import { debounce, loadImage } from './helpers';

export interface TeeRendererCustomEventDetail<T> {
    tee: TeeRenderer;
    payload: T;
}

export type TeeRendererCustomEvent<T = undefined> = CustomEvent<TeeRendererCustomEventDetail<T>>;
export type TeeRendererEventListener<K extends keyof TeeRendererEventsMap> = (this: TeeContainer, ev: TeeRendererEventsMap[K]) => any;

export interface TeeRendererEventsMap {
    "tee:skin-loaded": TeeRendererCustomEvent<{
        skin: string;
        success: boolean;
    }>;

    "tee:rendered": TeeRendererCustomEvent;
}

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
    readonly tee: TeeRenderer;
}

export class TeeRenderer {
    private _container: TeeContainer;
    private _colorBody: ColorTee | undefined;
    private _colorFeet: ColorTee | undefined;

    private _skinUrl: string;
    private _skinBitmap: ImageBitmap | null = null;
    private _skinLoading: boolean = false;
    private _skinLoadingPromise: Promise<void> | null = null;
    private _skinLoadedCallback: Function | null = null;

    private _offscreen: OffscreenCanvas | null = null;
    private _offscreenContext: OffscreenCanvasRenderingContext2D | null = null;

    private readonly _debounceUpdateTeeImage: (...args: any[]) => void;

    constructor(
        container: HTMLDivElement,
        config: TeeRendererConfig,
    ) {
        if ((container as TeeContainer).tee !== undefined) {
            throw new Error('TeeRenderer already initialized on this container');
        }

        Object.defineProperty(container, 'tee', {
            value: this,
            writable: false,
        });

        this._container = container as TeeContainer;
        this._colorBody = config.colorBody;
        this._colorFeet = config.colorFeet;
        this._skinUrl = config.skinUrl;
        this._debounceUpdateTeeImage = debounce(this.updateTeeImage, 10);
        this._container.classList.add('tee_initialized');
        this._container.classList.remove('tee_initializing');

        this.addEventListener('tee:rendered', () => {
            this._container.classList.add('tee_rendered');
        }, {
            once: true,
        });

        this.loadSkin(this._skinUrl, false);
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

        this._colorBody = Number(color);
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

        this._colorFeet = Number(color);
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
        this.loadSkin(url, true);
    }

    public get skinBitmap(): ImageBitmap | null {
        return this._skinBitmap;
    }

    private setSkinVariableValue(value: string | null) {
        this._container.style.setProperty('--skin', value);
    }

    private updateTeeImage() {
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

        this._offscreenContext!.drawImage(this._skinBitmap, 0, 0);

        if (this.useCustomColor) {
            const colorBodyRgba = this.colorBodyRgba || convertTeeColorToRgba(0);
            const colorFeetRgba = this.colorFeetRgba || convertTeeColorToRgba(0);

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
        }

        this._offscreen.convertToBlob().then((blob) => {
            // prevent image flickering
            const url = URL.createObjectURL(blob);
            const image = new Image();

            image.onload = () => {
                this.setSkinVariableValue(`url('${url}')`);
                this.dispatchEvent('tee:rendered');

                image.remove();
            };

            image.src = url;
        });
    }

    private dispatchEvent<K extends keyof TeeRendererEventsMap>(
        ...args: (
            TeeRendererEventsMap[K]['detail']['payload'] extends undefined
                ? [K]
                : [K, TeeRendererEventsMap[K]['detail']['payload']]
        )
    ): void {
        this._container.dispatchEvent(new CustomEvent(args[0], {
            detail: <TeeRendererEventsMap[K]['detail']> {
                tee: this,
                payload: args[1] || undefined,
            },
        }));
    }

    public addEventListener<K extends keyof TeeRendererEventsMap>(
        type: K,
        listener: TeeRendererEventListener<K>,
        options?: boolean | AddEventListenerOptions,
    ) {
        this._container.addEventListener(
            (type as unknown) as keyof HTMLElementEventMap,
            (listener as unknown) as ((this: TeeContainer, ev: Event) => any),
            options,
        );
    }

    public removeEventListener<K extends keyof TeeRendererEventsMap>(
        type: K,
        listener: TeeRendererEventListener<K>,
        options?: boolean | EventListenerOptions,
    ) {
        this._container.removeEventListener(
            (type as unknown) as keyof HTMLElementEventMap,
            (listener as unknown) as ((this: TeeContainer, ev: Event) => any),
            options,
        );
    }

    public update() {
        this._debounceUpdateTeeImage();
    }

    private loadSkin(url: string, update: boolean): Promise<void> {
        if (this._skinLoading) {
            this._skinLoadedCallback = () => this.loadSkin(url, update);
        } else {
            const localFinally = (success: boolean) => {
                this._skinLoadingPromise = null;
                this._skinLoading = false;
                this.dispatchEvent('tee:skin-loaded', {
                    skin: url,
                    success: success,
                });

                if (update) {
                    this.update();
                }

                this._skinLoadedCallback && this._skinLoadedCallback();
                this._skinLoadedCallback = null;
            };

            this._skinLoading = true;
            this._skinLoadedCallback = null;
            this._skinLoadingPromise = loadImage(url).then(async (elImage) => {
                this._skinBitmap = await createImageBitmap(elImage);
                this._skinUrl = elImage.src;
                this._container.dataset.skin = this._skinUrl;

                localFinally(true);
            }).catch(() => {
                console.warn(`TeeRenderer: cannot load skin '${url}'`);
                localFinally(false);
            });
        }

        return this._skinLoadingPromise!;
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

export function createRendererAsync(container: HTMLDivElement): Promise<TeeRenderer> {
    return new Promise<TeeRenderer>((resolve, reject) => {
        // loading timeout
        setTimeout(() => { reject(); }, 20000);

        try {
            container.classList.add('tee_initializing');
            createContainerElements(container);

            const dataset = container.dataset as TeeContainerDatasetMap;
            const tee = new TeeRenderer(container, {
                colorBody: parseInt(dataset.colorBody!) || undefined,
                colorFeet: parseInt(dataset.colorFeet!) || undefined,
                skinUrl: dataset.skin,
            });

            tee.addEventListener('tee:skin-loaded', (event) => {
                resolve(event.detail.tee);
            }, {
                once: true,
            });
        } catch (error) {
            container.classList.remove('tee_initializing');
            reject();
        }
    });
}

export async function initializeAsync(simultaneously: boolean = true) {
    const tasks =
        [...document.querySelectorAll<HTMLDivElement>('.tee:not(.tee_initialized):not(.tee_initializing')]
            .map((container) => createRendererAsync(container));

    if (simultaneously) {
        await Promise.allSettled(tasks).then((result) => {
            result.forEach((task) => {
                if (task.status === 'fulfilled') {
                    try {
                        task.value.update();
                    } catch (error) {
                        // do nothing
                    }
                }
            });
        });
    } else {
        tasks.forEach((task) => {
            task.then((tee) => tee.update());
        });
    }
}

export async function createAsync(config: TeeRendererConfig): Promise<TeeContainer> {
    const container = document.createElement('div');
    const dataset = container.dataset as TeeContainerDatasetMap;

    if (config.colorBody !== undefined) {
        dataset.colorBody = config.colorBody + '';
    }

    if (config.colorFeet !== undefined) {
        dataset.colorFeet = config.colorFeet + '';
    }

    dataset.skin = config.skinUrl;
    container.classList.add('tee');

    const tee = await createRendererAsync(container);
    tee.update();

    return tee.container;
}
