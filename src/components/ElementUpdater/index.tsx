import { useEffect } from 'react';

import { useStore } from '../../store';
import { Node, Edge, ReactFlowState } from '../../types';

interface ElementUpdaterProps {
  nodes: Node[];
  edges: Edge[];
}

const selector = (s: ReactFlowState) => ({
  setNodes: s.setNodes,
  setEdges: s.setEdges,
});

const ElementUpdater = ({ nodes, edges }: ElementUpdaterProps) => {
  const { setNodes, setEdges } = useStore(selector);

  useEffect(() => {
    setNodes(nodes);
  }, [nodes]);

  useEffect(() => {
    setEdges(edges);
  }, [edges]);

  return null;
};

export default ElementUpdater;
