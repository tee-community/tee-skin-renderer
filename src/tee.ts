import { ColorHsl, ColorRgba, ColorTee, convertTeeColorToHsl, convertTeeColorToRgba, computeOrgWeight, remapGreyscale } from './color';
import * as Atlas from './atlas';
import { debounce, throttle, loadImage } from './helpers';
import {
    DDNET_STATIONARY_SPEED,
    DDNET_TICK_SPEED,
    DOM_ANIMATION_SCALE,
    TeeAnimationPlaybackController,
    evaluateCustomAnimation,
    evaluateTeeAnimation,
} from './animation';
import type {
    TeeAnimationController,
    TeeAnimationDefinition,
    TeeAnimationFrame,
    TeeAnimationPlayOptions,
    TeeEyeType,
} from './animation';

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

export class TeeRenderer {
    private _container: TeeContainer;
    private _eyes: TeeEyeType;
    private _speed: number;
    private _inAir: boolean;
    private _fat: boolean;
    private _afk: boolean;
    private _colorBody: ColorTee | undefined;
    private _colorFeet: ColorTee | undefined;
    private _useCustomColor: boolean;
    private _followMouseFn: ((e: MouseEvent) => void) | null = null;

    private _skinUrl: string;
    private _skinBitmap: ImageBitmap | null = null;
    private _skinLoading: boolean = false;
    private _skinLoadingPromise: Promise<void> | null = null;
    private _skinLoadedCallback: (() => void) | null = null;

    private _offscreen: OffscreenCanvas | null = null;
    private _offscreenContext: OffscreenCanvasRenderingContext2D | null = null;
    private _currentObjectUrl: string | null = null;
    private _cachedColorKey: string | null = null;

    private _animationDistance: number = 0;
    private _animationFrameId: number | null = null;
    private _animationLastTimestamp: number | null = null;
    private _customAnimation: TeeAnimationPlaybackController | null = null;

    private readonly _debounceUpdateTeeImage: () => void;
    private readonly _animationFrameCallback = (timestamp: number) => {
        this._animationFrameId = null;

        if (this._animationLastTimestamp !== null) {
            const deltaSeconds = Math.min(
                Math.max((timestamp - this._animationLastTimestamp) / 1000, 0),
                0.1,
            );
            if (Math.abs(this._speed) > DDNET_STATIONARY_SPEED) {
                this._animationDistance += this._speed * DDNET_TICK_SPEED * deltaSeconds;
                this._animationDistance %= 200;
            }
        }

        this._customAnimation?.advance(timestamp);
        this._animationLastTimestamp = timestamp;
        this.applyAnimationFrame();
        this.updateAnimationLoop();
    };

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
        this._speed = Number.isFinite(config.speed) ? config.speed! : 0;
        this._inAir = config.inAir ?? false;
        this._fat = config.fat ?? false;
        this._afk = config.afk ?? false;
        this._skinUrl = config.skinUrl;
        if (this._fat) {
            this._container.classList.add('tee_fat');
        }
        if (this._afk) {
            this._container.classList.add('tee_afk');
        }
        this._container.classList.add('tee_initialized');
        this._container.classList.remove('tee_initializing');
        this._debounceUpdateTeeImage = debounce(this.updateTeeImage, 10);
        this._container.dataset.speed = String(this._speed);
        this._container.dataset.inAir = this._inAir ? 'true' : 'false';
        this.applyAnimationFrame();
        this.updateAnimationLoop();

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
            this._colorBody = undefined;
            this.update();
            return;
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
            this._colorFeet = undefined;
            this.update();
            return;
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
        this.applyAnimationFrame();
    }

    public get speed(): number {
        return this._speed;
    }

    public set speed(value: number) {
        const speed = Number.isFinite(value) ? value : 0;
        if (this._speed === speed) {
            return;
        }

        this._speed = speed;
        this._container.dataset.speed = String(speed);
        this.applyAnimationFrame();
        this.updateAnimationLoop();
    }

    public get inAir(): boolean {
        return this._inAir;
    }

    public set inAir(value: boolean) {
        if (this._inAir === value) {
            return;
        }

        this._inAir = value;
        this._container.dataset.inAir = value ? 'true' : 'false';
        this.applyAnimationFrame();
        this.updateAnimationLoop();
    }

    public get fat(): boolean {
        return this._fat;
    }

    public set fat(value: boolean) {
        if (this._fat === value) {
            return;
        }

        this._fat = value;
        this._container.classList.toggle('tee_fat', value);
        this.applyAnimationFrame();
    }

    public get afk(): boolean {
        return this._afk;
    }

    public set afk(value: boolean) {
        if (this._afk === value) {
            return;
        }

        this._afk = value;
        this._container.classList.toggle('tee_afk', value);
        this.applyAnimationFrame();
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
            this._container.style.setProperty('--tee-eye-follow-x', '0px');
            this._container.style.setProperty('--tee-eye-follow-y', '0px');
        }
    }

    /** The active custom playback, including a forwards-filled final pose, or null. */
    public get currentAnimation(): TeeAnimationController | null {
        return this._customAnimation;
    }

    /** Starts a custom animation, replacing any custom playback already active on this tee. */
    public playAnimation(
        definition: TeeAnimationDefinition,
        options: TeeAnimationPlayOptions = {},
    ): TeeAnimationController {
        this._customAnimation?.replace();

        let controller: TeeAnimationPlaybackController;
        controller = new TeeAnimationPlaybackController(
            definition,
            options,
            () => {
                if (this._customAnimation !== controller) return;
                this.applyAnimationFrame();
                this.updateAnimationLoop();
            },
            (releasedController) => this.releaseCustomAnimation(releasedController),
        );

        this._customAnimation = controller;
        this._container.classList.add('tee_custom_animation');
        this.applyAnimationFrame();
        this.updateAnimationLoop();
        return controller;
    }

    /** Stops the active custom animation and restores the current built-in DDNet pose. */
    public stopAnimation(): void {
        this._customAnimation?.stop();
    }

    private releaseCustomAnimation(controller: TeeAnimationPlaybackController): void {
        if (this._customAnimation !== controller) return;
        this._customAnimation = null;
        this._container.classList.remove('tee_custom_animation');
        this.applyAnimationFrame();
        this.updateAnimationLoop();
    }

    private mouseFollowThrottleCallbackFactory(): (e: MouseEvent) => void {
        const fn = throttle((e: MouseEvent) => {
            const containerRect = this._container.getBoundingClientRect();
            const dx = (e.clientX - (containerRect.x + containerRect.width / 2));
            const dy = (e.clientY - (containerRect.y + containerRect.height / 2 - containerRect.height * 0.125));

            const a = Math.atan2(dy, dx);
            const x = (Math.cos(a) * 0.125) * containerRect.width;
            const y = (Math.sin(a) * 0.1) * containerRect.height;

            this._container.style.setProperty('--tee-eye-follow-x', `${x.toFixed(4)}px`);
            this._container.style.setProperty('--tee-eye-follow-y', `${y.toFixed(4)}px`);
        }, 20);

        return fn;
    }

    private getAnimationFrame(): TeeAnimationFrame {
        if (this._customAnimation !== null) {
            const controller = this._customAnimation;
            try {
                return evaluateCustomAnimation(controller.definition, {
                    progress: controller.progress,
                    elapsedMs: controller.currentTime,
                    deltaMs: controller.deltaMs,
                    iteration: controller.iteration,
                    speed: this._speed,
                    inAir: this._inAir,
                    afk: this._afk,
                });
            } catch (error) {
                console.error('TeeRenderer: custom animation callback failed', error);
                controller.fail(error);
            }
        }

        return evaluateTeeAnimation({
            speed: this._speed,
            inAir: this._inAir,
            afk: this._afk,
            distance: this._animationDistance,
        });
    }

    private setAnimationStyle(name: string, value: number, unit: string = 'em') {
        this._container.style.setProperty(name, `${value}${unit}`);
    }

    private applyAnimationFrame(frame: TeeAnimationFrame = this.getAnimationFrame()) {
        this.setAnimationStyle('--tee-body-x', frame.body.x * DOM_ANIMATION_SCALE);
        this.setAnimationStyle('--tee-body-y', frame.body.y * DOM_ANIMATION_SCALE);
        this.setAnimationStyle('--tee-body-angle', frame.body.angle * Math.PI * 2, 'rad');
        this.setAnimationStyle(
            '--tee-body-scale',
            (frame.body.scale ?? 1) * (this._fat ? Atlas.FAT_BODY_SCALE : 1),
            '',
        );

        this.setAnimationStyle('--tee-back-foot-x', frame.backFoot.x * DOM_ANIMATION_SCALE);
        this.setAnimationStyle('--tee-back-foot-y', frame.backFoot.y * DOM_ANIMATION_SCALE);
        this.setAnimationStyle('--tee-back-foot-angle', frame.backFoot.angle * Math.PI * 2, 'rad');
        this.setAnimationStyle('--tee-back-foot-scale', (frame.backFoot.scale ?? 1) * Atlas.FOOT_SCALE_X, '');

        this.setAnimationStyle('--tee-front-foot-x', frame.frontFoot.x * DOM_ANIMATION_SCALE);
        this.setAnimationStyle('--tee-front-foot-y', frame.frontFoot.y * DOM_ANIMATION_SCALE);
        this.setAnimationStyle('--tee-front-foot-angle', frame.frontFoot.angle * Math.PI * 2, 'rad');
        this.setAnimationStyle('--tee-front-foot-scale', (frame.frontFoot.scale ?? 1) * Atlas.FOOT_SCALE_X, '');
        this._container.dataset.eyes = frame.eyes ?? this._eyes;
    }

    private updateAnimationLoop() {
        const shouldAnimate = Math.abs(this._speed) > DDNET_STATIONARY_SPEED
            || this._customAnimation?.playState === 'running';

        if (!shouldAnimate) {
            if (this._animationFrameId !== null) {
                cancelAnimationFrame(this._animationFrameId);
                this._animationFrameId = null;
            }
            this._animationLastTimestamp = null;
            return;
        }

        if (this._animationFrameId === null) {
            this._animationLastTimestamp = null;
            this._animationFrameId = requestAnimationFrame(this._animationFrameCallback);
        }
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

    private getColorCacheKey(): string {
        if (!this._useCustomColor) return 'no-color';
        return `${this._colorBody ?? 0}:${this._colorFeet ?? 0}`;
    }

    private updateTeeImage() {
        if (this._skinBitmap === null) {
            return;
        }

        // Skip pixel processing if colors haven't changed
        const colorKey = this.getColorCacheKey();
        if (this._cachedColorKey === colorKey) {
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

            const w = this._offscreen.width;
            const h = this._offscreen.height;

            const footCoordXStart = w * (6 / 8);
            const footCoordXEnd = w;
            const footCoordYStart = h * (1 / 4);
            const footCoordYEnd = h * (3 / 4);

            // Compute OrgWeight for body region (matches DDNet skins.cpp:364-387)
            const bodyRegion = { x: 0, y: 0, w: Math.floor(w * (3 / 8)), h: Math.floor(h * (1 / 4)) };
            const orgWeight = computeOrgWeight(array, w, bodyRegion);

            for (let index = 0; index < array.length; index += 4) {
                const x = (index / 4) % w;
                const y = Math.floor((index / 4) / w);

                const greyscale = (array[index] + array[index + 1] + array[index + 2]) / 3;
                const remapped = remapGreyscale(greyscale, orgWeight);

                const color =
                    x >= footCoordXStart
                        && x < footCoordXEnd
                        && y >= footCoordYStart
                        && y < footCoordYEnd
                        ? colorFeetRgba
                        : colorBodyRgba;

                array[index] = (remapped * color[0]) / 255;
                array[index + 1] = (remapped * color[1]) / 255;
                array[index + 2] = (remapped * color[2]) / 255;
                array[index + 3] = (array[index + 3] * color[3]) / 255;
            }

            this._offscreenContext!.putImageData(imageData, 0, 0);
        }

        this._offscreen.convertToBlob().then((blob) => {
            if (this._currentObjectUrl) {
                URL.revokeObjectURL(this._currentObjectUrl);
            }
            const url = URL.createObjectURL(blob);
            this._currentObjectUrl = url;
            this._cachedColorKey = colorKey;
            this.setSkinVariableValue(`url('${url}')`);
            this.dispatchEvent('tee:rendered');
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

    public renderToCanvas(
        canvas: HTMLCanvasElement | OffscreenCanvas,
        options?: { size?: number; eyes?: TeeEyeType },
    ): void {
        if (!this._skinBitmap) {
            return;
        }

        const size = options?.size ?? 96;
        const spriteScale = size / Atlas.TEE_BASE_SIZE;
        const animationScale = size / 64;
        const animationFrame = this.getAnimationFrame();
        const eyeType = options?.eyes ?? animationFrame.eyes ?? this._eyes;

        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
        if (!ctx) return;

        canvas.width = size;
        canvas.height = size;
        ctx.clearRect(0, 0, size, size);

        // Get the colorized skin image
        const skinCanvas = new OffscreenCanvas(this._skinBitmap.width, this._skinBitmap.height);
        const skinCtx = skinCanvas.getContext('2d', { willReadFrequently: true })!;
        skinCtx.drawImage(this._skinBitmap, 0, 0);

        if (this.useCustomColor) {
            const colorBodyRgba = this.colorBodyRgba || convertTeeColorToRgba(0);
            const colorFeetRgba = this.colorFeetRgba || convertTeeColorToRgba(0);
            const imageData = skinCtx.getImageData(0, 0, skinCanvas.width, skinCanvas.height);
            const array = imageData.data;
            const w = skinCanvas.width;
            const h = skinCanvas.height;

            const footXS = w * Atlas.FOOT_COLOR_REGION.xStart;
            const footXE = w * Atlas.FOOT_COLOR_REGION.xEnd;
            const footYS = h * Atlas.FOOT_COLOR_REGION.yStart;
            const footYE = h * Atlas.FOOT_COLOR_REGION.yEnd;

            const bodyRegion = {
                x: 0, y: 0,
                w: Math.floor(w * Atlas.BODY_COLOR_REGION.xEnd),
                h: Math.floor(h * Atlas.BODY_COLOR_REGION.yEnd),
            };
            const orgWeight = computeOrgWeight(array, w, bodyRegion);

            for (let i = 0; i < array.length; i += 4) {
                const x = (i / 4) % w;
                const y = Math.floor((i / 4) / w);
                const grey = (array[i] + array[i + 1] + array[i + 2]) / 3;
                const remapped = remapGreyscale(grey, orgWeight);
                const color = (x >= footXS && x < footXE && y >= footYS && y < footYE)
                    ? colorFeetRgba : colorBodyRgba;
                array[i] = (remapped * color[0]) / 255;
                array[i + 1] = (remapped * color[1]) / 255;
                array[i + 2] = (remapped * color[2]) / 255;
                array[i + 3] = (array[i + 3] * color[3]) / 255;
            }
            skinCtx.putImageData(imageData, 0, 0);
        }

        // Scale factors for atlas → skin image
        const atlasScaleX = this._skinBitmap.width / Atlas.ATLAS_WIDTH;
        const atlasScaleY = this._skinBitmap.height / Atlas.ATLAS_HEIGHT;

        const centerX = size / 2;
        const centerY = size / 2;
        const bodyPos = {
            x: centerX + animationFrame.body.x * animationScale,
            y: centerY + animationFrame.body.y * animationScale,
        };

        const drawSprite = (
            sprite: Atlas.SpriteRegion,
            dx: number,
            dy: number,
            dw: number,
            dh: number,
            rotation: number = 0,
            flipH: boolean = false,
        ) => {
            ctx.save();
            ctx.translate(dx, dy);
            ctx.rotate(rotation);
            if (flipH) ctx.scale(-1, 1);
            ctx.drawImage(
                skinCanvas,
                sprite.x * atlasScaleX, sprite.y * atlasScaleY,
                sprite.w * atlasScaleX, sprite.h * atlasScaleY,
                -dw / 2, -dh / 2, dw, dh,
            );
            ctx.restore();
        };

        const bodySize = Atlas.SPRITE_BODY.w
            * spriteScale
            * (this._fat ? Atlas.FAT_BODY_SCALE : 1)
            * (animationFrame.body.scale ?? 1);
        const backFootW = Atlas.SPRITE_FOOT.w
            * Atlas.FOOT_SCALE_X
            * spriteScale
            * (animationFrame.backFoot.scale ?? 1);
        const backFootH = Atlas.SPRITE_FOOT.h
            * Atlas.FOOT_SCALE_Y
            * spriteScale
            * (animationFrame.backFoot.scale ?? 1);
        const frontFootW = Atlas.SPRITE_FOOT.w
            * Atlas.FOOT_SCALE_X
            * spriteScale
            * (animationFrame.frontFoot.scale ?? 1);
        const frontFootH = Atlas.SPRITE_FOOT.h
            * Atlas.FOOT_SCALE_Y
            * spriteScale
            * (animationFrame.frontFoot.scale ?? 1);

        const backFootPos = {
            x: centerX + animationFrame.backFoot.x * animationScale,
            y: centerY + animationFrame.backFoot.y * animationScale,
        };
        const frontFootPos = {
            x: centerX + animationFrame.frontFoot.x * animationScale,
            y: centerY + animationFrame.frontFoot.y * animationScale,
        };

        // Eye sprite selection
        const eyeSprites: Record<string, Atlas.SpriteRegion> = {
            normal: Atlas.SPRITE_EYE_NORMAL,
            angry: Atlas.SPRITE_EYE_ANGRY,
            pain: Atlas.SPRITE_EYE_PAIN,
            happy: Atlas.SPRITE_EYE_HAPPY,
            dead: Atlas.SPRITE_EYE_DEAD,
            surprise: Atlas.SPRITE_EYE_SURPRISE,
            blink: Atlas.SPRITE_EYE_NORMAL,
        };
        const eyeSprite = eyeSprites[eyeType] ?? Atlas.SPRITE_EYE_NORMAL;
        const eyeSize = Atlas.SPRITE_EYE_NORMAL.w * Atlas.EYE_SCALE * spriteScale;
        const eyeH = eyeType === 'blink' ? eyeSize * 0.375 : eyeSize;
        const eyeSep = Atlas.EYE_SEPARATION * spriteScale;
        const eyeY = bodyPos.y - size * 0.125;
        const bodyRotation = animationFrame.body.angle * Math.PI * 2;

        // Rendering order (DDNet RenderTee6):
        // 0: back foot outline
        drawSprite(
            Atlas.SPRITE_FOOT_OUTLINE,
            backFootPos.x,
            backFootPos.y,
            backFootW,
            backFootH,
            animationFrame.backFoot.angle * Math.PI * 2,
        );
        // 1: body outline
        drawSprite(
            Atlas.SPRITE_BODY_OUTLINE,
            bodyPos.x,
            bodyPos.y,
            bodySize,
            bodySize,
            bodyRotation,
        );
        // 2: front foot outline
        drawSprite(
            Atlas.SPRITE_FOOT_OUTLINE,
            frontFootPos.x,
            frontFootPos.y,
            frontFootW,
            frontFootH,
            animationFrame.frontFoot.angle * Math.PI * 2,
        );
        // 3: back foot fill
        drawSprite(
            Atlas.SPRITE_FOOT,
            backFootPos.x,
            backFootPos.y,
            backFootW,
            backFootH,
            animationFrame.backFoot.angle * Math.PI * 2,
        );
        // 4: body fill
        drawSprite(
            Atlas.SPRITE_BODY,
            bodyPos.x,
            bodyPos.y,
            bodySize,
            bodySize,
            bodyRotation,
        );
        // 5: eyes
        drawSprite(eyeSprite, bodyPos.x - eyeSep, eyeY, eyeSize, eyeH, bodyRotation);
        drawSprite(eyeSprite, bodyPos.x + eyeSep, eyeY, eyeSize, eyeH, bodyRotation, true);
        // 6: front foot fill
        drawSprite(
            Atlas.SPRITE_FOOT,
            frontFootPos.x,
            frontFootPos.y,
            frontFootW,
            frontFootH,
            animationFrame.frontFoot.angle * Math.PI * 2,
        );
    }

    public destroy() {
        this.followMouse = false;
        this._customAnimation?.destroy();

        if (this._animationFrameId !== null) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;
        }
        this._animationLastTimestamp = null;

        if (this._currentObjectUrl) {
            URL.revokeObjectURL(this._currentObjectUrl);
            this._currentObjectUrl = null;
        }

        if (this._skinBitmap) {
            this._skinBitmap.close();
            this._skinBitmap = null;
        }

        this._offscreen = null;
        this._offscreenContext = null;
        this._cachedColorKey = null;
        this._skinLoadedCallback = null;

        for (const property of [
            '--tee-body-x',
            '--tee-body-y',
            '--tee-body-angle',
            '--tee-body-scale',
            '--tee-back-foot-x',
            '--tee-back-foot-y',
            '--tee-back-foot-angle',
            '--tee-back-foot-scale',
            '--tee-front-foot-x',
            '--tee-front-foot-y',
            '--tee-front-foot-angle',
            '--tee-front-foot-scale',
        ]) {
            this._container.style.removeProperty(property);
        }

        this.setSkinVariableValue(null);
        this._container.classList.remove('tee_initialized', 'tee_rendered', 'tee_custom_animation');
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
                this._cachedColorKey = null;
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
    const footBackOutline = document.createElement('div');
    const footBack = document.createElement('div');

    const footFrontOutline = document.createElement('div');
    const footFront = document.createElement('div');

    eyes.classList.add('tee__eyes');

    footBackOutline.classList.add('tee__foot');
    footBackOutline.classList.add('tee__foot_back');
    footBackOutline.classList.add('tee__foot_outline');

    footBack.classList.add('tee__foot');
    footBack.classList.add('tee__foot_back');

    footFrontOutline.classList.add('tee__foot');
    footFrontOutline.classList.add('tee__foot_front');
    footFrontOutline.classList.add('tee__foot_outline');

    footFront.classList.add('tee__foot');
    footFront.classList.add('tee__foot_front');

    container.replaceChildren();
    container.appendChild(eyes);
    container.appendChild(footBackOutline);
    container.appendChild(footBack);
    container.appendChild(footFrontOutline);
    container.appendChild(footFront);

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
    const containers = [...document.querySelectorAll<TeeDivElement>('.tee:not(.tee_initialized):not(.tee_initializing)')];
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
        speed: container.dataset.speed !== undefined
            ? Number(container.dataset.speed)
            : undefined,
        inAir: container.dataset.inAir !== undefined
            ? container.dataset.inAir === 'true'
            : undefined,
        fat: container.dataset.fat !== undefined
            ? container.dataset.fat === 'true'
            : undefined,
        afk: container.dataset.afk !== undefined
            ? container.dataset.afk === 'true'
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

    if (config.speed !== undefined) {
        container.dataset.speed = String(config.speed);
    }

    if (config.inAir !== undefined) {
        container.dataset.inAir = config.inAir ? 'true' : 'false';
    }

    if (config.fat !== undefined) {
        container.dataset.fat = config.fat ? 'true' : 'false';
    }

    if (config.afk !== undefined) {
        container.dataset.afk = config.afk ? 'true' : 'false';
    }

    container.dataset.skin = config.skinUrl;
    container.classList.add('tee');

    const tee = await createRendererAsync(container, config);
    tee.update();

    return tee.container;
}
