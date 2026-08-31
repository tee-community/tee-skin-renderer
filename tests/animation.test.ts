import { describe, expect, test } from 'bun:test';
import {
    DDNET_RUN_SPEED,
    DDNET_STATIONARY_SPEED,
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
