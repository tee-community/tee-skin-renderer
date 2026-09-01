export type ColorTee = number;
export type ColorHsl = [number, number, number];
export type ColorRgba = [number, number, number, number];
export declare function convertTeeColorToHsl(value: ColorTee): ColorHsl;
export declare function convertTeeColorToRgba(value: ColorTee): ColorRgba;
/**
 * Compute the most common non-zero greyscale value in a region of image data.
 * Matches DDNet's OrgWeight calculation from skins.cpp.
 */
export declare function computeOrgWeight(data: Uint8ClampedArray, width: number, region: {
    x: number;
    y: number;
    w: number;
    h: number;
}): number;
/**
 * Remap a greyscale value using DDNet's algorithm.
 * Values <= orgWeight map to 0..newWeight, values > orgWeight map to newWeight..255.
 */
export declare function remapGreyscale(value: number, orgWeight: number, newWeight?: number): number;
export declare function convertHslToRgba(hsl: ColorHsl, a?: number): ColorRgba;
