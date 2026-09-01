export declare function debounce(fn: Function, wait: number, immediate?: boolean): (this: any) => void;
export declare function throttle(fn: Function, wait?: number): (this: any) => void;
export declare function loadImage(src: string): Promise<HTMLImageElement>;
export declare function domReady(callback: Function, ...args: any[]): void;
