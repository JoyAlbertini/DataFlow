import { Handle, Position, useUpdateNodeInternals } from "reactflow";
import React, { useState, useEffect } from "react";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';
import {Edges} from "../edges/types/utilsEdge.js";
import {useFlow} from "../FlowContext.jsx";
import {findAllColumns} from "./requests/NodeRequests.js";
import {InputLabel, NativeSelect} from "@mui/material";

export const createSortNode = (position) => {
    return {
        id: `${new Date().getTime()}`,
        type: 'sort',
        position,
        data: { label: 'Sort', value: [],
            edgeSource: Edges.dataframe,
            edgesAccepted: [Edges.dataframe],
            aggregation: 'count',
            sortOption: "ascending"
        },
    };
};


const sortNode = ({ id, data, isConnectable }) => {
    const [selectedOptions, setSelectedOptions] = useState(data.value || []);
    const [availableOptions, setAvailableOptions] = useState([]);
    const updateNodeInternals = useUpdateNodeInternals();
    const { nodes, edges, handleNodeDataChange } = useFlow();

    const [sortingOptions] = useState(["ascending", "descending"])

    const fetchColumns = async () => {
        try {
            const columns = await findAllColumns(nodes, edges, id);
            setAvailableOptions(columns);
        } catch (error) {
            console.error('Error fetching columns:', error);
            setAvailableOptions([]);
        }
    };

    useEffect(() => {
        fetchColumns();
    }, [nodes, edges, id]);

    useEffect(() => {
        data.value = selectedOptions;
        updateNodeInternals(id);
    }, [selectedOptions, data, id, updateNodeInternals]);


    const handleSortOptionChange = (event) => {
        data.sortOption = event.target.value;
    }

    return (
        <div style={{ padding: '10px', minWidth: '200px', maxWidth: '100%' }} className="node">
            <Handle
                type="target"
                id={`${id}-target-1`}
                position={Position.Left}
                style={{ background: '#555' }}
                isConnectable={isConnectable}
            />
            <InputLabel variant="standard">
                Sort
            </InputLabel>
            <Stack spacing={2} sx={{ width: 'auto', flexGrow: 1 }} className={"nodeSize"}>
                <Autocomplete

                    multiple
                    id='tags-standard'
                    options={availableOptions}
                    value={selectedOptions}
                    onChange={(event, newValue) => {
                        setSelectedOptions(newValue);
                        data.columns = newValue;
                        handleNodeDataChange(id);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="standard"
                            placeholder="Columns"
                        />
                    )}
                />
            </Stack>
            <NativeSelect
                style={{width:'100%'}}
                value={data.sortOption}
                onChange={handleSortOptionChange}
                inputProps={{
                    name: 'dataframe',
                    id: 'dataframe-select-native',
                }}
            >
                {sortingOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                ))}
            </NativeSelect>
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

export default sortNode;
