import { initializeAsync, createAsync } from './tee';
import * as renderer from './tee';
import * as color from './color';
import * as helpers from './helpers';
import * as atlas from './atlas';
import './tee.css';

helpers.domReady(() => {
    renderer.initializeAsync();
});

export {
    renderer,
    color,
    helpers,
    atlas,
    initializeAsync as init,
    createAsync as createAsync,
}
