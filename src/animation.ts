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

export type TeeEyeType =
    | 'normal'
    | 'angry'
    | 'pain'
    | 'happy'
    | 'dead'
    | 'surprise'
    | 'blink';

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

export type TeeAnimationEasing =
    | 'linear'
    | 'ease'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | readonly [number, number, number, number];

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

export type TeeAnimationDefinition =
    | TeeKeyframeAnimationDefinition
    | TeeCallbackAnimationDefinition;

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

export const DDNET_TICK_SPEED = 50;
export const DDNET_STATIONARY_SPEED = 1 / 256;
export const DDNET_RUN_SPEED = 5000 / 256;
export const WALK_CYCLE_DISTANCE = 100;
export const RUN_CYCLE_DISTANCE = 200;

/** The original 64-unit DDNet animation coordinates scaled to the 96-unit DOM tee. */
export const DOM_ANIMATION_SCALE = 96 / 64;

const ZERO_TRANSFORM: AnimationTransform = { x: 0, y: 0, angle: 0 };
const NORMALIZED_ANIMATION = Symbol('normalized-tee-animation');
const EYE_TYPES = new Set<TeeEyeType>([
    'normal',
    'angry',
    'pain',
    'happy',
    'dead',
    'surprise',
    'blink',
]);

type NormalizedTransformKeyframe = Required<Omit<TeeAnimationTransformKeyframe, 'easing'>> & {
    easing?: TeeAnimationEasing;
};

type NormalizedAnimationDefinition = TeeAnimationDefinition & {
    readonly [NORMALIZED_ANIMATION]: true;
};

type NormalizedAnimationPose = {
    body: AnimationTransform;
    backFoot: AnimationTransform;
    frontFoot: AnimationTransform;
    eyes?: TeeEyeType;
};

function assertFiniteNumber(value: unknown, path: string): asserts value is number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new TypeError(`${path} must be a finite number`);
    }
}

function normalizeEasing(easing: TeeAnimationEasing | undefined, path: string): TeeAnimationEasing | undefined {
    if (easing === undefined) {
        return undefined;
    }

    if (typeof easing === 'string') {
        if (['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'].includes(easing)) {
            return easing;
        }
        throw new TypeError(`${path} is not a supported easing preset`);
    }

    if (!Array.isArray(easing) || easing.length !== 4) {
        throw new TypeError(`${path} must be an easing preset or four cubic-bezier values`);
    }

    const values = easing.map((value, index) => {
        assertFiniteNumber(value, `${path}[${index}]`);
        return value;
    }) as [number, number, number, number];

    if (values[0] < 0 || values[0] > 1 || values[2] < 0 || values[2] > 1) {
        throw new TypeError(`${path} cubic-bezier x values must be between 0 and 1`);
    }

    return Object.freeze(values);
}

function normalizeTransformKeyframes(
    frames: readonly TeeAnimationTransformKeyframe[] | undefined,
    path: string,
): readonly NormalizedTransformKeyframe[] | undefined {
    if (frames === undefined) {
        return undefined;
    }
    if (!Array.isArray(frames) || frames.length === 0) {
        throw new TypeError(`${path} must contain at least one keyframe`);
    }

    const normalized = frames.map((frame, index): NormalizedTransformKeyframe => {
        if (frame === null || typeof frame !== 'object') {
            throw new TypeError(`${path}[${index}] must be an object`);
        }

        assertFiniteNumber(frame.time, `${path}[${index}].time`);
        if (frame.time < 0 || frame.time > 1) {
            throw new TypeError(`${path}[${index}].time must be between 0 and 1`);
        }

        const result: NormalizedTransformKeyframe = {
            time: frame.time,
            x: frame.x ?? 0,
            y: frame.y ?? 0,
            angle: frame.angle ?? 0,
            scale: frame.scale ?? 1,
        };

        assertFiniteNumber(result.x, `${path}[${index}].x`);
        assertFiniteNumber(result.y, `${path}[${index}].y`);
        assertFiniteNumber(result.angle, `${path}[${index}].angle`);
        assertFiniteNumber(result.scale, `${path}[${index}].scale`);

        const easing = normalizeEasing(frame.easing, `${path}[${index}].easing`);
        if (easing !== undefined) {
            result.easing = easing;
        }

        return Object.freeze(result);
    }).sort((left, right) => left.time - right.time);

    for (let index = 1; index < normalized.length; index++) {
        if (normalized[index - 1].time === normalized[index].time) {
            throw new TypeError(`${path} contains duplicate time ${normalized[index].time}`);
        }
    }

    return Object.freeze(normalized);
}

function normalizeEyesKeyframes(
    frames: readonly TeeAnimationEyesKeyframe[] | undefined,
    path: string,
): readonly TeeAnimationEyesKeyframe[] | undefined {
    if (frames === undefined) {
        return undefined;
    }
    if (!Array.isArray(frames) || frames.length === 0) {
        throw new TypeError(`${path} must contain at least one keyframe`);
    }

    const normalized = frames.map((frame, index) => {
        if (frame === null || typeof frame !== 'object') {
            throw new TypeError(`${path}[${index}] must be an object`);
        }
        assertFiniteNumber(frame.time, `${path}[${index}].time`);
        if (frame.time < 0 || frame.time > 1) {
            throw new TypeError(`${path}[${index}].time must be between 0 and 1`);
        }
        if (!EYE_TYPES.has(frame.eyes)) {
            throw new TypeError(`${path}[${index}].eyes is not a supported tee eye type`);
        }
        return Object.freeze({ time: frame.time, eyes: frame.eyes });
    }).sort((left, right) => left.time - right.time);

    for (let index = 1; index < normalized.length; index++) {
        if (normalized[index - 1].time === normalized[index].time) {
            throw new TypeError(`${path} contains duplicate time ${normalized[index].time}`);
        }
    }

    return Object.freeze(normalized);
}

/**
 * Validates, normalizes and freezes a reusable custom animation definition.
 * Built-in DDNet animations are fixed and are not registered or overridden by this function.
 */
export function defineAnimation(definition: TeeAnimationDefinition): Readonly<TeeAnimationDefinition> {
    if (definition === null || typeof definition !== 'object') {
        throw new TypeError('animation definition must be an object');
    }
    if ((definition as NormalizedAnimationDefinition)[NORMALIZED_ANIMATION] === true) {
        return definition;
    }

    assertFiniteNumber(definition.duration, 'animation.duration');
    if (definition.duration <= 0) {
        throw new TypeError('animation.duration must be greater than zero');
    }
    if (definition.name !== undefined && typeof definition.name !== 'string') {
        throw new TypeError('animation.name must be a string');
    }
    if (definition.loop !== undefined && typeof definition.loop !== 'boolean') {
        throw new TypeError('animation.loop must be a boolean');
    }
    if (definition.fill !== undefined && definition.fill !== 'none' && definition.fill !== 'forwards') {
        throw new TypeError("animation.fill must be 'none' or 'forwards'");
    }

    let normalized: TeeAnimationDefinition;
    if (definition.kind === 'keyframes') {
        if (definition.tracks === null || typeof definition.tracks !== 'object') {
            throw new TypeError('animation.tracks must be an object');
        }
        const tracks: TeeAnimationTracks = {
            body: normalizeTransformKeyframes(definition.tracks.body, 'animation.tracks.body'),
            backFoot: normalizeTransformKeyframes(definition.tracks.backFoot, 'animation.tracks.backFoot'),
            frontFoot: normalizeTransformKeyframes(definition.tracks.frontFoot, 'animation.tracks.frontFoot'),
            eyes: normalizeEyesKeyframes(definition.tracks.eyes, 'animation.tracks.eyes'),
        };
        if (!tracks.body && !tracks.backFoot && !tracks.frontFoot && !tracks.eyes) {
            throw new TypeError('animation.tracks must define at least one track');
        }

        normalized = {
            kind: 'keyframes',
            name: definition.name,
            duration: definition.duration,
            loop: definition.loop ?? false,
            fill: definition.fill ?? 'none',
            easing: normalizeEasing(definition.easing, 'animation.easing') ?? 'linear',
            tracks: Object.freeze(tracks),
        };
    } else if (definition.kind === 'callback') {
        if (typeof definition.frame !== 'function') {
            throw new TypeError('animation.frame must be a function');
        }
        normalized = {
            kind: 'callback',
            name: definition.name,
            duration: definition.duration,
            loop: definition.loop ?? false,
            fill: definition.fill ?? 'none',
            frame: definition.frame,
        };
    } else {
        throw new TypeError("animation.kind must be 'keyframes' or 'callback'");
    }

    Object.defineProperty(normalized, NORMALIZED_ANIMATION, {
        value: true,
        enumerable: false,
    });
    return Object.freeze(normalized);
}

export class TeeAnimationPlaybackController implements TeeAnimationController {
    public readonly definition: Readonly<TeeAnimationDefinition>;
    public readonly finished: Promise<TeeAnimationResult>;

    private _playState: TeeAnimationPlayState = 'running';
    private _currentTime: number;
    private _progress: number = 0;
    private _iteration: number = 0;
    private _deltaMs: number = 0;
    private _lastTimestamp: number | null = null;
    private _settled: boolean = false;
    private _released: boolean = false;
    private readonly _loop: boolean;
    private readonly _fill: TeeAnimationFillMode;
    private readonly _playbackRate: number;
    private readonly _onUpdate: () => void;
    private readonly _onRelease: (controller: TeeAnimationPlaybackController) => void;
    private _resolveFinished!: (result: TeeAnimationResult) => void;

    constructor(
        definition: TeeAnimationDefinition,
        options: TeeAnimationPlayOptions = {},
        onUpdate: () => void = () => undefined,
        onRelease: (controller: TeeAnimationPlaybackController) => void = () => undefined,
    ) {
        this.definition = defineAnimation(definition);

        if (options.loop !== undefined && typeof options.loop !== 'boolean') {
            throw new TypeError('animation playback loop must be a boolean');
        }
        if (options.fill !== undefined && options.fill !== 'none' && options.fill !== 'forwards') {
            throw new TypeError("animation playback fill must be 'none' or 'forwards'");
        }

        this._loop = options.loop ?? this.definition.loop ?? false;
        this._fill = options.fill ?? this.definition.fill ?? 'none';
        this._playbackRate = options.playbackRate ?? 1;
        this._currentTime = options.startAt ?? 0;
        this._onUpdate = onUpdate;
        this._onRelease = onRelease;

        assertFiniteNumber(this._playbackRate, 'animation playbackRate');
        if (this._playbackRate <= 0) {
            throw new TypeError('animation playbackRate must be greater than zero');
        }
        assertFiniteNumber(this._currentTime, 'animation startAt');
        if (this._currentTime < 0) {
            throw new TypeError('animation startAt must be zero or greater');
        }

        if (!this._loop) {
            this._currentTime = Math.min(this._currentTime, this.definition.duration);
        }
        this.updateProgress();
        this.finished = new Promise<TeeAnimationResult>((resolve) => {
            this._resolveFinished = resolve;
        });
    }

    public get playState(): TeeAnimationPlayState {
        return this._playState;
    }

    public get currentTime(): number {
        return this._currentTime;
    }

    public get progress(): number {
        return this._progress;
    }

    public get iteration(): number {
        return this._iteration;
    }

    public get deltaMs(): number {
        return this._deltaMs;
    }

    public get fillMode(): TeeAnimationFillMode {
        return this._fill;
    }

    public pause(): void {
        if (this._playState !== 'running') return;
        this._playState = 'paused';
        this._lastTimestamp = null;
        this._deltaMs = 0;
        this._onUpdate();
    }

    public resume(): void {
        if (this._playState !== 'paused') return;
        this._playState = 'running';
        this._lastTimestamp = null;
        this._deltaMs = 0;
        this._onUpdate();
    }

    public seek(timeMs: number): void {
        if (this._playState === 'stopped' || this._playState === 'finished') return;
        assertFiniteNumber(timeMs, 'animation seek time');
        if (timeMs < 0) {
            throw new TypeError('animation seek time must be zero or greater');
        }

        this._currentTime = this._loop
            ? timeMs
            : Math.min(timeMs, this.definition.duration);
        this._lastTimestamp = null;
        this._deltaMs = 0;
        this.updateProgress();

        if (!this._loop && this._currentTime >= this.definition.duration) {
            this.complete();
        } else {
            this._onUpdate();
        }
    }

    public stop(): void {
        if (this._playState === 'stopped') return;
        this._playState = 'stopped';
        this.settle({ reason: 'stopped' });
        this.release();
    }

    public advance(timestamp: number): void {
        if (this._playState !== 'running') return;

        if (this._lastTimestamp !== null) {
            const rawDelta = Math.max(timestamp - this._lastTimestamp, 0) * this._playbackRate;
            this._deltaMs = Math.min(rawDelta, 100);
            this._currentTime += rawDelta;
        } else {
            this._deltaMs = 0;
        }
        this._lastTimestamp = timestamp;
        this.updateProgress();

        if (!this._loop && this._currentTime >= this.definition.duration) {
            this._currentTime = this.definition.duration;
            this._progress = 1;
            this.complete();
        }
    }

    public replace(): void {
        this.terminate('replaced');
    }

    public destroy(): void {
        this.terminate('destroyed');
    }

    public fail(error: unknown): void {
        this.terminate('error', error);
    }

    private updateProgress(): void {
        const duration = this.definition.duration;
        if (this._loop) {
            this._iteration = Math.floor(this._currentTime / duration);
            this._progress = (this._currentTime % duration) / duration;
        } else {
            this._iteration = 0;
            this._progress = Math.min(this._currentTime / duration, 1);
        }
    }

    private complete(): void {
        if (this._playState === 'finished' || this._playState === 'stopped') return;
        this._playState = 'finished';
        this._lastTimestamp = null;
        this.settle({ reason: 'completed' });
        if (this._fill === 'none') {
            this.release();
        } else {
            this._onUpdate();
        }
    }

    private terminate(reason: Exclude<TeeAnimationEndReason, 'completed' | 'stopped'>, error?: unknown): void {
        if (this._playState === 'stopped') return;
        this._playState = 'stopped';
        this._lastTimestamp = null;
        this.settle(error === undefined ? { reason } : { reason, error });
        this.release();
    }

    private settle(result: TeeAnimationResult): void {
        if (this._settled) return;
        this._settled = true;
        this._resolveFinished(result);
    }

    private release(): void {
        if (this._released) return;
        this._released = true;
        this._onRelease(this);
    }
}

const BASE_ANIMATION = {
    body: [{ time: 0, x: 0, y: -4, angle: 0 }],
    backFoot: [{ time: 0, x: 0, y: 10, angle: 0 }],
    frontFoot: [{ time: 0, x: 0, y: 10, angle: 0 }],
};

const IDLE_ANIMATION = {
    body: [],
    backFoot: [{ time: 0, x: -7, y: 0, angle: 0 }],
    frontFoot: [{ time: 0, x: 7, y: 0, angle: 0 }],
};

const IN_AIR_ANIMATION = {
    body: [],
    backFoot: [{ time: 0, x: -3, y: 0, angle: -0.1 }],
    frontFoot: [{ time: 0, x: 3, y: 0, angle: -0.1 }],
};

const SIT_RIGHT_ANIMATION = {
    body: [{ time: 0, x: 0, y: 3, angle: 0 }],
    backFoot: [{ time: 0, x: 12, y: 0, angle: -0.1 }],
    frontFoot: [{ time: 0, x: 8, y: 0, angle: -0.1 }],
};

const WALK_ANIMATION = {
    body: [
        { time: 0.0, x: 0, y: 0, angle: 0 },
        { time: 0.2, x: 0, y: -1, angle: 0 },
        { time: 0.4, x: 0, y: 0, angle: 0 },
        { time: 0.6, x: 0, y: 0, angle: 0 },
        { time: 0.8, x: 0, y: -1, angle: 0 },
        { time: 1.0, x: 0, y: 0, angle: 0 },
    ],
    backFoot: [
        { time: 0.0, x: 8, y: 0, angle: 0 },
        { time: 0.2, x: -8, y: 0, angle: 0 },
        { time: 0.4, x: -10, y: -4, angle: 0.2 },
        { time: 0.6, x: -8, y: -8, angle: 0.3 },
        { time: 0.8, x: 4, y: -4, angle: -0.2 },
        { time: 1.0, x: 8, y: 0, angle: 0 },
    ],
    frontFoot: [
        { time: 0.0, x: -10, y: -4, angle: 0.2 },
        { time: 0.2, x: -8, y: -8, angle: 0.3 },
        { time: 0.4, x: 4, y: -4, angle: -0.2 },
        { time: 0.6, x: 8, y: 0, angle: 0 },
        { time: 0.8, x: 8, y: 0, angle: 0 },
        { time: 1.0, x: -10, y: -4, angle: 0.2 },
    ],
};

const RUN_LEFT_ANIMATION = {
    body: [
        { time: 0.0, x: 0, y: -1, angle: 0 },
        { time: 0.2, x: 0, y: 0, angle: 0 },
        { time: 0.4, x: 0, y: -1, angle: 0 },
        { time: 0.6, x: 0, y: 0, angle: 0 },
        { time: 0.8, x: 0, y: 0, angle: 0 },
        { time: 1.0, x: 0, y: -1, angle: 0 },
    ],
    backFoot: [
        { time: 0.0, x: 18, y: -8, angle: -0.27 },
        { time: 0.2, x: 6, y: 0, angle: 0 },
        { time: 0.4, x: -7, y: 0, angle: 0 },
        { time: 0.6, x: -13, y: -4.5, angle: 0.05 },
        { time: 0.8, x: 0, y: -8, angle: -0.2 },
        { time: 1.0, x: 18, y: -8, angle: -0.27 },
    ],
    frontFoot: [
        { time: 0.0, x: -11, y: -2.5, angle: 0.05 },
        { time: 0.2, x: -14, y: -5, angle: 0.1 },
        { time: 0.4, x: 11, y: -8, angle: -0.3 },
        { time: 0.6, x: 18, y: -8, angle: -0.27 },
        { time: 0.8, x: 3, y: 0, angle: 0 },
        { time: 1.0, x: -11, y: -2.5, angle: 0.05 },
    ],
};

const RUN_RIGHT_ANIMATION = {
    body: [
        { time: 0.0, x: 0, y: -1, angle: 0 },
        { time: 0.2, x: 0, y: 0, angle: 0 },
        { time: 0.4, x: 0, y: 0, angle: 0 },
        { time: 0.6, x: 0, y: -1, angle: 0 },
        { time: 0.8, x: 0, y: 0, angle: 0 },
        { time: 1.0, x: 0, y: -1, angle: 0 },
    ],
    backFoot: [
        { time: 0.0, x: -18, y: -8, angle: 0.27 },
        { time: 0.2, x: 0, y: -8, angle: 0.2 },
        { time: 0.4, x: 13, y: -4.5, angle: -0.05 },
        { time: 0.6, x: 7, y: 0, angle: 0 },
        { time: 0.8, x: -6, y: 0, angle: 0 },
        { time: 1.0, x: -18, y: -8, angle: 0.27 },
    ],
    frontFoot: [
        { time: 0.0, x: 11, y: -2.5, angle: -0.05 },
        { time: 0.2, x: -3, y: 0, angle: 0 },
        { time: 0.4, x: -18, y: -8, angle: 0.27 },
        { time: 0.6, x: -11, y: -8, angle: 0.3 },
        { time: 0.8, x: 14, y: -5, angle: -0.1 },
        { time: 1.0, x: 11, y: -2.5, angle: -0.05 },
    ],
};

type AnimationDefinition = {
    body: AnimationKeyframe[];
    backFoot: AnimationKeyframe[];
    frontFoot: AnimationKeyframe[];
};

function copyTransform(transform: AnimationTransform): AnimationTransform {
    return transform.scale === undefined
        ? { x: transform.x, y: transform.y, angle: transform.angle }
        : { x: transform.x, y: transform.y, angle: transform.angle, scale: transform.scale };
}

function addTransform(base: AnimationTransform, addition: AnimationTransform): AnimationTransform {
    const result: AnimationTransform = {
        x: base.x + addition.x,
        y: base.y + addition.y,
        angle: base.angle + addition.angle,
    };
    if (base.scale !== undefined || addition.scale !== undefined) {
        result.scale = (base.scale ?? 1) * (addition.scale ?? 1);
    }
    return result;
}

function sampleSequence(frames: AnimationKeyframe[], time: number): AnimationTransform {
    if (frames.length === 0) {
        return copyTransform(ZERO_TRANSFORM);
    }

    if (frames.length === 1 || time <= frames[0].time) {
        return {
            x: frames[0].x,
            y: frames[0].y,
            angle: frames[0].angle,
        };
    }

    const lastFrame = frames[frames.length - 1];
    if (time >= lastFrame.time) {
        return {
            x: lastFrame.x,
            y: lastFrame.y,
            angle: lastFrame.angle,
        };
    }

    for (let index = 1; index < frames.length; index++) {
        const previous = frames[index - 1];
        const next = frames[index];
        if (previous.time <= time && time <= next.time) {
            const blend = (time - previous.time) / (next.time - previous.time);
            return {
                x: previous.x + (next.x - previous.x) * blend,
                y: previous.y + (next.y - previous.y) * blend,
                angle: previous.angle + (next.angle - previous.angle) * blend,
            };
        }
    }

    return copyTransform(ZERO_TRANSFORM);
}

function sampleAnimation(definition: AnimationDefinition, phase: number): {
    body: AnimationTransform;
    backFoot: AnimationTransform;
    frontFoot: AnimationTransform;
} {
    return {
        body: sampleSequence(definition.body, phase),
        backFoot: sampleSequence(definition.backFoot, phase),
        frontFoot: sampleSequence(definition.frontFoot, phase),
    };
}

function positiveModulo(value: number, divisor: number): number {
    return ((value % divisor) + divisor) % divisor;
}

function cubicBezierCoordinate(time: number, first: number, second: number): number {
    const inverse = 1 - time;
    return 3 * inverse * inverse * time * first
        + 3 * inverse * time * time * second
        + time * time * time;
}

function cubicBezierDerivative(time: number, first: number, second: number): number {
    const inverse = 1 - time;
    return 3 * inverse * inverse * first
        + 6 * inverse * time * (second - first)
        + 3 * time * time * (1 - second);
}

function sampleCubicBezier(progress: number, easing: readonly [number, number, number, number]): number {
    const [x1, y1, x2, y2] = easing;
    let parameter = progress;

    for (let iteration = 0; iteration < 8; iteration++) {
        const error = cubicBezierCoordinate(parameter, x1, x2) - progress;
        if (Math.abs(error) < 1e-7) {
            return cubicBezierCoordinate(parameter, y1, y2);
        }
        const derivative = cubicBezierDerivative(parameter, x1, x2);
        if (Math.abs(derivative) < 1e-7) {
            break;
        }
        parameter -= error / derivative;
    }

    let lower = 0;
    let upper = 1;
    parameter = progress;
    for (let iteration = 0; iteration < 20; iteration++) {
        const x = cubicBezierCoordinate(parameter, x1, x2);
        if (Math.abs(x - progress) < 1e-7) {
            break;
        }
        if (x < progress) {
            lower = parameter;
        } else {
            upper = parameter;
        }
        parameter = (lower + upper) / 2;
    }
    return cubicBezierCoordinate(parameter, y1, y2);
}

function applyEasing(progress: number, easing: TeeAnimationEasing): number {
    const clamped = Math.min(Math.max(progress, 0), 1);
    if (easing === 'linear') return clamped;

    const bezier = typeof easing === 'string'
        ? ({
            ease: [0.25, 0.1, 0.25, 1],
            'ease-in': [0.42, 0, 1, 1],
            'ease-out': [0, 0, 0.58, 1],
            'ease-in-out': [0.42, 0, 0.58, 1],
        } as const)[easing]
        : easing;
    return sampleCubicBezier(clamped, bezier);
}

function sampleCustomTransformSequence(
    frames: readonly NormalizedTransformKeyframe[] | undefined,
    time: number,
    defaultEasing: TeeAnimationEasing,
): AnimationTransform {
    if (!frames || frames.length === 0) {
        return copyTransform(ZERO_TRANSFORM);
    }

    const toTransform = (frame: NormalizedTransformKeyframe): AnimationTransform => ({
        x: frame.x,
        y: frame.y,
        angle: frame.angle,
        scale: frame.scale,
    });

    if (frames.length === 1 || time <= frames[0].time) {
        return toTransform(frames[0]);
    }

    const lastFrame = frames[frames.length - 1];
    if (time >= lastFrame.time) {
        return toTransform(lastFrame);
    }

    for (let index = 1; index < frames.length; index++) {
        const previous = frames[index - 1];
        const next = frames[index];
        if (previous.time <= time && time <= next.time) {
            const linearBlend = (time - previous.time) / (next.time - previous.time);
            const blend = applyEasing(linearBlend, previous.easing ?? defaultEasing);
            return {
                x: previous.x + (next.x - previous.x) * blend,
                y: previous.y + (next.y - previous.y) * blend,
                angle: previous.angle + (next.angle - previous.angle) * blend,
                scale: previous.scale + (next.scale - previous.scale) * blend,
            };
        }
    }

    return copyTransform(ZERO_TRANSFORM);
}

function sampleEyesSequence(
    frames: readonly TeeAnimationEyesKeyframe[] | undefined,
    time: number,
): TeeEyeType | undefined {
    if (!frames || frames.length === 0) {
        return undefined;
    }

    let selected = frames[0].eyes;
    for (const frame of frames) {
        if (frame.time > time) break;
        selected = frame.eyes;
    }
    return selected;
}

function normalizePoseTransform(transform: TeeAnimationPoseTransform | undefined, path: string): AnimationTransform {
    if (transform === undefined) {
        return copyTransform(ZERO_TRANSFORM);
    }
    if (transform === null || typeof transform !== 'object') {
        throw new TypeError(`${path} must be an object`);
    }

    const result: AnimationTransform = {
        x: transform.x ?? 0,
        y: transform.y ?? 0,
        angle: transform.angle ?? 0,
        scale: transform.scale ?? 1,
    };
    assertFiniteNumber(result.x, `${path}.x`);
    assertFiniteNumber(result.y, `${path}.y`);
    assertFiniteNumber(result.angle, `${path}.angle`);
    assertFiniteNumber(result.scale, `${path}.scale`);
    return result;
}

function normalizeCallbackPose(pose: TeeAnimationPose): NormalizedAnimationPose {
    if (pose === null || typeof pose !== 'object') {
        throw new TypeError('animation callback must return a pose object');
    }
    if (pose.eyes !== undefined && !EYE_TYPES.has(pose.eyes)) {
        throw new TypeError('animation callback returned an unsupported eye type');
    }

    return {
        body: normalizePoseTransform(pose.body, 'animation callback body'),
        backFoot: normalizePoseTransform(pose.backFoot, 'animation callback backFoot'),
        frontFoot: normalizePoseTransform(pose.frontFoot, 'animation callback frontFoot'),
        eyes: pose.eyes,
    };
}

export function evaluateCustomAnimation(
    definition: TeeAnimationDefinition,
    context: TeeAnimationContext,
): TeeAnimationFrame {
    const normalized = defineAnimation(definition) as NormalizedAnimationDefinition;
    const progress = Math.min(Math.max(context.progress, 0), 1);
    let pose: NormalizedAnimationPose;

    if (normalized.kind === 'keyframes') {
        const tracks = normalized.tracks;
        const easing = normalized.easing ?? 'linear';
        pose = {
            body: sampleCustomTransformSequence(
                tracks.body as readonly NormalizedTransformKeyframe[] | undefined,
                progress,
                easing,
            ),
            backFoot: sampleCustomTransformSequence(
                tracks.backFoot as readonly NormalizedTransformKeyframe[] | undefined,
                progress,
                easing,
            ),
            frontFoot: sampleCustomTransformSequence(
                tracks.frontFoot as readonly NormalizedTransformKeyframe[] | undefined,
                progress,
                easing,
            ),
            eyes: sampleEyesSequence(tracks.eyes, progress),
        };
    } else {
        pose = normalizeCallbackPose(normalized.frame(Object.freeze({ ...context, progress })));
    }

    const base = sampleAnimation(BASE_ANIMATION, 0);
    return {
        mode: 'custom',
        phase: progress,
        body: addTransform(base.body, pose.body),
        backFoot: addTransform(base.backFoot, pose.backFoot),
        frontFoot: addTransform(base.frontFoot, pose.frontFoot),
        eyes: pose.eyes,
    };
}

export function getTeeAnimationMode(speed: number, inAir: boolean, afk: boolean): TeeAnimationMode {
    const normalizedSpeed = Number.isFinite(speed) ? speed : 0;

    if (inAir) {
        return 'inAir';
    }

    if (Math.abs(normalizedSpeed) <= DDNET_STATIONARY_SPEED) {
        return afk ? 'sit' : 'idle';
    }

    return Math.abs(normalizedSpeed) >= DDNET_RUN_SPEED ? 'run' : 'walk';
}

export function evaluateTeeAnimation(input: TeeAnimationInput): TeeAnimationFrame {
    const speed = Number.isFinite(input.speed) ? input.speed : 0;
    const mode = getTeeAnimationMode(speed, input.inAir, input.afk);

    let phase = 0;
    let definition: AnimationDefinition = IDLE_ANIMATION;

    if (mode === 'inAir') {
        definition = IN_AIR_ANIMATION;
    } else if (mode === 'sit') {
        definition = SIT_RIGHT_ANIMATION;
    } else if (mode === 'walk') {
        definition = WALK_ANIMATION;
        phase = positiveModulo(input.distance, WALK_CYCLE_DISTANCE) / WALK_CYCLE_DISTANCE;
    } else if (mode === 'run') {
        definition = speed < 0 ? RUN_LEFT_ANIMATION : RUN_RIGHT_ANIMATION;
        phase = positiveModulo(input.distance, RUN_CYCLE_DISTANCE) / RUN_CYCLE_DISTANCE;
    }

    const base = sampleAnimation(BASE_ANIMATION, 0);
    const addition = sampleAnimation(definition, phase);

    return {
        mode,
        phase,
        body: addTransform(base.body, addition.body),
        backFoot: addTransform(base.backFoot, addition.backFoot),
        frontFoot: addTransform(base.frontFoot, addition.frontFoot),
    };
}
