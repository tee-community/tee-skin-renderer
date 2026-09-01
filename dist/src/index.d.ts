import { initializeAsync, createAsync } from './tee';
import { defineAnimation } from './animation';
import * as renderer from './tee';
import * as color from './color';
import * as helpers from './helpers';
import * as atlas from './atlas';
declare const animation: Readonly<{
    define: typeof defineAnimation;
}>;
export { renderer, color, helpers, atlas, animation, defineAnimation, initializeAsync as init, createAsync as createAsync, };
export type { TeeCallbackAnimationDefinition, TeeAnimationContext, TeeAnimationController, TeeAnimationDefinition, TeeAnimationEasing, TeeAnimationEndReason, TeeAnimationEyesKeyframe, TeeAnimationFillMode, TeeAnimationPlayOptions, TeeAnimationPlayState, TeeAnimationPose, TeeAnimationPoseTransform, TeeAnimationResult, TeeAnimationTracks, TeeAnimationTransformKeyframe, TeeEyeType, TeeKeyframeAnimationDefinition, } from './animation';
