import { Layout, LayoutNode } from './types';

const createLeaf = (id: string): LayoutNode => ({
    type: 'leaf',
    id,
});

const createSplit = (
    id: string,
    direction: 'horizontal' | 'vertical',
    children: [LayoutNode, LayoutNode],
    ratio: number = 0.5
): LayoutNode => ({
    type: 'split',
    id,
    direction,
    ratio,
    children,
});

export const DEFAULT_LAYOUTS: Layout[] = [
    {
        id: 'single',
        name: 'Single',
        root: createLeaf('cell-1'),
    },
    {
        id: '2x1',
        name: '2 Columns',
        root: createSplit('split-1', 'horizontal', [
            createLeaf('cell-1'),
            createLeaf('cell-2'),
        ]),
    },
    {
        id: '1x2',
        name: '2 Rows',
        root: createSplit('split-1', 'vertical', [
            createLeaf('cell-1'),
            createLeaf('cell-2'),
        ]),
    },
    {
        id: '2x2',
        name: '2x2 Grid',
        root: createSplit('split-main', 'vertical', [
            createSplit('split-top', 'horizontal', [
                createLeaf('cell-1'),
                createLeaf('cell-2'),
            ]),
            createSplit('split-bottom', 'horizontal', [
                createLeaf('cell-3'),
                createLeaf('cell-4'),
            ]),
        ]),
    },
    {
        id: 'complex-1',
        name: 'Complex 1',
        root: createSplit('split-main', 'horizontal', [
            createLeaf('cell-1'),
            createSplit('split-right', 'vertical', [
                createLeaf('cell-2'),
                createLeaf('cell-3'),
            ]),
        ]),
    },
];
