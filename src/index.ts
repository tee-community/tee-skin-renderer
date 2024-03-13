import { initializeAsync } from './tee';
import * as renderer from './tee';
import * as color from './color';
import * as helpers from './helpers';
import './tee.css';

helpers.domReady(() => {
    renderer.initializeAsync();
});

export {
    renderer,
    color,
    helpers,
    initializeAsync as init,
}
