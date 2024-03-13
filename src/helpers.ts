export function debounce(
    func: Function,
    wait: number,
    immediate: boolean = false,
) {
    let timeout: NodeJS.Timeout | undefined;

    return function (this: any) {
        let context = this;
        let args = arguments;

        clearTimeout(timeout);

        if (immediate && !timeout) {
            func.apply(context, args);
        }

        timeout = setTimeout(function () {
            timeout = undefined;

            if (!immediate) {
                func.apply(context, args);
            };
        }, wait);
    };
}

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
