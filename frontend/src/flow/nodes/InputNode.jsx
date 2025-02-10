import {Handle, Position} from "reactflow";
import axios from "axios";
import {FormControl, InputLabel, NativeSelect} from "@mui/material";
import React, {useEffect, useState} from "react";
import {Edges} from "../edges/types/utilsEdge.js";
import {useFlow} from "../FlowContext.jsx";

export const createInputNode = (position) => {
    return {
        id: `${new Date().getTime()}`,
        type: 'input2',
        position,
        data: { label: 'Input', value: 'None',
            edgeSource: Edges.dataframe,
            edgesAccepted: [] },
    };
};




const inputNode = ({ id, data, isConnectable }) => {
    const { handleNodeDataChange } = useFlow();

    const [dataframeName, setDataframeName] = useState(data.value);
    const [options, setOptions] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:3000/availableDF")
            .then(response => {
                setOptions(response.data.dfs);
                setDataframeName(response.data.dfs[0] || 'None');
                data.value = response.data.dfs[0] || 'None';
            })
            .catch(error => console.error('Error fetching dataframes:', error));
    }, [data]);

    const handleDataframeNameChange = (event) => {
        setDataframeName(event.target.value);
        data.value = event.target.value;
        handleNodeDataChange(id);
    };

    return (
        <div className='node'>
            <Handle
                id={`${id}-source-1`}
                type="source"
                position={Position.Right}
                style={{ background: '#555' }}
                isConnectable={isConnectable}
            />
            <InputLabel variant="standard">
                Input
            </InputLabel>
            <FormControl fullWidth>
                <NativeSelect
                    value={dataframeName}
                    onChange={handleDataframeNameChange}
                    inputProps={{
                        name: 'dataframe',
                        id: 'dataframe-select-native',
                    }}
                >
                    {options.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                    ))}
                </NativeSelect>
            </FormControl>
        </div>
    );
};

export default inputNode;

