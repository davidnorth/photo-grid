export type SplitDirection = 'horizontal' | 'vertical';

export interface ImageState {
  url: string;
  zoom: number; // 1 = fit cover
  pan: { x: number; y: number }; // percentage offset
}

export interface LeafNode {
  type: 'leaf';
  id: string;
  image?: ImageState;
}

export interface SplitNode {
  type: 'split';
  id: string;
  direction: SplitDirection;
  ratio: number; // 0 to 1, usually 0.5
  children: [LayoutNode, LayoutNode];
}

export type LayoutNode = LeafNode | SplitNode;

export interface Layout {
  id: string;
  name: string;
  aspectRatio: number; // width / height ratio
  root: LayoutNode;
}
