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
}

export type TeeAnimationMode = 'idle' | 'inAir' | 'sit' | 'walk' | 'run';

export interface TeeAnimationFrame {
    mode: TeeAnimationMode;
    phase: number;
    body: AnimationTransform;
    backFoot: AnimationTransform;
    frontFoot: AnimationTransform;
}

export interface TeeAnimationInput {
    speed: number;
    inAir: boolean;
    afk: boolean;
    distance: number;
}

export const DDNET_TICK_SPEED = 50;
export const DDNET_STATIONARY_SPEED = 1 / 256;
export const DDNET_RUN_SPEED = 5000 / 256;
export const WALK_CYCLE_DISTANCE = 100;
export const RUN_CYCLE_DISTANCE = 200;

/** The original 64-unit DDNet animation coordinates scaled to the 96-unit DOM tee. */
export const DOM_ANIMATION_SCALE = 96 / 64;

const ZERO_TRANSFORM: AnimationTransform = { x: 0, y: 0, angle: 0 };

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
    return { ...transform };
}

function addTransform(base: AnimationTransform, addition: AnimationTransform): AnimationTransform {
    return {
        x: base.x + addition.x,
        y: base.y + addition.y,
        angle: base.angle + addition.angle,
    };
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
