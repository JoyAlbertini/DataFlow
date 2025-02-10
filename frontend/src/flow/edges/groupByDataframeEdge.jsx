import {Edges} from "./types/utilsEdge.js";

export const groupByDataframeEdge = (params) => ({
    id: `edge-${params.source}-${params.target}`,
    source: params.source,
    target: params.target,
    sourceHandle: params.sourceHandle,
    targetHandle: params.targetHandle,
    type: 'default',
    label: Edges.groupByDataframe,
    animated: false,
    style: { stroke: '#1b1ef1' }
});
