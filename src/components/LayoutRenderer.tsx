import React from 'react';
import { LayoutNode, ImageState } from '../types';
import { Cell } from './Cell';

interface LayoutRendererProps {
    node: LayoutNode;
    padding: number;
    onImageDrop: (id: string, file: File) => void;
    onImageUpdate: (id: string, updates: Partial<ImageState>) => void;
}

export const LayoutRenderer: React.FC<LayoutRendererProps> = ({
    node,
    padding,
    onImageDrop,
    onImageUpdate,
}) => {
    if (node.type === 'leaf') {
        return (
            <Cell
                node={node}
                onImageDrop={onImageDrop}
                onImageUpdate={onImageUpdate}
            />
        );
    }

    // Split node
    const isHorizontal = node.direction === 'horizontal';

    return (
        <div
            className="flex w-full h-full"
            style={{
                flexDirection: isHorizontal ? 'row' : 'column',
                gap: `${padding}px`,
            }}
        >
            {/* First Child */}
            <div style={{ flex: `${node.ratio} 1 0px`, overflow: 'hidden', position: 'relative', minWidth: 0, minHeight: 0 }}>
                <LayoutRenderer
                    node={node.children[0]}
                    padding={padding}
                    onImageDrop={onImageDrop}
                    onImageUpdate={onImageUpdate}
                />
            </div>

            {/* Second Child */}
            <div style={{ flex: `${1 - node.ratio} 1 0px`, overflow: 'hidden', position: 'relative', minWidth: 0, minHeight: 0 }}>
                <LayoutRenderer
                    node={node.children[1]}
                    padding={padding}
                    onImageDrop={onImageDrop}
                    onImageUpdate={onImageUpdate}
                />
            </div>
        </div>
    );
};
