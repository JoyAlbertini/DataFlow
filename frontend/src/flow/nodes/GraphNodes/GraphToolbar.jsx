import React, {useEffect} from "react";
import {useFlow} from "../../FlowContext.jsx";
import {findAllColumns} from "../requests/NodeRequests.js";
import {IconButton, NativeSelect} from "@mui/material";
import PlayCircleFilledOutlinedIcon from "@mui/icons-material/PlayCircleFilledOutlined";
import PlayButton from "../utils/PlayButton.jsx";

const GraphToolbar = ({ id, data, onGraphOutput}) => {
    const [x, setX] = React.useState("");
    const [y, setY] = React.useState("");
    const [graphType, setGraphType] = React.useState("");
    const [options, setOptions] = React.useState([]);

    const graphOptions = ["line", "scatter", "bar", "histogram"];

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
    const { nodes, edges, getOutput , handleNodeDataChange} = useFlow();

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

    const handleClick = async (e) => {
        e.preventDefault();
        let res = await getOutput(id);
        console.log(res);
        onGraphOutput(res);
    };

    return (
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
            }}>
                <NativeSelect
                    className={"nodeSize"}
                    value={x}
                    onChange={handleChangeX}
                    inputProps={{
                        name: 'x_axis',
                        id: 'x-axis-select-native',
                    }}
                >
                    {options.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                    ))}
                </NativeSelect>

                <NativeSelect
                    className={"nodeSize"}
                    value={y}
                    onChange={handleChangeY}
                    inputProps={{
                        name: 'y_axis',
                        id: 'y-axis-select-native',
                    }}
                >
                    {options.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                    ))}
                </NativeSelect>

                <NativeSelect
                    value={graphType}
                    onChange={handleChangeGraphType}
                    inputProps={{
                        name: 'graph_type',
                        id: 'graph-type-select-native',
                    }}
                >
                    {graphOptions.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                    ))}
                </NativeSelect>
                <PlayButton
                    onClick={handleClick}
                />
        </div>
    );
};

export default GraphToolbar;