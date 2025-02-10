import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { FormControl, InputLabel, NativeSelect} from '@mui/material';
import {Edges} from "../edges/types/utilsEdge.js";
import {useFlow} from "../FlowContext.jsx";
import {findAllColumns} from "./requests/NodeRequests.js";

export const createMergeNode = (position) => {
    return {
        id: `${new Date().getTime()}`,
        type: 'merge',
        position,
        data: {
            label: 'Merge',
            value: 'left',
            edgeSource: Edges.dataframe,
            edgesAccepted: [Edges.dataframe]
        }
    };
};

const mergeNode = ({ id, data, isConnectable }) => {

    const [leftColumn, setLeftColumn] = useState("");
    const [optionsLeft, setOptionsLeft] = useState([])

    const [rightColumn, setRightColumn] = useState("");
    const [optionsRight, setOptionsRight] = useState([])

    const { nodes, edges } = useFlow();

    const fetchColumnsLR = async () => {
        try {
            let allColumns = await findAllColumns(nodes, edges, id, "union");

            setOptionsLeft(allColumns.toSorted())
            setOptionsRight(allColumns.toSorted())

        } catch (error) {
            console.error('Error fetching columns:', error);
            setOptionsLeft([]);
            setOptionsRight([]);
        }
    };

    useEffect(()=>{
        fetchColumnsLR();
    }, [nodes, edges])

    const handleSelectColumnLeft = (event) => {
        data.left_column = event.target.value;
        setLeftColumn(event.target.value);
    }
    const handleSelectColumnRight = (event) => {
        data.right_column = event.target.value;
        setRightColumn(event.target.value);
    }

    return (
        <div style={{ padding: '7px', width:'150px' }} className='node'>
            <Handle
                type="target"
                id={`${id}-target-1`}
                position={Position.Left}
                style={{ top: '30%', background: '#555' }}
                isConnectable={isConnectable}
            />
            <Handle
                type="target"
                id={`${id}-target-2`}
                position={Position.Left}
                style={{ top: '70%', background: '#555' }}
                isConnectable={isConnectable}
            />
            {/*<FormControl fullWidth>*/}
                <InputLabel variant="standard" htmlFor="join-type-native">
                    Merge
                </InputLabel>
                <NativeSelect
                    className={'nodeSize'}
                    style={{width: '100%'}}
                    value={leftColumn}
                    onChange={handleSelectColumnLeft}
                    inputProps={{
                        name: 'join-c',
                        id: 'join-c-type-native',
                    }}
                >
                    {optionsLeft.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                    ))}
                </NativeSelect>

                <NativeSelect
                    className={'nodeSize'}
                    style={{width: '100%'}}
                    value={rightColumn}
                    onChange={handleSelectColumnRight}
                    inputProps={{
                        name: 'join-c',
                        id: 'join-c-type-native',
                    }}
                >
                    {optionsRight.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                    ))}
                </NativeSelect>
            {/*</FormControl>*/}
            <Handle
                type="source"
                id={`${id}-source-1`}
                position={Position.Right}
                style={{ background: '#555' }}
                isConnectable={isConnectable}
            />
        </div>
    );
};

export default mergeNode;