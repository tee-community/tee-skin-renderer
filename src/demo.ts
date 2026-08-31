import { createAsync } from './index';
import { TeeContainer } from './tee';

createAsync({
    eyes: 'normal',
    followMouse: true,
    speed: 10,
    skinUrl: 'https://skins.scrumplex.net/skin/pinky.png',
}).then((container) => {
    document.getElementById('container')!.appendChild(container);
});

createAsync({
    eyes: 'angry',
    followMouse: false,
    speed: 20,
    skinUrl: 'https://skins.scrumplex.net/skin/pinky.png',
}).then((container) => {
    document.getElementById('container')!.appendChild(container);
});

createAsync({
    eyes: 'pain',
    speed: -20,
    skinUrl: 'https://skins.scrumplex.net/skin/pinky.png',
}).then((container) => {
    document.getElementById('container')!.appendChild(container);
});

createAsync({
    eyes: 'happy',
    inAir: true,
    skinUrl: 'https://skins.scrumplex.net/skin/pinky.png',
}).then((container) => {
    document.getElementById('container')!.appendChild(container);
});

createAsync({
    eyes: 'dead',
    skinUrl: 'https://skins.scrumplex.net/skin/pinky.png',
}).then((container) => {
    document.getElementById('container')!.appendChild(container);
});

createAsync({
    eyes: 'surprise',
    speed: 10,
    skinUrl: 'https://skins.scrumplex.net/skin/pinky.png',
}).then((container) => {
    document.getElementById('container')!.appendChild(container);
});

const randomInteger = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

setInterval(() => {
    document.querySelectorAll('.tee.tee_rendered').forEach((container) => {
        const tee = (container as TeeContainer).tee;
        tee.colorBody = randomInteger(0, 0xffffff - 1);
        tee.colorFeet = randomInteger(0, 0xffffff - 1);
    });
}, 1000);
