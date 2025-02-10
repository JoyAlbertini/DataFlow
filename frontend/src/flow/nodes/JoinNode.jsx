import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { FormControl, InputLabel, NativeSelect} from '@mui/material';
import {Edges} from "../edges/types/utilsEdge.js";
import {useFlow} from "../FlowContext.jsx";
import {findAllColumns} from "./requests/NodeRequests.js";

export const createJoinNode = (position) => {
    return {
        id: `${new Date().getTime()}`,
        type: 'join',
        position,
        data: {
            label: 'Join',
            value: 'left',
            edgeSource: Edges.dataframe,
            edgesAccepted: [Edges.dataframe]
        }
    };
};



const JoinNode = ({ id, data, isConnectable }) => {
    const { handleNodeDataChange } = useFlow();

    const [joinType, setJoinType] = useState(data.value || 'left');

    const [options, setOptions] = useState([])
    const [columnOn, setColumnOn] = useState("")

    useEffect(() => {
        data.value = joinType;
    }, [joinType, data]);

    const { nodes, edges } = useFlow();

    const fetchColumns = async () => {
        try {
            let columns = await findAllColumns(nodes, edges, id, "intersection");
            columns = columns.toSorted();
            if(JSON.stringify(columns) === JSON.stringify(options)){
                return;
            }
            data.method = columns.length === 0 ? null : columns[0];
            setOptions(columns);
        } catch (error) {
            console.error('Error fetching columns:', error);
            setOptions([]);
        }
    };

    useEffect(()=>{
        fetchColumns();

    }, [nodes, edges])

    const handleSelectChange = (event) => {
        setJoinType(event.target.value);
        handleNodeDataChange(id);
    };

    const handleSelectColumn = (event) => {
        data.method = event.target.value;
        setColumnOn(event.target.value);
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
                    Join
                </InputLabel>

                <NativeSelect
                    className={"nodeSize"}
                    style={{width:'100%'}}
                    value={joinType}
                    onChange={handleSelectChange}
                    inputProps={{
                        name: 'join',
                        id: 'join-type-native',
                    }}
                >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="outer">Outer</option>
                    <option value="inner">Inner</option>
                    <option value="cross">Cross</option>
                </NativeSelect>

                <NativeSelect
                    className={"nodeSize"}
                    style={{width:'100%'}}
                    value={columnOn}
                    onChange={handleSelectColumn}
                    inputProps={{
                        name: 'join-c',
                        id: 'join-c-type-native',
                    }}
                >
                    {options.map((option, index) => (
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

export default JoinNode;