import { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { Selection as D3Selection, ZoomBehavior } from 'd3';

import { XYPosition, Rect, Transform, CoordinateExtent } from './utils';
import { NodeChange, EdgeChange } from './changes';
import { Node, NodeInternals, NodeDimensionUpdate, NodeDiffUpdate } from './nodes';
import { Edge } from './edges';
import { HandleType, StartHandle } from './handles';

export type NodeTypesType = { [key: string]: ReactNode };
export type EdgeTypesType = NodeTypesType;

export type FitView = (fitViewOptions?: FitViewParams) => void;

export type Project = (position: XYPosition) => XYPosition;

export type ToObject<T = any> = () => FlowExportObject<T>;

export type OnNodesChange = (nodes: NodeChange[]) => void;

export type OnEdgesChange = (nodes: EdgeChange[]) => void;

export type ZoomInOut = (options?: ZoomPanHelperFunctionOptions) => void;
export type ZoomTo = (zoomLevel: number, options?: ZoomPanHelperFunctionOptions) => void;
export type GetZoom = () => number;
export type GetTransform = () => FlowTransform;
export type SetTransform = (transform: FlowTransform, options?: ZoomPanHelperFunctionOptions) => void;
export type SetCenter = (x: number, y: number, options?: SetCenterOptions) => void;
export type FitBounds = (bounds: Rect, options?: FitBoundsOptions) => void;

export type ReactFlowInstance<T = any> = {
  zoomIn: ZoomInOut;
  zoomOut: ZoomInOut;
  zoomTo: ZoomTo;
  getZoom: () => number;
  setCenter: SetCenter;
  fitView: FitView;
  project: Project;
  getNodes: () => Node<T>[];
  getEdges: () => Edge<T>[];
  setTransform: SetTransform;
  getTransform: () => FlowTransform;
  toObject: ToObject<T>;
};

export type OnPaneReady<T = any> = (reactFlowInstance: ReactFlowInstance<T>) => void;

export interface Connection {
  source: string | null;
  target: string | null;
  sourceHandle: string | null;
  targetHandle: string | null;
}

export enum ConnectionMode {
  Strict = 'strict',
  Loose = 'loose',
}

export type FlowExportObject<T = any> = {
  nodes: Node<T>[];
  edges: Edge<T>[];
  position: [number, number];
  zoom: number;
};

export type OnConnect = (connection: Connection) => void;

export type FitViewParams = {
  padding?: number;
  includeHiddenNodes?: boolean;
  minZoom?: number;
  maxZoom?: number;
  duration?: number;
};

export type OnConnectStartParams = {
  nodeId: string | null;
  handleId: string | null;
  handleType: HandleType | null;
};

export type OnConnectStart = (event: ReactMouseEvent, params: OnConnectStartParams) => void;

export type OnConnectStop = (event: MouseEvent) => void;

export type OnConnectEnd = (event: MouseEvent) => void;

export enum BackgroundVariant {
  Lines = 'lines',
  Dots = 'dots',
}

export type FlowTransform = {
  x: number;
  y: number;
  zoom: number;
};

export type KeyCode = string | Array<string>;

export type SnapGrid = [number, number];

export enum PanOnScrollMode {
  Free = 'free',
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

export type ZoomPanHelperFunctionOptions = {
  duration?: number;
};

export type SetCenterOptions = ZoomPanHelperFunctionOptions & {
  zoom?: number;
};

export type FitBoundsOptions = ZoomPanHelperFunctionOptions & {
  padding?: number;
};

export interface ZoomPanHelperFunctions {
  zoomIn: ZoomInOut;
  zoomOut: ZoomInOut;
  zoomTo: ZoomTo;
  getZoom: GetZoom;
  setTransform: SetTransform;
  getTransform: GetTransform;
  fitView: FitView;
  setCenter: SetCenter;
  fitBounds: FitBounds;
  project: Project;
  initialized: boolean;
}

export type ReactFlowStore = {
  width: number;
  height: number;
  transform: Transform;
  nodeInternals: NodeInternals;
  edges: Edge[];
  selectedNodesBbox: Rect;
  onNodesChange: OnNodesChange | null;
  onEdgesChange: OnEdgesChange | null;

  d3Zoom: ZoomBehavior<Element, unknown> | null;
  d3Selection: D3Selection<Element, unknown, null, undefined> | null;
  d3ZoomHandler: ((this: Element, event: any, d: unknown) => void) | undefined;
  minZoom: number;
  maxZoom: number;
  translateExtent: CoordinateExtent;
  nodeExtent: CoordinateExtent;

  nodesSelectionActive: boolean;
  userSelectionActive: boolean;

  connectionNodeId: string | null;
  connectionHandleId: string | null;
  connectionHandleType: HandleType | null;
  connectionPosition: XYPosition;
  connectionMode: ConnectionMode;

  snapToGrid: boolean;
  snapGrid: SnapGrid;

  nodesDraggable: boolean;
  nodesConnectable: boolean;
  elementsSelectable: boolean;

  multiSelectionActive: boolean;

  reactFlowVersion: string;

  fitViewOnInit: boolean;
  fitViewOnInitDone: boolean;

  connectionStartHandle: StartHandle | null;

  onConnect?: OnConnect;
  onConnectStart?: OnConnectStart;
  onConnectStop?: OnConnectStop;
  onConnectEnd?: OnConnectEnd;

  connectOnClick: boolean;
};

export type ReactFlowActions = {
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodeDimensions: (updates: NodeDimensionUpdate[]) => void;
  updateNodePosition: (update: NodeDiffUpdate) => void;
  resetSelectedElements: () => void;
  unselectNodesAndEdges: () => void;
  addSelectedNodes: (nodeIds: string[]) => void;
  addSelectedEdges: (edgeIds: string[]) => void;
  setMinZoom: (minZoom: number) => void;
  setMaxZoom: (maxZoom: number) => void;
  setTranslateExtent: (translateExtent: CoordinateExtent) => void;
  setNodeExtent: (nodeExtent: CoordinateExtent) => void;
  reset: () => void;
};

export type ReactFlowState = ReactFlowStore & ReactFlowActions;

export type UpdateNodeInternals = (nodeId: string) => void;

export type OnSelectionChangeParams = {
  nodes: Node[];
  edges: Edge[];
};

export type OnSelectionChangeFunc = (params: OnSelectionChangeParams) => void;

export type AttributionPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type ProOptions = {
  account: string;
  hideAttribution: boolean;
};
