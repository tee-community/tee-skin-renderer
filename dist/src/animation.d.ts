export interface AnimationKeyframe {
    time: number;
    x: number;
    y: number;
    angle: number;
}
export interface AnimationTransform {
    x: number;
    y: number;
    angle: number;
    scale?: number;
}
export type TeeEyeType = 'normal' | 'angry' | 'pain' | 'happy' | 'dead' | 'surprise' | 'blink';
export type TeeAnimationMode = 'idle' | 'inAir' | 'sit' | 'walk' | 'run' | 'custom';
export interface TeeAnimationFrame {
    mode: TeeAnimationMode;
    phase: number;
    body: AnimationTransform;
    backFoot: AnimationTransform;
    frontFoot: AnimationTransform;
    eyes?: TeeEyeType;
}
export interface TeeAnimationInput {
    speed: number;
    inAir: boolean;
    afk: boolean;
    distance: number;
}
export type TeeAnimationEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | readonly [number, number, number, number];
export type TeeAnimationFillMode = 'none' | 'forwards';
export type TeeAnimationPlayState = 'running' | 'paused' | 'finished' | 'stopped';
export type TeeAnimationEndReason = 'completed' | 'stopped' | 'replaced' | 'destroyed' | 'error';
export interface TeeAnimationPoseTransform {
    x?: number;
    y?: number;
    angle?: number;
    scale?: number;
}
export interface TeeAnimationPose {
    body?: TeeAnimationPoseTransform;
    backFoot?: TeeAnimationPoseTransform;
    frontFoot?: TeeAnimationPoseTransform;
    eyes?: TeeEyeType;
}
export interface TeeAnimationTransformKeyframe extends TeeAnimationPoseTransform {
    time: number;
    easing?: TeeAnimationEasing;
}
export interface TeeAnimationEyesKeyframe {
    time: number;
    eyes: TeeEyeType;
}
export interface TeeAnimationTracks {
    body?: readonly TeeAnimationTransformKeyframe[];
    backFoot?: readonly TeeAnimationTransformKeyframe[];
    frontFoot?: readonly TeeAnimationTransformKeyframe[];
    eyes?: readonly TeeAnimationEyesKeyframe[];
}
export interface TeeAnimationContext {
    progress: number;
    elapsedMs: number;
    deltaMs: number;
    iteration: number;
    speed: number;
    inAir: boolean;
    afk: boolean;
}
interface TeeAnimationDefinitionBase {
    name?: string;
    duration: number;
    loop?: boolean;
    fill?: TeeAnimationFillMode;
}
export interface TeeKeyframeAnimationDefinition extends TeeAnimationDefinitionBase {
    kind: 'keyframes';
    easing?: TeeAnimationEasing;
    tracks: TeeAnimationTracks;
}
export interface TeeCallbackAnimationDefinition extends TeeAnimationDefinitionBase {
    kind: 'callback';
    frame: (context: Readonly<TeeAnimationContext>) => TeeAnimationPose;
}
export type TeeAnimationDefinition = TeeKeyframeAnimationDefinition | TeeCallbackAnimationDefinition;
export interface TeeAnimationPlayOptions {
    loop?: boolean;
    fill?: TeeAnimationFillMode;
    playbackRate?: number;
    startAt?: number;
}
export interface TeeAnimationResult {
    reason: TeeAnimationEndReason;
    error?: unknown;
}
export interface TeeAnimationController {
    readonly definition: Readonly<TeeAnimationDefinition>;
    readonly playState: TeeAnimationPlayState;
    readonly currentTime: number;
    readonly progress: number;
    readonly finished: Promise<TeeAnimationResult>;
    pause(): void;
    resume(): void;
    seek(timeMs: number): void;
    stop(): void;
}
export declare const DDNET_TICK_SPEED = 50;
export declare const DDNET_STATIONARY_SPEED: number;
export declare const DDNET_RUN_SPEED: number;
export declare const WALK_CYCLE_DISTANCE = 100;
export declare const RUN_CYCLE_DISTANCE = 200;
/** The original 64-unit DDNet animation coordinates scaled to the 96-unit DOM tee. */
export declare const DOM_ANIMATION_SCALE: number;
export declare function defineAnimation(definition: TeeAnimationDefinition): Readonly<TeeAnimationDefinition>;
export declare class TeeAnimationPlaybackController implements TeeAnimationController {
    readonly definition: Readonly<TeeAnimationDefinition>;
    readonly finished: Promise<TeeAnimationResult>;
    private _playState;
    private _currentTime;
    private _progress;
    private _iteration;
    private _deltaMs;
    private _lastTimestamp;
    private _settled;
    private _released;
    private readonly _loop;
    private readonly _fill;
    private readonly _playbackRate;
    private readonly _onUpdate;
    private readonly _onRelease;
    private _resolveFinished;
    constructor(definition: TeeAnimationDefinition, options?: TeeAnimationPlayOptions, onUpdate?: () => void, onRelease?: (controller: TeeAnimationPlaybackController) => void);
    get playState(): TeeAnimationPlayState;
    get currentTime(): number;
    get progress(): number;
    get iteration(): number;
    get deltaMs(): number;
    get fillMode(): TeeAnimationFillMode;
    pause(): void;
    resume(): void;
    seek(timeMs: number): void;
    stop(): void;
    advance(timestamp: number): void;
    replace(): void;
    destroy(): void;
    fail(error: unknown): void;
    private updateProgress;
    private complete;
    private terminate;
    private settle;
    private release;
}
export declare function evaluateCustomAnimation(definition: TeeAnimationDefinition, context: TeeAnimationContext): TeeAnimationFrame;
export declare function getTeeAnimationMode(speed: number, inAir: boolean, afk: boolean): TeeAnimationMode;
export declare function evaluateTeeAnimation(input: TeeAnimationInput): TeeAnimationFrame;
export {};
