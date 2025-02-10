import {Handle, Position} from "reactflow";
import React, {useEffect} from "react";
import {useFlow} from "../../FlowContext.jsx";
import {IconButton, InputLabel, NativeSelect} from "@mui/material";
import {Edges} from "../../edges/types/utilsEdge.js";
import PlayCircleFilledOutlinedIcon from "@mui/icons-material/PlayCircleFilledOutlined.js";
import {findAllColumns} from "../requests/NodeRequests.js";
import PlayButton from "../utils/PlayButton.jsx";
import GraphToolbar from "./GraphToolbar.jsx";

export const createGraphOutputNode = (position) => {
    return {
        id: `${new Date().getTime()}`,
        type: 'graph_output',
        position,
        data: {
            label: 'Graph',
            edgeSource: Edges.dataframe,
            edgesAccepted: [Edges.dataframe],
            graphType: "line"
        }
    };
};


const graphOutputNode = ({ id, data, isConnectable }) => {
    const [x, setX] = React.useState("");
    const [y, setY] = React.useState("");
    const [graphType, setGraphType] = React.useState("");
    const [options, setOptions] = React.useState([]);

    const graphOptions = ["line", "scatter", "bar"];

    const handleChangeGraphType = (event) =>{
        setGraphType(event.target.value);
        data.graphType = event.target.value;
    }


    const handleChangeX = (event) => {
        setX(event.target.value);
        data.x = event.target.value;
        handleNodeDataChange(id);
    }

    const handleChangeY = (event) => {
        setY(event.target.value);
        data.y = event.target.value;
        handleNodeDataChange(id);
    }
    const { nodes, edges, getFlow, getOutput , handleNodeDataChange} = useFlow();

    const fetchColumns = async () => {
        try {
            let columns = await findAllColumns(nodes, edges, id);
            columns = columns.toSorted();
            if(JSON.stringify(columns) === JSON.stringify(options)){
                return;
            }
            if(columns.length === 0){
                data.x = null;
                data.y = null;
            }else{
                console.log("HERE");
                data.x = columns[0];
                data.y = columns[0];
            }
            setOptions(columns);
        } catch (error) {
            console.error('Error fetching columns:', error);
            setOptions([]);
        }
    };

    useEffect(() => {
        fetchColumns();
        data.name = options[0] || '';
        // data.graphType = "line";
    }, [nodes, edges]);

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
                Graph
            </InputLabel>
           <GraphToolbar id={id} data={data} onGraphOutput={(r)=> console.log(r)}/>
        </div>
    );
};

export default graphOutputNode;