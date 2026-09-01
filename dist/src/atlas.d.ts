/**
 * Teeworlds skin sprite atlas layout (256x128 texture).
 * All coordinates are in atlas-relative units (em) where 1em = 1px at base scale.
 * The atlas is divided into an 8x4 grid of 32x32 cells.
 */
export interface SpriteRegion {
    x: number;
    y: number;
    w: number;
    h: number;
}
/** Atlas dimensions */
export declare const ATLAS_WIDTH = 256;
export declare const ATLAS_HEIGHT = 128;
/** Grid cell size */
export declare const GRID_CELL = 32;
/** Body sprites (96x96, top-left quadrant) */
export declare const SPRITE_BODY: SpriteRegion;
export declare const SPRITE_BODY_OUTLINE: SpriteRegion;
/** Hand sprites (32x32) */
export declare const SPRITE_HAND: SpriteRegion;
export declare const SPRITE_HAND_OUTLINE: SpriteRegion;
/** Hand scale: 93.75% of body */
export declare const HAND_SCALE = 0.9375;
/** Eye sprites (32x32, bottom row) */
export declare const SPRITE_EYE_NORMAL: SpriteRegion;
export declare const SPRITE_EYE_ANGRY: SpriteRegion;
export declare const SPRITE_EYE_PAIN: SpriteRegion;
export declare const SPRITE_EYE_HAPPY: SpriteRegion;
export declare const SPRITE_EYE_DEAD: SpriteRegion;
export declare const SPRITE_EYE_SURPRISE: SpriteRegion;
/** Foot sprites (64x32) */
export declare const SPRITE_FOOT: SpriteRegion;
export declare const SPRITE_FOOT_OUTLINE: SpriteRegion;
/** Foot region in atlas used for color separation */
export declare const FOOT_COLOR_REGION: {
    xStart: number;
    xEnd: number;
    yStart: number;
    yEnd: number;
};
/** Body region in atlas used for OrgWeight calculation */
export declare const BODY_COLOR_REGION: {
    xStart: number;
    xEnd: number;
    yStart: number;
    yEnd: number;
};
/** Rendering constants matching DDNet */
export declare const TEE_BASE_SIZE = 96;
export declare const EYE_SCALE = 1.2;
export declare const EYE_SEPARATION = 7.2;
export declare const FOOT_SCALE_X = 1.5;
export declare const FOOT_SCALE_Y = 1.5;
export declare const FOOT_OFFSET_X = 10.5;
export declare const FOOT_OFFSET_Y = 15;
export declare const BODY_OFFSET_Y = -6;
export declare const FAT_BODY_SCALE = 1.3;
