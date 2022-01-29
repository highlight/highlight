import { Highlight } from '.';
import { NodeOptions } from './types';

var highlight_obj: Highlight;
export function init(options: NodeOptions = {}): void {
    highlight_obj = new Highlight(options);
}
