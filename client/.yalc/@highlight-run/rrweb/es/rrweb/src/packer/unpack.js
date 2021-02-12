import { strFromU8, unzlibSync, strToU8 } from '../../node_modules/fflate/esm/browser.js';
import { MARK } from './base.js';

var unpack = function (raw) {
    if (typeof raw !== 'string') {
        return raw;
    }
    try {
        var e = JSON.parse(raw);
        if (e.timestamp) {
            return e;
        }
    }
    catch (error) {
    }
    try {
        var e = JSON.parse(strFromU8(unzlibSync(strToU8(raw, true))));
        if (e.v === MARK) {
            return e;
        }
        throw new Error("These events were packed with packer " + e.v + " which is incompatible with current packer " + MARK + ".");
    }
    catch (error) {
        console.error(error);
        throw new Error('Unknown data format.');
    }
};

export { unpack };
