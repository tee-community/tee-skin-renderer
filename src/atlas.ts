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
export const ATLAS_WIDTH = 256;
export const ATLAS_HEIGHT = 128;

/** Grid cell size */
export const GRID_CELL = 32;

/** Body sprites (96x96, top-left quadrant) */
export const SPRITE_BODY: SpriteRegion = { x: 0, y: 0, w: 96, h: 96 };
export const SPRITE_BODY_OUTLINE: SpriteRegion = { x: 96, y: 0, w: 96, h: 96 };

/** Hand sprites (32x32) */
export const SPRITE_HAND: SpriteRegion = { x: 192, y: 0, w: 32, h: 32 };
export const SPRITE_HAND_OUTLINE: SpriteRegion = { x: 224, y: 0, w: 32, h: 32 };

/** Hand scale: 93.75% of body */
export const HAND_SCALE = 0.9375;

/** Eye sprites (32x32, bottom row) */
export const SPRITE_EYE_NORMAL: SpriteRegion = { x: 64, y: 96, w: 32, h: 32 };
export const SPRITE_EYE_ANGRY: SpriteRegion = { x: 96, y: 96, w: 32, h: 32 };
export const SPRITE_EYE_PAIN: SpriteRegion = { x: 128, y: 96, w: 32, h: 32 };
export const SPRITE_EYE_HAPPY: SpriteRegion = { x: 160, y: 96, w: 32, h: 32 };
export const SPRITE_EYE_DEAD: SpriteRegion = { x: 192, y: 96, w: 32, h: 32 };
export const SPRITE_EYE_SURPRISE: SpriteRegion = { x: 224, y: 96, w: 32, h: 32 };

/** Foot sprites (64x32) */
export const SPRITE_FOOT: SpriteRegion = { x: 192, y: 32, w: 64, h: 32 };
export const SPRITE_FOOT_OUTLINE: SpriteRegion = { x: 192, y: 64, w: 64, h: 32 };

/** Foot region in atlas used for color separation */
export const FOOT_COLOR_REGION = {
    xStart: 6 / 8,
    xEnd: 1,
    yStart: 1 / 4,
    yEnd: 3 / 4,
};

/** Body region in atlas used for OrgWeight calculation */
export const BODY_COLOR_REGION = {
    xStart: 0,
    xEnd: 3 / 8,
    yStart: 0,
    yEnd: 1 / 4,
};

/** Rendering constants matching DDNet */
export const TEE_BASE_SIZE = 96;
export const EYE_SCALE = 1.2;
export const EYE_SEPARATION = 7.2;
export const FOOT_SCALE_X = 1.5;
export const FOOT_SCALE_Y = 1.5;
export const FOOT_OFFSET_X = 10.5;
export const FOOT_OFFSET_Y = 15;
export const BODY_OFFSET_Y = -6;
export const FAT_BODY_SCALE = 1.3;
