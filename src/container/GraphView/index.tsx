import React, { useEffect, useRef, memo, CSSProperties, MouseEvent } from 'react';
import { ResizeObserver } from 'resize-observer';

import { useStoreState, useStoreActions } from '../../store/hooks';
import NodeRenderer from '../NodeRenderer';
import EdgeRenderer from '../EdgeRenderer';
import UserSelection from '../../components/UserSelection';
import NodesSelection from '../../components/NodesSelection';
import useKeyPress from '../../hooks/useKeyPress';
import useD3Zoom from '../../hooks/useD3Zoom';
import useGlobalKeyHandler from '../../hooks/useGlobalKeyHandler';
import useElementUpdater from '../../hooks/useElementUpdater';
import { getDimensions } from '../../utils';
import { project, getElements } from '../../utils/graph';
import {
  Elements,
  NodeTypesType,
  EdgeTypesType,
  OnLoadFunc,
  Node,
  Edge,
  Connection,
  ConnectionLineType,
} from '../../types';

export interface GraphViewProps {
  elements: Elements;
  onElementClick?: (element: Node | Edge) => void;
  onElementsRemove?: (elements: Elements) => void;
  onNodeMouseEnter?: (evt: MouseEvent, node: Node) => void;
  onNodeMouseMove?: (evt: MouseEvent, node: Node) => void;
  onNodeMouseLeave?: (evt: MouseEvent, node: Node) => void;
  onNodeContextMenu?: (evt: MouseEvent, node: Node) => void;
  onNodeDragStart?: (node: Node) => void;
  onNodeDragStop?: (node: Node) => void;
  onConnect?: (connection: Connection | Edge) => void;
  onLoad?: OnLoadFunc;
  onMove?: () => void;
  selectionKeyCode: number;
  nodeTypes: NodeTypesType;
  edgeTypes: EdgeTypesType;
  connectionLineType: ConnectionLineType;
  connectionLineStyle?: CSSProperties;
  deleteKeyCode: number;
  snapToGrid: boolean;
  snapGrid: [number, number];
  onlyRenderVisibleNodes: boolean;
  nodesDraggable: boolean;
  nodesConnectable: boolean;
  elementsSelectable: boolean;
  selectNodesOnDrag: boolean;
  minZoom: number;
  maxZoom: number;
  defaultZoom: number;
  arrowHeadColor: string;
  markerEndId?: string;
  zoomOnScroll: boolean;
  zoomOnDoubleClick: boolean;
}

const GraphView = memo(
  ({
    nodeTypes,
    edgeTypes,
    onMove,
    onLoad,
    onElementClick,
    onNodeMouseEnter,
    onNodeMouseMove,
    onNodeMouseLeave,
    onNodeContextMenu,
    onNodeDragStart,
    onNodeDragStop,
    connectionLineType,
    connectionLineStyle,
    selectionKeyCode,
    onElementsRemove,
    deleteKeyCode,
    elements,
    onConnect,
    snapToGrid,
    snapGrid,
    onlyRenderVisibleNodes,
    nodesDraggable,
    nodesConnectable,
    elementsSelectable,
    selectNodesOnDrag,
    minZoom,
    maxZoom,
    defaultZoom,
    arrowHeadColor,
    markerEndId,
    zoomOnScroll,
    zoomOnDoubleClick,
  }: GraphViewProps) => {
    const zoomPane = useRef<HTMLDivElement>(null);
    const rendererNode = useRef<HTMLDivElement>(null);
    const width = useStoreState((s) => s.width);
    const height = useStoreState((s) => s.height);
    const d3Initialised = useStoreState((s) => s.d3Initialised);
    const nodesSelectionActive = useStoreState((s) => s.nodesSelectionActive);
    const updateSize = useStoreActions((actions) => actions.updateSize);
    const setNodesSelection = useStoreActions((actions) => actions.setNodesSelection);
    const setOnConnect = useStoreActions((a) => a.setOnConnect);
    const setSnapGrid = useStoreActions((actions) => actions.setSnapGrid);
    const setNodesDraggable = useStoreActions((actions) => actions.setNodesDraggable);
    const setNodesConnectable = useStoreActions((actions) => actions.setNodesConnectable);
    const setElementsSelectable = useStoreActions((actions) => actions.setElementsSelectable);
    const updateTransform = useStoreActions((actions) => actions.updateTransform);
    const setMinMaxZoom = useStoreActions((actions) => actions.setMinMaxZoom);
    const fitView = useStoreActions((actions) => actions.fitView);
    const zoom = useStoreActions((actions) => actions.zoom);

    const selectionKeyPressed = useKeyPress(selectionKeyCode);

    const onZoomPaneClick = () => setNodesSelection({ isActive: false });

    const updateDimensions = () => {
      if (!rendererNode.current) {
        return;
      }

      const size = getDimensions(rendererNode.current);

      if (size.height === 0 || size.width === 0) {
        throw new Error('The React Flow parent container needs a width and a height to render the graph.');
      }

      updateSize(size);
    };

    useEffect(() => {
      let resizeObserver: ResizeObserver;

      updateDimensions();
      window.onresize = updateDimensions;

      if (onConnect) {
        setOnConnect(onConnect);
      }

      if (defaultZoom !== 1) {
        updateTransform({ x: 0, y: 0, k: defaultZoom });
      }

      if (rendererNode.current) {
        resizeObserver = new ResizeObserver((entries) => {
          for (let _ of entries) {
            updateDimensions();
          }
        });

        resizeObserver.observe(rendererNode.current);
      }

      return () => {
        window.onresize = null;

        if (resizeObserver && rendererNode.current) {
          resizeObserver.unobserve(rendererNode.current!);
        }
      };
    }, []);

    useD3Zoom({ zoomPane, onMove, selectionKeyPressed, zoomOnScroll, zoomOnDoubleClick });

    useEffect(() => {
      if (d3Initialised && onLoad) {
        onLoad({
          fitView: (params = { padding: 0.1 }) => fitView(params),
          zoomIn: () => zoom(0.2),
          zoomOut: () => zoom(-0.2),
          project,
          getElements,
        });
      }
    }, [d3Initialised, onLoad]);

    useEffect(() => {
      setSnapGrid({ snapToGrid, snapGrid });
    }, [snapToGrid]);

    useEffect(() => {
      setNodesDraggable(nodesDraggable);
    }, [nodesDraggable]);

    useEffect(() => {
      setNodesConnectable(nodesConnectable);
    }, [nodesConnectable]);

    useEffect(() => {
      setElementsSelectable(elementsSelectable);
    }, [elementsSelectable]);

    useEffect(() => {
      setMinMaxZoom({ minZoom, maxZoom });
    }, [minZoom, maxZoom]);

    useGlobalKeyHandler({ onElementsRemove, deleteKeyCode });
    useElementUpdater(elements);

    return (
      <div className="react-flow__renderer" ref={rendererNode}>
        <NodeRenderer
          nodeTypes={nodeTypes}
          onElementClick={onElementClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseMove={onNodeMouseMove}
          onNodeMouseLeave={onNodeMouseLeave}
          onNodeContextMenu={onNodeContextMenu}
          onNodeDragStop={onNodeDragStop}
          onNodeDragStart={onNodeDragStart}
          onlyRenderVisibleNodes={onlyRenderVisibleNodes}
          selectNodesOnDrag={selectNodesOnDrag}
        />
        <EdgeRenderer
          width={width}
          height={height}
          edgeTypes={edgeTypes}
          onElementClick={onElementClick}
          connectionLineType={connectionLineType}
          connectionLineStyle={connectionLineStyle}
          arrowHeadColor={arrowHeadColor}
          markerEndId={markerEndId}
        />
        <UserSelection selectionKeyPressed={selectionKeyPressed} />
        {nodesSelectionActive && <NodesSelection />}
        <div className="react-flow__zoompane" onClick={onZoomPaneClick} ref={zoomPane} />
      </div>
    );
  }
);

GraphView.displayName = 'GraphView';

export default GraphView;
