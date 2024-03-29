import { ColorHsl, ColorRgba, ColorTee, convertTeeColorToHsl, convertTeeColorToRgba } from './color';
import { debounce, throttle, loadImage } from './helpers';

export type TeeEyeType =
    | 'normal'
    | 'angry'
    | 'pain'
    | 'happy'
    | 'dead'
    | 'surprise';

export interface TeeRendererCustomEventDetail<T> {
    tee: TeeRenderer;
    payload: T;
}

export type TeeRendererCustomEvent<T = undefined> = CustomEvent<TeeRendererCustomEventDetail<T>>;
export type TeeRendererEventListener<K extends keyof TeeRendererEventsMap> = (this: TeeContainer, ev: TeeRendererEventsMap[K]) => any;

export interface TeeRendererEventsMap {
    'tee:skin-loaded': TeeRendererCustomEvent<{
        skin: string;
        success: boolean;
    }>;
    'tee:rendered': TeeRendererCustomEvent;
}

export interface TeeRendererConfig {
    colorBody?: ColorTee;
    colorFeet?: ColorTee;
    useCustomColor?: boolean;
    eyes?: TeeEyeType;
    followMouse?: boolean;
    skinUrl: string;
}

export interface TeeContainerDatasetMap extends DOMStringMap {
    colorBody?: string;
    colorFeet?: string;
    useCustomColor?: string;
    eyes?: TeeEyeType;
    followMouse?: string;
    skin: string;
}

export interface TeeDivElement extends HTMLDivElement {
    readonly dataset: TeeContainerDatasetMap;
    readonly eyes: HTMLDivElement;
}

export interface TeeContainer extends TeeDivElement {
    readonly tee: TeeRenderer;
}

export class TeeRenderer {
    private _container: TeeContainer;
    private _eyes: TeeEyeType;
    private _colorBody: ColorTee | undefined;
    private _colorFeet: ColorTee | undefined;
    private _useCustomColor: boolean;
    private _followMouseFn: ((e: MouseEvent) => void) | null = null;

    private _skinUrl: string;
    private _skinBitmap: ImageBitmap | null = null;
    private _skinLoading: boolean = false;
    private _skinLoadingPromise: Promise<void> | null = null;
    private _skinLoadedCallback: Function | null = null;

    private _offscreen: OffscreenCanvas | null = null;
    private _offscreenContext: OffscreenCanvasRenderingContext2D | null = null;
    private _image: HTMLImageElement | null = null;

    private readonly _debounceUpdateTeeImage: (...args: any[]) => void;

    constructor(
        container: TeeDivElement,
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
        this._useCustomColor = config.useCustomColor !== undefined
            ? config.useCustomColor
            : config.colorBody !== undefined || config.colorFeet !== undefined;
        this._eyes = config.eyes ?? 'normal';
        this._skinUrl = config.skinUrl;
        this._container.classList.add('tee_initialized');
        this._container.classList.remove('tee_initializing');
        this._debounceUpdateTeeImage = debounce(this.updateTeeImage, 10);

        this.addEventListener('tee:rendered', () => {
            this._container.classList.add('tee_rendered');
        }, {
            once: true,
        });

        this.followMouse = config.followMouse === true;
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
        return this._useCustomColor;
    }

    public set useCustomColor(useCustomColor: boolean) {
        this._container.dataset.useCustomColor = useCustomColor ? 'true' : 'false';
        this._useCustomColor = useCustomColor;
        this.update();
    }

    public get eyes(): TeeEyeType {
        return this._eyes;
    }

    public set eyes(type: TeeEyeType) {
        if (this._eyes === type) {
            return;
        }

        this._eyes = type;
        this._container.dataset.eyes = type;
    }

    public get followMouse(): boolean {
        return this._followMouseFn !== null;
    }

    public set followMouse(state: boolean) {
        if (this.followMouse === state) {
            return;
        }

        if (state) {
            this._followMouseFn = this.mouseFollowThrottleCallbackFactory();
            document.addEventListener('mousemove', this._followMouseFn);
            this._container.dataset.followMouse = 'true';
        } else {
            document.removeEventListener('mousemove', this._followMouseFn!);
            this._followMouseFn = null;
            this._container.dataset.followMouse = 'false';
        }
    }

    private mouseFollowThrottleCallbackFactory(): (e: MouseEvent) => void {
        const fn = throttle((e: MouseEvent) => {
            const containerRect = this._container.getBoundingClientRect();
            const dx = (e.clientX - (containerRect.x + containerRect.width / 2));
            const dy = (e.clientY - (containerRect.y + containerRect.height / 2 - containerRect.height * 0.125));

            const a = Math.atan2(dy, dx);
            const x = (Math.cos(a) * 0.125) * containerRect.width;
            const y = (Math.sin(a) * 0.1) * containerRect.height;

            this._container.eyes.style.transform = `translate(${x.toFixed(4)}px, ${y.toFixed(4)}px)`;
        }, 20);

        return fn;
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
            const image = this._image || (this._image = new Image());

            image.onload = () => {
                this.setSkinVariableValue(`url('${url}')`);
                this.dispatchEvent('tee:rendered');
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

export function createContainerElements(container: TeeDivElement) {
    const eyes = document.createElement('div');
    const footLeftOutline = document.createElement('div');
    const footLeft = document.createElement('div');

    const footRightOutline = document.createElement('div');
    const footRight = document.createElement('div');

    eyes.classList.add('tee__eyes');

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
    container.appendChild(eyes);
    container.appendChild(footLeftOutline);
    container.appendChild(footLeft);
    container.appendChild(footRightOutline);
    container.appendChild(footRight);

    // @ts-expect-error
    container.eyes = eyes;
}

export function createRendererAsync(
    container: TeeDivElement,
    config: TeeRendererConfig,
): Promise<TeeRenderer> {
    return new Promise<TeeRenderer>((resolve, reject) => {
        // loading timeout
        setTimeout(() => { reject(); }, 20000);

        try {
            container.classList.add('tee_initializing');
            createContainerElements(container);

            const tee = new TeeRenderer(container, config);
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
    const containers = [...document.querySelectorAll<TeeDivElement>('.tee:not(.tee_initialized):not(.tee_initializing')];
    const tasks = containers.map((container) => createRendererAsync(container, {
        colorBody: parseInt(container.dataset.colorBody!) || undefined,
        colorFeet: parseInt(container.dataset.colorFeet!) || undefined,
        useCustomColor: container.dataset.useCustomColor !== undefined
            ? container.dataset.useCustomColor === 'true'
            : undefined,
        eyes: container.dataset.eyes,
        followMouse: container.dataset.followMouse !== undefined
            ? container.dataset.followMouse === 'true'
            : undefined,
        skinUrl: container.dataset.skin,
    }));

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
    const container = document.createElement('div') as TeeDivElement;

    if (config.colorBody !== undefined) {
        container.dataset.colorBody = config.colorBody + '';
    }

    if (config.colorFeet !== undefined) {
        container.dataset.colorFeet = config.colorFeet + '';
    }

    if (config.useCustomColor !== undefined) {
        container.dataset.useCustomColor = config.useCustomColor ? 'true' : 'false';
    }

    if (config.eyes !== undefined) {
        container.dataset.eyes = config.eyes;
    }

    if (config.followMouse !== undefined) {
        container.dataset.followMouse = config.followMouse ? 'true' : 'false';
    }

    container.dataset.skin = config.skinUrl;
    container.classList.add('tee');

    const tee = await createRendererAsync(container, config);
    tee.update();

    return tee.container;
}
