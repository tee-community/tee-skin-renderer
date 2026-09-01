import { describe, expect, test } from 'bun:test';
import {
    DDNET_RUN_SPEED,
    DDNET_STATIONARY_SPEED,
    TeeAnimationPlaybackController,
    defineAnimation,
    evaluateCustomAnimation,
    evaluateTeeAnimation,
    getTeeAnimationMode,
} from '../src/animation';

describe('DDNet tee animation evaluator', () => {
    test('selects idle, walk, run, in-air and AFK modes at DDNet thresholds', () => {
        expect(getTeeAnimationMode(0, false, false)).toBe('idle');
        expect(getTeeAnimationMode(DDNET_STATIONARY_SPEED, false, false)).toBe('idle');
        expect(getTeeAnimationMode(DDNET_STATIONARY_SPEED * 2, false, false)).toBe('walk');
        expect(getTeeAnimationMode(DDNET_RUN_SPEED - 0.01, false, false)).toBe('walk');
        expect(getTeeAnimationMode(DDNET_RUN_SPEED, false, false)).toBe('run');
        expect(getTeeAnimationMode(DDNET_RUN_SPEED, true, false)).toBe('inAir');
        expect(getTeeAnimationMode(0, false, true)).toBe('sit');
        expect(getTeeAnimationMode(DDNET_RUN_SPEED, false, true)).toBe('run');
    });

    test('composes the base and idle animations', () => {
        const frame = evaluateTeeAnimation({
            speed: 0,
            inAir: false,
            afk: false,
            distance: 0,
        });

        expect(frame.mode).toBe('idle');
        expect(frame.body).toEqual({ x: 0, y: -4, angle: 0 });
        expect(frame.backFoot).toEqual({ x: -7, y: 10, angle: 0 });
        expect(frame.frontFoot).toEqual({ x: 7, y: 10, angle: 0 });
    });

    test('interpolates walk keyframes', () => {
        const frame = evaluateTeeAnimation({
            speed: 10,
            inAir: false,
            afk: false,
            distance: 20,
        });

        expect(frame.mode).toBe('walk');
        expect(frame.phase).toBeCloseTo(0.2);
        expect(frame.body).toEqual({ x: 0, y: -5, angle: 0 });
        expect(frame.backFoot).toEqual({ x: -8, y: 10, angle: 0 });
        expect(frame.frontFoot).toEqual({ x: -8, y: 2, angle: 0.3 });
    });

    test('plays the walk cycle backwards for negative speed', () => {
        const frame = evaluateTeeAnimation({
            speed: -10,
            inAir: false,
            afk: false,
            distance: -20,
        });

        expect(frame.mode).toBe('walk');
        expect(frame.phase).toBeCloseTo(0.8);
        expect(frame.backFoot).toEqual({ x: 4, y: 6, angle: -0.2 });
        expect(frame.frontFoot).toEqual({ x: 8, y: 10, angle: 0 });
    });

    test('uses forward and reverse run animations and keeps the phase wrapped', () => {
        const right = evaluateTeeAnimation({
            speed: DDNET_RUN_SPEED,
            inAir: false,
            afk: false,
            distance: 0,
        });
        const left = evaluateTeeAnimation({
            speed: -DDNET_RUN_SPEED,
            inAir: false,
            afk: false,
            distance: 0,
        });
        const wrapped = evaluateTeeAnimation({
            speed: DDNET_RUN_SPEED,
            inAir: false,
            afk: false,
            distance: 400,
        });

        expect(right.backFoot).toEqual({ x: -18, y: 2, angle: 0.27 });
        expect(left.backFoot).toEqual({ x: 18, y: 2, angle: -0.27 });
        expect(wrapped.phase).toBeCloseTo(0);
        expect(wrapped.backFoot).toEqual(right.backFoot);
    });

    test('uses the static in-air and sit-right poses', () => {
        const inAir = evaluateTeeAnimation({
            speed: DDNET_RUN_SPEED,
            inAir: true,
            afk: false,
            distance: 50,
        });
        const sit = evaluateTeeAnimation({
            speed: 0,
            inAir: false,
            afk: true,
            distance: 50,
        });

        expect(inAir.mode).toBe('inAir');
        expect(inAir.backFoot).toEqual({ x: -3, y: 10, angle: -0.1 });
        expect(inAir.frontFoot).toEqual({ x: 3, y: 10, angle: -0.1 });
        expect(sit.mode).toBe('sit');
        expect(sit.body).toEqual({ x: 0, y: -1, angle: 0 });
        expect(sit.backFoot).toEqual({ x: 12, y: 10, angle: -0.1 });
        expect(sit.frontFoot).toEqual({ x: 8, y: 10, angle: -0.1 });
    });
});

describe('custom tee animation definitions', () => {
    test('normalizes, freezes and interpolates keyframe tracks', () => {
        const definition = defineAnimation({
            kind: 'keyframes',
            duration: 800,
            easing: [0, 0, 1, 1],
            tracks: {
                body: [
                    { time: 1, y: 0, scale: 1 },
                    { time: 0, y: 0, scale: 1 },
                    { time: 0.5, y: -8, scale: 1.5 },
                ],
                eyes: [
                    { time: 0, eyes: 'normal' },
                    { time: 0.5, eyes: 'happy' },
                ],
            },
        });

        const frame = evaluateCustomAnimation(definition, {
            progress: 0.5,
            elapsedMs: 400,
            deltaMs: 16,
            iteration: 0,
            speed: 0,
            inAir: false,
            afk: false,
        });

        expect(Object.isFrozen(definition)).toBe(true);
        expect(frame.mode).toBe('custom');
        expect(frame.phase).toBe(0.5);
        expect(frame.body).toEqual({ x: 0, y: -12, angle: 0, scale: 1.5 });
        expect(frame.backFoot).toEqual({ x: 0, y: 10, angle: 0 });
        expect(frame.eyes).toBe('happy');
    });

    test('supports procedural callback poses and exposes playback context', () => {
        const contexts: number[] = [];
        const definition = defineAnimation({
            kind: 'callback',
            duration: 1000,
            frame: (context) => {
                contexts.push(context.speed);
                return {
                    body: { y: Math.sin(context.progress * Math.PI) * -6 },
                    backFoot: { x: -5 },
                    frontFoot: { x: 5 },
                    eyes: context.progress >= 0.5 ? 'surprise' : 'normal',
                };
            },
        });

        const frame = evaluateCustomAnimation(definition, {
            progress: 0.5,
            elapsedMs: 500,
            deltaMs: 20,
            iteration: 0,
            speed: 12,
            inAir: true,
            afk: false,
        });

        expect(contexts).toEqual([12]);
        expect(frame.body).toEqual({ x: 0, y: -10, angle: 0, scale: 1 });
        expect(frame.backFoot).toEqual({ x: -5, y: 10, angle: 0, scale: 1 });
        expect(frame.frontFoot).toEqual({ x: 5, y: 10, angle: 0, scale: 1 });
        expect(frame.eyes).toBe('surprise');
    });

    test('rejects invalid definitions and callback output', () => {
        expect(() => defineAnimation({
            kind: 'keyframes',
            duration: 0,
            tracks: { body: [{ time: 0 }] },
        })).toThrow('animation.duration must be greater than zero');

        expect(() => defineAnimation({
            kind: 'keyframes',
            duration: 100,
            tracks: {
                body: [
                    { time: 0 },
                    { time: 0 },
                ],
            },
        })).toThrow('duplicate time');

        const invalidCallback = defineAnimation({
            kind: 'callback',
            duration: 100,
            frame: () => ({ body: { x: Number.NaN } }),
        });
        expect(() => evaluateCustomAnimation(invalidCallback, {
            progress: 0,
            elapsedMs: 0,
            deltaMs: 0,
            iteration: 0,
            speed: 0,
            inAir: false,
            afk: false,
        })).toThrow('animation callback body.x must be a finite number');
    });

    test('controls timeline playback, looping, pause, resume and seek', () => {
        let updates = 0;
        const controller = new TeeAnimationPlaybackController({
            kind: 'keyframes',
            duration: 1000,
            loop: true,
            tracks: { body: [{ time: 0 }, { time: 1, y: -4 }] },
        }, { startAt: 200 }, () => updates++);

        controller.advance(100);
        controller.advance(600);
        expect(controller.currentTime).toBe(700);
        expect(controller.progress).toBeCloseTo(0.7);

        controller.pause();
        controller.advance(900);
        expect(controller.currentTime).toBe(700);

        controller.seek(1400);
        expect(controller.progress).toBeCloseTo(0.4);
        expect(controller.iteration).toBe(1);

        controller.resume();
        controller.advance(1000);
        controller.advance(1100);
        expect(controller.currentTime).toBe(1500);
        expect(controller.progress).toBeCloseTo(0.5);
        expect(updates).toBe(3);
    });

    test('resolves completion and respects fill mode', async () => {
        let releases = 0;
        const definition = {
            kind: 'keyframes' as const,
            duration: 100,
            tracks: { body: [{ time: 0 }, { time: 1, y: -2 }] },
        };
        const reset = new TeeAnimationPlaybackController(
            definition,
            { fill: 'none' },
            undefined,
            () => releases++,
        );
        reset.advance(0);
        reset.advance(100);

        expect(reset.playState).toBe('finished');
        expect(await reset.finished).toEqual({ reason: 'completed' });
        expect(releases).toBe(1);

        const held = new TeeAnimationPlaybackController(
            definition,
            { fill: 'forwards' },
            undefined,
            () => releases++,
        );
        held.advance(0);
        held.advance(100);
        expect(held.playState).toBe('finished');
        expect(releases).toBe(1);

        held.stop();
        expect(held.playState).toBe('stopped');
        expect(releases).toBe(2);
        expect(await held.finished).toEqual({ reason: 'completed' });
    });

    test('settles replaced and failed playback without rejecting', async () => {
        const definition = {
            kind: 'callback' as const,
            duration: 100,
            frame: () => ({}),
        };
        const replaced = new TeeAnimationPlaybackController(definition);
        replaced.replace();
        expect(await replaced.finished).toEqual({ reason: 'replaced' });

        const error = new Error('frame failed');
        const failed = new TeeAnimationPlaybackController(definition);
        failed.fail(error);
        expect(await failed.finished).toEqual({ reason: 'error', error });
    });

    test('validates playback options and resolves explicit termination reasons', async () => {
        const definition = {
            kind: 'callback' as const,
            duration: 100,
            frame: () => ({}),
        };

        expect(() => new TeeAnimationPlaybackController(definition, {
            playbackRate: 0,
        })).toThrow('animation playbackRate must be greater than zero');
        expect(() => new TeeAnimationPlaybackController(definition, {
            loop: 'yes' as unknown as boolean,
        })).toThrow('animation playback loop must be a boolean');
        expect(() => new TeeAnimationPlaybackController(definition, {
            fill: 'backwards' as 'none',
        })).toThrow("animation playback fill must be 'none' or 'forwards'");

        const stopped = new TeeAnimationPlaybackController(definition);
        stopped.stop();
        expect(await stopped.finished).toEqual({ reason: 'stopped' });

        const destroyed = new TeeAnimationPlaybackController(definition);
        destroyed.destroy();
        expect(await destroyed.finished).toEqual({ reason: 'destroyed' });
    });
});
