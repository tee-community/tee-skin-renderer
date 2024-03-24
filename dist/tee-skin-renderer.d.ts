declare namespace color {
    export {
        convertTeeColorToHsl,
        convertTeeColorToRgba,
        convertHslToRgba,
        ColorTee,
        ColorHsl,
        ColorRgba
    }
}
export { color }

declare type ColorHsl = [number, number, number];

declare type ColorRgba = [number, number, number, number];

declare type ColorTee = number;

declare function convertHslToRgba(hsl: ColorHsl, a?: number): ColorRgba;

declare function convertTeeColorToHsl(value: ColorTee): ColorHsl;

declare function convertTeeColorToRgba(value: ColorTee): ColorRgba;

export declare function createAsync(config: TeeRendererConfig): Promise<TeeContainer>;

declare function createContainerElements(container: TeeDivElement): void;

declare function createRendererAsync(container: TeeDivElement, config: TeeRendererConfig): Promise<TeeRenderer>;

declare function debounce(fn: Function, wait: number, immediate?: boolean): (this: any) => void;

declare function domReady(callback: Function, ...args: any[]): void;

declare namespace helpers {
    export {
        debounce,
        throttle,
        loadImage,
        domReady
    }
}
export { helpers }

export declare function init(simultaneously?: boolean): Promise<void>;

declare function loadImage(src: string): Promise<HTMLImageElement>;

declare namespace renderer {
    export {
        createContainerElements,
        createRendererAsync,
        init as initializeAsync,
        createAsync,
        TeeEyeType,
        TeeRendererCustomEventDetail,
        TeeRendererCustomEvent,
        TeeRendererEventListener,
        TeeRendererEventsMap,
        TeeRendererConfig,
        TeeContainerDatasetMap,
        TeeDivElement,
        TeeContainer,
        TeeRenderer
    }
}
export { renderer }

declare interface TeeContainer extends TeeDivElement {
    readonly tee: TeeRenderer;
}

declare interface TeeContainerDatasetMap extends DOMStringMap {
    colorBody?: string;
    colorFeet?: string;
    useCustomColor?: string;
    eyes?: TeeEyeType;
    followMouse?: string;
    skin: string;
}

declare interface TeeDivElement extends HTMLDivElement {
    readonly dataset: TeeContainerDatasetMap;
    readonly eyes: HTMLDivElement;
}

declare type TeeEyeType = 'normal' | 'angry' | 'pain' | 'happy' | 'dead' | 'surprise';

declare class TeeRenderer {
    private _container;
    private _eyes;
    private _colorBody;
    private _colorFeet;
    private _useCustomColor;
    private _followMouseFn;
    private _skinUrl;
    private _skinBitmap;
    private _skinLoading;
    private _skinLoadingPromise;
    private _skinLoadedCallback;
    private _offscreen;
    private _offscreenContext;
    private _image;
    private readonly _debounceUpdateTeeImage;
    constructor(container: TeeDivElement, config: TeeRendererConfig);
    get container(): TeeContainer;
    get colorBody(): ColorTee | undefined;
    set colorBody(color: ColorTee | undefined);
    get colorBodyHsl(): ColorHsl | undefined;
    get colorBodyRgba(): ColorRgba | undefined;
    get colorFeet(): ColorTee | undefined;
    set colorFeet(color: ColorTee | undefined);
    get colorFeetHsl(): ColorHsl | undefined;
    get colorFeetRgba(): ColorRgba | undefined;
    get useCustomColor(): boolean;
    set useCustomColor(useCustomColor: boolean);
    get eyes(): TeeEyeType;
    set eyes(type: TeeEyeType);
    get followMouse(): boolean;
    set followMouse(state: boolean);
    private mouseFollowThrottleCallbackFactory;
    get skinUrl(): string;
    set skinUrl(url: string);
    get skinBitmap(): ImageBitmap | null;
    private setSkinVariableValue;
    private updateTeeImage;
    private dispatchEvent;
    addEventListener<K extends keyof TeeRendererEventsMap>(type: K, listener: TeeRendererEventListener<K>, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof TeeRendererEventsMap>(type: K, listener: TeeRendererEventListener<K>, options?: boolean | EventListenerOptions): void;
    update(): void;
    private loadSkin;
}

declare interface TeeRendererConfig {
    colorBody?: ColorTee;
    colorFeet?: ColorTee;
    useCustomColor?: boolean;
    eyes?: TeeEyeType;
    followMouse?: boolean;
    skinUrl: string;
}

declare type TeeRendererCustomEvent<T = undefined> = CustomEvent<TeeRendererCustomEventDetail<T>>;

declare interface TeeRendererCustomEventDetail<T> {
    tee: TeeRenderer;
    payload: T;
}

declare type TeeRendererEventListener<K extends keyof TeeRendererEventsMap> = (this: TeeContainer, ev: TeeRendererEventsMap[K]) => any;

declare interface TeeRendererEventsMap {
    'tee:skin-loaded': TeeRendererCustomEvent<{
        skin: string;
        success: boolean;
    }>;
    'tee:rendered': TeeRendererCustomEvent;
}

declare function throttle(fn: Function, wait?: number): (this: any) => void;

export { }
