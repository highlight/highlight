import { __assign } from '../../node_modules/tslib/tslib.es6.js';
import { strFromU8, zlibSync, strToU8 } from '../../node_modules/fflate/esm/browser.js';
import { MARK } from './base.js';

var pack = function (event) {
    var _e = __assign(__assign({}, event), { v: MARK });
    return strFromU8(zlibSync(strToU8(JSON.stringify(_e))), true);
};

export { pack };
