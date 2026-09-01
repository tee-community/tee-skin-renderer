import { afterEach, expect, test } from 'bun:test';
import { TeeRenderer } from '../src/tee';

const originalImage = globalThis.Image;
const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

afterEach(() => {
    if (originalImage === undefined) {
        delete (globalThis as { Image?: typeof Image }).Image;
    } else {
        globalThis.Image = originalImage;
    }

    if (originalRequestAnimationFrame === undefined) {
        delete (globalThis as { requestAnimationFrame?: typeof requestAnimationFrame }).requestAnimationFrame;
    } else {
        globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    }

    if (originalCancelAnimationFrame === undefined) {
        delete (globalThis as { cancelAnimationFrame?: typeof cancelAnimationFrame }).cancelAnimationFrame;
    } else {
        globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
    }
});

function createContainerStub() {
    const eventTarget = new EventTarget();
    const properties = new Map<string, string>();

    return {
        dataset: {},
        classList: {
            add: () => undefined,
            remove: () => undefined,
            toggle: () => false,
        },
        style: {
            setProperty: (name: string, value: string) => properties.set(name, value),
            removeProperty: (name: string) => properties.delete(name),
        },
        addEventListener: eventTarget.addEventListener.bind(eventTarget),
        removeEventListener: eventTarget.removeEventListener.bind(eventTarget),
        dispatchEvent: eventTarget.dispatchEvent.bind(eventTarget),
    };
}

test('advances built-in walk distance across consecutive animation frames', () => {
    class PendingImage {
        public crossOrigin: string = '';
        public src: string = '';

        public addEventListener(): void {}
        public remove(): void {}
    }

    let nextFrameId = 1;
    const callbacks = new Map<number, FrameRequestCallback>();
    (globalThis as { Image: typeof Image }).Image = PendingImage as unknown as typeof Image;
    globalThis.requestAnimationFrame = (callback) => {
        const id = nextFrameId++;
        callbacks.set(id, callback);
        return id;
    };
    globalThis.cancelAnimationFrame = (id) => {
        callbacks.delete(id);
    };

    const runNextFrame = (timestamp: number) => {
        const next = callbacks.entries().next().value as [number, FrameRequestCallback] | undefined;
        expect(next).toBeDefined();
        callbacks.delete(next![0]);
        next![1](timestamp);
    };

    const renderer = new TeeRenderer(createContainerStub() as never, {
        skinUrl: 'skin.png',
        speed: 10,
    });

    runNextFrame(100);
    runNextFrame(116);

    expect((renderer as unknown as { _animationDistance: number })._animationDistance).toBeCloseTo(8);
    renderer.destroy();
});
