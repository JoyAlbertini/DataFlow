import {Edges} from "./types/utilsEdge.js";

export const dataFrameEdge = (params) => {
    return {
        id: `edge-${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        type: 'default',
        label: Edges.dataframe,
        animated: false,
        style: { stroke: '#000000' }
    };
};