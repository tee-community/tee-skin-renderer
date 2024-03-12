export function debounce(func: Function, delayMs: number) {
    let timer: NodeJS.Timeout;

    return function (...args: any[]) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func(...args);
        }, delayMs);
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
};
