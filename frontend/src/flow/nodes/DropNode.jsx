import {Handle, Position} from "reactflow";
import {InputLabel, NativeSelect} from "@mui/material";
import React, {useEffect, useState} from "react";
import {Edges} from "../edges/types/utilsEdge.js";
import {useFlow} from "../FlowContext.jsx";
import {findAllColumns} from "./requests/NodeRequests.js";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";

export const createDropNode = (position) => {
    return {
        id: `${new Date().getTime()}`,
        type: 'drop',
        position,
        data: { label: 'Drop', value: 'None',
            edgeSource: Edges.dataframe,
            edgesAccepted: [Edges.dataframe],
            columns: []
        },
    };
};

const dropNode = ({ id, data, isConnectable }) => {
    const {nodes, edges, handleNodeDataChange } = useFlow();

    const [columnNames, setColumnNames] = useState([]);
    const [options, setOptions] = useState([]);


    const fetchColumns = async () => {
        try {
            let columns = await findAllColumns(nodes, edges, id);
            columns = columns.toSorted();
            if(JSON.stringify(columns) === JSON.stringify(options)){
                return;
            }
            setOptions(columns);
        } catch (error) {
            console.error('Error fetching columns:', error);
            setOptions([]);
        }
    };

    useEffect(() => {
        fetchColumns();
    }, [nodes, edges]);

    return (
        <div style={{ padding: '10px', minWidth: '200px', maxWidth: '100%' }} className='node'>
            <Handle
                type="target"
                position={Position.Left}
                style={{background: '#555'}}
                isConnectable={isConnectable}
            />
            <InputLabel variant="standard">
                Drop
            </InputLabel>
            <Stack spacing={2} sx={{ width: 'auto', flexGrow: 1 }}>
                <Autocomplete
                    multiple
                    id='tags-standard'
                    options={options}
                    value={columnNames}
                    onChange={(event, newValue) => {
                        setColumnNames(newValue);
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
            <Handle
                type="source"
                id={`${id}-source-1`}
                position={Position.Right}
                style={{background: '#555'}}
                isConnectable={isConnectable}
            />
        </div>
    );
};

export default dropNode;

