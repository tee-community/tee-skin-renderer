export type ColorTee = number;
export type ColorHsl = [number, number, number];
export type ColorRgba = [number, number, number, number];

export function convertTeeColorToHsl(
    value: ColorTee,
): ColorHsl {
    return ([
        (((value >> 16) & 0xff) * 360) / 0xff,
        (((value >> 8) & 0xff) * 100) / 0xff,
        ((((value & 0xff)) / 2 + 128) * 100) / 0xff,
    ]);
}

export function convertTeeColorToRgba(
    value: ColorTee,
): ColorRgba {
    return convertHslToRgba(convertTeeColorToHsl(value));
}

/**
 * Compute the most common non-zero greyscale value in a region of image data.
 * Matches DDNet's OrgWeight calculation from skins.cpp.
 */
export function computeOrgWeight(
    data: Uint8ClampedArray,
    width: number,
    region: { x: number; y: number; w: number; h: number },
): number {
    const freq = new Uint32Array(256);

    for (let y = region.y; y < region.y + region.h; y++) {
        for (let x = region.x; x < region.x + region.w; x++) {
            const offset = (y * width + x) * 4;
            if (data[offset + 3] > 128) {
                const grey = Math.round((data[offset] + data[offset + 1] + data[offset + 2]) / 3);
                freq[grey]++;
            }
        }
    }

    let orgWeight = 1;
    for (let i = 1; i < 256; i++) {
        if (freq[i] > freq[orgWeight]) {
            orgWeight = i;
        }
    }

    return orgWeight;
}

/**
 * Remap a greyscale value using DDNet's algorithm.
 * Values <= orgWeight map to 0..newWeight, values > orgWeight map to newWeight..255.
 */
export function remapGreyscale(
    value: number,
    orgWeight: number,
    newWeight: number = 192,
): number {
    if (value <= orgWeight) {
        return (value / orgWeight) * newWeight;
    }
    return ((value - orgWeight) / (255 - orgWeight)) * (255 - newWeight) + newWeight;
}

export function convertHslToRgba(
    hsl: ColorHsl,
    a: number = 255,
): ColorRgba {
    const h = hsl[0] / 360;
    const s = hsl[1] / 100;
    const l = hsl[2] / 100;

    let t2;
    let t3;
    let val;

    if (s === 0) {
        val = l * 255;
        return [val, val, val, a];
    }

    if (l < 0.5) {
        t2 = l * (1 + s);
    } else {
        t2 = l + s - l * s;
    }

    const t1 = 2 * l - t2;
    const rgb: ColorRgba = [0, 0, 0, a];

    for (let i = 0; i < 3; i++) {
        t3 = h + 1 / 3 * -(i - 1);
        if (t3 < 0) {
            t3++;
        }

        if (t3 > 1) {
            t3--;
        }

        if (6 * t3 < 1) {
            val = t1 + (t2 - t1) * 6 * t3;
        } else if (2 * t3 < 1) {
            val = t2;
        } else if (3 * t3 < 2) {
            val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
        } else {
            val = t1;
        }

        rgb[i] = val * 255;
    }

    return rgb;
}
