import { removedNodeMutation } from '../types';
export declare function deepDelete(addsSet: Set<Node>, n: Node): void;
export declare function isParentRemoved(removes: removedNodeMutation[], n: Node): boolean;
export declare function isAncestorInSet(set: Set<Node>, n: Node): boolean;
