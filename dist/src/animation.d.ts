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
/** A transform offset relative to the neutral 64-unit DDNet tee pose. */
export interface TeeAnimationPoseTransform {
    /** Horizontal offset in DDNet tee coordinates. */
    x?: number;
    /** Vertical offset in DDNet tee coordinates. */
    y?: number;
    /** Rotation in turns, where 0.25 is 90 degrees. */
    angle?: number;
    /** Size multiplier, where 1 keeps the original size. */
    scale?: number;
}
/** The complete custom pose returned by keyframe tracks or a callback. */
export interface TeeAnimationPose {
    body?: TeeAnimationPoseTransform;
    backFoot?: TeeAnimationPoseTransform;
    frontFoot?: TeeAnimationPoseTransform;
    eyes?: TeeEyeType;
}
export interface TeeAnimationTransformKeyframe extends TeeAnimationPoseTransform {
    /** Normalized position in one iteration, from 0 to 1. */
    time: number;
    /** Easing used from this keyframe to the next one. */
    easing?: TeeAnimationEasing;
}
export interface TeeAnimationEyesKeyframe {
    /** Normalized position in one iteration, from 0 to 1. */
    time: number;
    eyes: TeeEyeType;
}
/** Independent body, foot and discrete eye tracks for a keyframe animation. */
export interface TeeAnimationTracks {
    body?: readonly TeeAnimationTransformKeyframe[];
    backFoot?: readonly TeeAnimationTransformKeyframe[];
    frontFoot?: readonly TeeAnimationTransformKeyframe[];
    eyes?: readonly TeeAnimationEyesKeyframe[];
}
/** Read-only timing and renderer state supplied to a procedural animation. */
export interface TeeAnimationContext {
    /** Current iteration progress from 0 to 1. */
    progress: number;
    /** Total playback position in milliseconds, including completed iterations. */
    elapsedMs: number;
    /** Playback-adjusted frame delta in milliseconds, capped at 100. */
    deltaMs: number;
    /** Zero-based loop iteration. */
    iteration: number;
    /** Current signed horizontal speed in DDNet world units per tick. */
    speed: number;
    /** Whether the renderer is currently using the jump/fall state. */
    inAir: boolean;
    /** Whether the renderer is currently marked as AFK. */
    afk: boolean;
}
interface TeeAnimationDefinitionBase {
    /** Optional label for debugging or application UI; it does not register the animation. */
    name?: string;
    /** Duration of one iteration in milliseconds. */
    duration: number;
    /** Whether the animation repeats until stopped. Defaults to false. */
    loop?: boolean;
    /** Whether completion restores the DDNet pose or holds the final custom pose. */
    fill?: TeeAnimationFillMode;
}
/** A reusable custom animation sampled from normalized keyframe tracks. */
export interface TeeKeyframeAnimationDefinition extends TeeAnimationDefinitionBase {
    kind: 'keyframes';
    /** Default interpolation easing for transform tracks. */
    easing?: TeeAnimationEasing;
    tracks: TeeAnimationTracks;
}
/** A reusable custom animation that calculates a pose for every rendered frame. */
export interface TeeCallbackAnimationDefinition extends TeeAnimationDefinitionBase {
    kind: 'callback';
    frame: (context: Readonly<TeeAnimationContext>) => TeeAnimationPose;
}
export type TeeAnimationDefinition = TeeKeyframeAnimationDefinition | TeeCallbackAnimationDefinition;
/** Overrides applied to one playback without changing its reusable definition. */
export interface TeeAnimationPlayOptions {
    loop?: boolean;
    fill?: TeeAnimationFillMode;
    /** Positive timeline speed multiplier. Defaults to 1. */
    playbackRate?: number;
    /** Initial absolute timeline position in milliseconds. Defaults to 0. */
    startAt?: number;
}
/** The terminal result of custom animation playback. The finished promise never rejects. */
export interface TeeAnimationResult {
    reason: TeeAnimationEndReason;
    /** Callback or pose validation error when reason is `error`. */
    error?: unknown;
}
/** Controls one custom animation playback started by `TeeRenderer.playAnimation()`. */
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
/**
 * Validates, normalizes and freezes a reusable custom animation definition.
 * Built-in DDNet animations are fixed and are not registered or overridden by this function.
 */
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
