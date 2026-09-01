import {
    animation,
    createAsync,
    defineAnimation,
    type TeeAnimationContext,
    type TeeAnimationController,
    type TeeAnimationDefinition,
    type TeeAnimationResult,
} from 'tee-skin-renderer';

const keyframes = defineAnimation({
    kind: 'keyframes',
    duration: 800,
    tracks: {
        body: [
            { time: 0, y: 0 },
            { time: 1, y: -8, easing: [0.42, 0, 0.58, 1] },
        ],
        eyes: [
            { time: 0, eyes: 'normal' },
            { time: 1, eyes: 'happy' },
        ],
    },
});

const callback: Readonly<TeeAnimationDefinition> = animation.define({
    kind: 'callback',
    duration: 1000,
    frame(context: Readonly<TeeAnimationContext>) {
        return {
            body: { angle: context.progress, scale: 1 },
            eyes: context.inAir ? 'surprise' : 'normal',
        };
    },
});

async function consumePublicAnimationApi(): Promise<TeeAnimationResult> {
    const container = await createAsync({ skinUrl: 'https://ddstats.tw/skins/default.png' });
    const controller: TeeAnimationController = container.tee.playAnimation(keyframes, {
        fill: 'forwards',
        playbackRate: 1.5,
        startAt: 200,
    });

    controller.pause();
    controller.seek(400);
    controller.resume();
    container.tee.playAnimation(callback);
    container.tee.stopAnimation();

    return controller.finished;
}

void consumePublicAnimationApi;
