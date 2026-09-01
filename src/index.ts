import { initializeAsync, createAsync } from './tee';
import * as renderer from './tee';
import * as color from './color';
import * as helpers from './helpers';
import * as atlas from './atlas';
import { defineAnimation } from './animation';
import './tee.css';

const animation = Object.freeze({
    define: defineAnimation,
});

helpers.domReady(() => {
    renderer.initializeAsync();
});

export {
    renderer,
    color,
    helpers,
    atlas,
    animation,
    defineAnimation,
    initializeAsync as init,
    createAsync as createAsync,
}

export type {
    TeeCallbackAnimationDefinition,
    TeeAnimationContext,
    TeeAnimationController,
    TeeAnimationDefinition,
    TeeAnimationEasing,
    TeeAnimationEndReason,
    TeeAnimationEyesKeyframe,
    TeeAnimationFillMode,
    TeeAnimationPlayOptions,
    TeeAnimationPlayState,
    TeeAnimationPose,
    TeeAnimationPoseTransform,
    TeeAnimationResult,
    TeeAnimationTracks,
    TeeAnimationTransformKeyframe,
    TeeEyeType,
    TeeKeyframeAnimationDefinition,
} from './animation';
