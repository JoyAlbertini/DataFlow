import React, {useState} from 'react';
import {useFlow} from "./FlowContext.jsx";
import Button from "@mui/material/Button";
import UploadComponent from "./components/UploadComponent.jsx";
import zIndex from "@mui/material/styles/zIndex.js";

export default () => {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    return (
        <aside style={{zIndex: 0}}>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'input')} draggable>
                Input
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'output')} draggable>
                Table Output
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'graph_output')} draggable>
                Graph Output
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'filter')} draggable>
                Filter
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'groupBy')} draggable>
                Group By
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'join')} draggable>
                Join
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'drop')} draggable>
                Drop
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'sort')} draggable>
                Sort
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'merge')} draggable>
                Merge
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'export')} draggable>
                Export
            </div>
            <UploadComponent/>
            <UploadComponent open={isDialogOpen} handleClose={handleCloseDialog}/>
        </aside>

    );
    //
    //     <Button variant="contained" color="primary" onClick={handleOpenDialog}>
    //       Upload
    // </Button> -->
};
