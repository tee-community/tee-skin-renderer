import * as renderer from './tee';
import './tee.css';

function domReady(callback: Function, ...args: any[]) {
    args = args !== undefined ? args : [];

    if (document.readyState !== 'loading') {
        callback(...args);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            callback(...args);
        });
    }
}

domReady(() => {
    const randomInteger = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    document
        .querySelectorAll<HTMLDivElement>('.tee')
        .forEach((container) => {
            const tee = renderer.createRenderer(container);

            console.log(tee);

            // setInterval(() => {
            //     tee.colorBody = randomInteger(0, 0xffffff - 1);
            //     tee.colorFeet = randomInteger(0, 0xffffff - 1);
            // }, 1000);
        });
});

export default renderer;
