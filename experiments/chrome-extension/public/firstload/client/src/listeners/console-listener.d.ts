import { ConsoleMessage } from '../../../frontend/src/util/shared-types';
export declare const ConsoleListener: (callback: (c: ConsoleMessage) => void) => () => void;
