import { useMemo, useRef } from 'react';
import shallow from 'zustand/shallow';

import { EdgeTypes, EdgeTypesWrapped, NodeTypes, NodeTypesWrapped } from '../../types';
import { CreateEdgeTypes } from '../EdgeRenderer/utils';
import { CreateNodeTypes } from '../NodeRenderer/utils';

export function useNodeOrEdgeTypes(nodeOrEdgeTypes: NodeTypes, createTypes: CreateNodeTypes): NodeTypesWrapped;
export function useNodeOrEdgeTypes(nodeOrEdgeTypes: EdgeTypes, createTypes: CreateEdgeTypes): EdgeTypesWrapped;
export function useNodeOrEdgeTypes(nodeOrEdgeTypes: any, createTypes: any): any {
  const typesKeysRef = useRef<string[] | null>(null);

  const typesParsed = useMemo(() => {
    // @ts-ignore
    if (process.env.NODE_ENV === 'development') {
      const typeKeys = Object.keys(nodeOrEdgeTypes);
      if (shallow(typesKeysRef.current, typeKeys)) {
        console.warn(
          "[React Flow]: It looks like you have created a new nodeTypes or edgeTypes object. If this wasn't on purpose please define the nodeTypes/edgeTypes outside of the component or memoize them. Help: https://reactflow.dev/error#200"
        );
      }

      typesKeysRef.current = typeKeys;
    }
    return createTypes(nodeOrEdgeTypes);
  }, [nodeOrEdgeTypes]);

  return typesParsed;
}

export function injectStyle(css: string): void {
  if (!css || typeof document === 'undefined') return;

  const head = document.head || document.getElementsByTagName('head')[0];
  const style = document.createElement('style');

  head.appendChild(style);

  style.appendChild(document.createTextNode(css));
}
