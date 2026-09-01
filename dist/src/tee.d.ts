import { ColorHsl, ColorRgba, ColorTee } from './color';
import { TeeAnimationController, TeeAnimationDefinition, TeeAnimationPlayOptions, TeeEyeType } from './animation';
export type { TeeEyeType } from './animation';
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
    speed?: number;
    inAir?: boolean;
    fat?: boolean;
    afk?: boolean;
    skinUrl: string;
}
export interface TeeContainerDatasetMap extends DOMStringMap {
    colorBody?: string;
    colorFeet?: string;
    useCustomColor?: string;
    eyes?: TeeEyeType;
    followMouse?: string;
    speed?: string;
    inAir?: string;
    fat?: string;
    afk?: string;
    skin: string;
}
export interface TeeDivElement extends HTMLDivElement {
    readonly dataset: TeeContainerDatasetMap;
    readonly eyes: HTMLDivElement;
}
export interface TeeContainer extends TeeDivElement {
    readonly tee: TeeRenderer;
}
export declare class TeeRenderer {
    private _container;
    private _eyes;
    private _speed;
    private _inAir;
    private _fat;
    private _afk;
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
    private _currentObjectUrl;
    private _cachedColorKey;
    private _animationDistance;
    private _animationFrameId;
    private _animationLastTimestamp;
    private _customAnimation;
    private readonly _debounceUpdateTeeImage;
    private readonly _animationFrameCallback;
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
    get speed(): number;
    set speed(value: number);
    get inAir(): boolean;
    set inAir(value: boolean);
    get fat(): boolean;
    set fat(value: boolean);
    get afk(): boolean;
    set afk(value: boolean);
    get followMouse(): boolean;
    set followMouse(state: boolean);
    /** The active custom playback, including a forwards-filled final pose, or null. */
    get currentAnimation(): TeeAnimationController | null;
    /** Starts a custom animation, replacing any custom playback already active on this tee. */
    playAnimation(definition: TeeAnimationDefinition, options?: TeeAnimationPlayOptions): TeeAnimationController;
    /** Stops the active custom animation and restores the current built-in DDNet pose. */
    stopAnimation(): void;
    private releaseCustomAnimation;
    private mouseFollowThrottleCallbackFactory;
    private getAnimationFrame;
    private setAnimationStyle;
    private applyAnimationFrame;
    private updateAnimationLoop;
    get skinUrl(): string;
    set skinUrl(url: string);
    get skinBitmap(): ImageBitmap | null;
    private setSkinVariableValue;
    private getColorCacheKey;
    private updateTeeImage;
    private dispatchEvent;
    addEventListener<K extends keyof TeeRendererEventsMap>(type: K, listener: TeeRendererEventListener<K>, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof TeeRendererEventsMap>(type: K, listener: TeeRendererEventListener<K>, options?: boolean | EventListenerOptions): void;
    update(): void;
    renderToCanvas(canvas: HTMLCanvasElement | OffscreenCanvas, options?: {
        size?: number;
        eyes?: TeeEyeType;
    }): void;
    destroy(): void;
    private loadSkin;
}
export declare function createContainerElements(container: TeeDivElement): void;
export declare function createRendererAsync(container: TeeDivElement, config: TeeRendererConfig): Promise<TeeRenderer>;
export declare function initializeAsync(simultaneously?: boolean): Promise<void>;
export declare function createAsync(config: TeeRendererConfig): Promise<TeeContainer>;
