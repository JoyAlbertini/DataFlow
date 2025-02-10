// App.jsx
import React, {useEffect, useRef, useState} from 'react';
import { Box } from '@mui/material';
import FlowComponent from './flow/FlowComponent';
import {Resizable} from "re-resizable";
import OuputWrapper from "./bottom/ouputWrapper.jsx";
import OutputWrapper from "./bottom/ouputWrapper.jsx";

const App = () => {
    const [heightInPixels, setHeightInPixels] = useState(window.innerHeight / 2); // Initialize with half of the window height

    const t_Height = `${heightInPixels}px`; // Use pixel value directly
    const b_Height = `calc(100vh - ${t_Height})`;

    const ref = useRef({});

    const updateShowableData = (newData) =>{
        ref.current.updateData(newData);
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <Resizable
                size={{ width: '100%', height: t_Height }}
                onResizeStop={(e, direction, refToResizable, d) => {
                    setHeightInPixels(prevHeight => prevHeight + d.height); // Functional update based on previous height
                }}
                minHeight="30vh"
                maxHeight="70vh"
                enable={{
                    top: false,
                    right: false,
                    bottom: true,
                    left: false,
                    topRight: false,
                    bottomRight: false,
                    bottomLeft: false,
                    topLeft: false
                }}
                handleComponent={{
                    bottom: <div style={{ height: '10px', background: '#ccc' }} />
                }}
            >
                <FlowComponent update={updateShowableData} />
            </Resizable>
            <Box sx={{ height: b_Height, width: '100%' }}>
                <OutputWrapper ref={ref} />
            </Box>
        </Box>
    );
};

export default App;
