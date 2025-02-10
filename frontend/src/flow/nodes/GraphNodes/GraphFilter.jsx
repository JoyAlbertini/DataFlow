import {Edges} from "../../edges/types/utilsEdge.js";
import {Handle, Position} from "reactflow";
import React from "react";
import GraphToolbar from "./GraphToolbar.jsx";
import GraphInternal from "../../../bottom/GraphInternal.jsx";
import {InputLabel} from "@mui/material";

export const createGraphFilter = (position) => {
    return {
        id: `${new Date().getTime()}`,
        type: 'graph_filter',
        position,
        data: {
            label: 'Graph Filter',
            edgeSource: Edges.dataframe,
            edgesAccepted: [Edges.dataframe],
            graphType: "line"
        }
    };
};

const graphFilterNode = ({ id, data, isConnectable }) => {
    const [graph, setGraph] = React.useState(null);

    const handleGraphOutput = (outputGraph) => {
        setGraph(outputGraph)
    };


    return (
        <div className='node'>
            <Handle
                type="target"
                id={`${id}-target-1`}
                position={Position.Left}
                style={{background: '#555'}}
                isConnectable={isConnectable}
            />
            <InputLabel variant="standard">
                Graph Filter
            </InputLabel>
            <GraphToolbar id={id} data={data} onGraphOutput={handleGraphOutput}/>
            <GraphInternal graph={graph} />
            <Handle
                type="source"
                id={`${id}-source-1`}
                position={Position.Right}
                style={{background: '#555'}}
                isConnectable={isConnectable}
            />
        </div>
    );
}
export default graphFilterNode;