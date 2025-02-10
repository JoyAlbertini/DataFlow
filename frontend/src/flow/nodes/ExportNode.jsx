import {Handle, Position} from "reactflow";
import {IconButton, InputLabel} from "@mui/material";
import PlayCircleFilledOutlinedIcon from '@mui/icons-material/PlayCircleFilledOutlined';
import {Edges} from "../edges/types/utilsEdge.js";
import {useFlow} from "../FlowContext.jsx";
import React from 'react';
import PlayButton from "./utils/PlayButton.jsx";

export const createExportNode = (position) => {
    return {
        id: `${new Date().getTime()}`,
        type: 'export',
        position,
        data: {
            label: 'Export',
            edgeSource: Edges.dataframe,
            edgesAccepted: [Edges.dataframe, Edges.groupByDataframe]
        }
    };
};

const exportNode = ({ id, data, isConnectable }) => {

    const { exportDataframe } = useFlow();
    return (
        <div className='node'>
            <Handle
                type="target"
                id={`${id}-target-1`}
                position={Position.Left}
                style={{background: '#555'}}
                isConnectable={isConnectable}
            />
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
            }}>
                <InputLabel variant="standard">
                    Export Full Data
                </InputLabel>
                <PlayButton onClick={() => exportDataframe(id)} />
            </div>
        </div>
    );
};

export default exportNode;