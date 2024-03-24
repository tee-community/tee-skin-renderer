export function debounce(
    fn: Function,
    wait: number,
    immediate: boolean = false,
) {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    return function (this: any) {
        let context = this;
        let args = arguments;

        clearTimeout(timeout);

        if (immediate && !timeout) {
            fn.apply(context, args);
        }

        timeout = setTimeout(function () {
            timeout = undefined;

            if (!immediate) {
                fn.apply(context, args);
            };
        }, wait);
    };
}

export function throttle(
    fn: Function,
    wait: number = 300,
) {
    let inThrottle: boolean;
    let lastFn: ReturnType<typeof setTimeout>;
    let lastTime: number;

    return function (this: any) {
        const context = this;
        const args = arguments;

        if (!inThrottle) {
            fn.apply(context, args);
            lastTime = Date.now();
            inThrottle = true;
        } else {
            clearTimeout(lastFn);
            lastFn = setTimeout(() => {
                if (Date.now() - lastTime >= wait) {
                    fn.apply(context, args);
                    lastTime = Date.now();
                }
            }, Math.max(wait - (Date.now() - lastTime), 0));
        }
    };
};

export function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const elImage = new Image();

        elImage.crossOrigin = 'anonymous';
        elImage.addEventListener('error', reject);
        elImage.addEventListener('load', (e) => {
            Promise.resolve(resolve(e.target as HTMLImageElement)).then(() => {
                elImage.remove();
            });
        });

        elImage.src = src;
    });
}

export function domReady(callback: Function, ...args: any[]) {
    args = args !== undefined ? args : [];

    if (document.readyState !== 'loading') {
        callback(...args);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            callback(...args);
        });
    }
}
