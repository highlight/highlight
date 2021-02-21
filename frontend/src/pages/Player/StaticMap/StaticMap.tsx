import { IncrementalSource, EventType } from '@highlight-run/rrweb';
import { serializedNodeWithId, NodeType } from 'rrweb-snapshot';
import { eventWithTime } from '@highlight-run/rrweb/dist/types';

type Attributes = {
    [key: string]: string | number | boolean | null;
};
type VNode = {
    path: string[];
    tagName: string;
    attributes: Attributes;
};
export type StaticMap = Record<
    number,
    Array<{
        node: VNode;
        started_at: number;
    }>
>;
function visitSnapshot(
    node: serializedNodeWithId,
    onVisit: (
        node: serializedNodeWithId,
        parent: serializedNodeWithId | null
    ) => unknown
) {
    function walk(
        current: serializedNodeWithId,
        parent: serializedNodeWithId | null
    ) {
        onVisit(current, parent);
        if (
            current.type === NodeType.Document ||
            current.type === NodeType.Element
        ) {
            current.childNodes.forEach((n) => walk(n, current));
        }
    }
    walk(node, null);
}
type VTree = {
    tagName: string;
    attributes: Attributes;
    children: VTree[];
    parent: VTree | null;
};
class VirtualTree {
    private map: Map<number, VTree> = new Map();
    private root: VTree | undefined;
    public append(
        tagName: string,
        attributes: Attributes,
        id: number,
        parentId?: number
    ) {
        let newTree: VTree = {
            tagName,
            attributes,
            children: [],
            parent: null,
        };
        if (!this.root) {
            this.root = newTree;
        } else if (parentId && this.map.has(parentId)) {
            const parent = this.map.get(parentId)!;
            newTree = {
                tagName,
                attributes,
                children: [],
                parent,
            };
            parent.children.push(newTree);
        } else {
            console.error(
                `Invalid append: ${JSON.stringify({
                    tagName,
                    attributes,
                    parentId,
                })}`
            );
        }
        this.map.set(id, newTree);
    }
    public remove(id: number) {
        const tree = this.map.get(id);
        if (tree && tree.parent) {
            tree.parent.children = tree.parent.children.filter(
                (item) => item !== tree
            );
            this.map.delete(id);
        }
    }
    public update(id: number, attributes: Attributes) {
        const tree = this.map.get(id);
        if (tree) {
            for (const attributeName in attributes) {
                if (attributes[attributeName] === null) {
                    try {
                        delete tree.attributes[attributeName];
                    } catch (e) {
                        console.warn(e);
                    }
                } else {
                    tree.attributes = {
                        ...tree.attributes,
                        attributeName: attributes[attributeName],
                    };
                }
            }
        }
    }
    public get(id: number): VNode | null {
        const tree = this.map.get(id);
        if (!tree) {
            return null;
        }
        const path: VNode['path'] = [tree.tagName];
        let current = tree;
        while (current.parent) {
            path.unshift(current.parent.tagName);
            current = current.parent;
        }
        return {
            tagName: tree.tagName,
            attributes: { ...tree.attributes },
            path,
        };
    }
}
function isSameNode(node1: VNode, node2: VNode): boolean {
    if (node1.tagName !== node2.tagName) {
        return false;
    }
    if (node1.path.join(' ') !== node2.path.join(' ')) {
        return false;
    }
    Object.keys(node1.attributes).forEach((key1) => {
        const value1 = node1.attributes[key1];
        if (value1 === node2.attributes[key1]) {
            delete node2.attributes[key1];
        }
    });
    if (Object.keys(node2.attributes).length > 0) {
        return false;
    }
    return true;
}
function recordInStaticMap(
    map: StaticMap,
    vtree: VirtualTree,
    id: number,
    timestamp: number
) {
    const node = vtree.get(id);
    if (!node) {
        return;
    }
    if (!map[id]) {
        map[id] = [
            {
                node,
                started_at: timestamp,
            },
        ];
        return;
    }
    const lastRecord = map[id][map[id].length - 1];
    // not same
    if (!isSameNode(lastRecord.node, node)) {
        map[id].push({
            node,
            started_at: timestamp,
        });
    }
}
export function buildStaticMap(events: eventWithTime[]): StaticMap {
    const smap: StaticMap = {};
    const vtree = new VirtualTree();
    for (const event of events) {
        switch (event.type) {
            case EventType.FullSnapshot: {
                visitSnapshot(event.data.node, (current, parent) => {
                    if (current.type === NodeType.Element) {
                        vtree.append(
                            current.tagName,
                            current.attributes,
                            current.id,
                            parent?.id
                        );
                        recordInStaticMap(
                            smap,
                            vtree,
                            current.id,
                            event.timestamp
                        );
                    }
                });
                break;
            }
            case EventType.IncrementalSnapshot: {
                if (event.data.source === IncrementalSource.Mutation) {
                    const { removes, adds, attributes } = event.data;
                    for (const remove of removes) {
                        vtree.remove(remove.id);
                    }
                    for (const add of adds) {
                        if (add.node.type === NodeType.Element) {
                            vtree.append(
                                add.node.tagName,
                                add.node.attributes,
                                add.node.id,
                                add.parentId
                            );
                            recordInStaticMap(
                                smap,
                                vtree,
                                add.node.id,
                                event.timestamp
                            );
                        }
                    }
                    for (const attribute of attributes) {
                        vtree.update(attribute.id, attribute.attributes);
                        recordInStaticMap(
                            smap,
                            vtree,
                            attribute.id,
                            event.timestamp
                        );
                    }
                }
                break;
            }
            default:
                break;
        }
    }
    return smap;
}
