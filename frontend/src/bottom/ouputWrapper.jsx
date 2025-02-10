import React, {forwardRef, useImperativeHandle, useRef, useState} from "react";
import GraphComponent from "./GraphComponent.jsx";
import TableComponent from "./TableComponent.jsx";


const OutputWrapper = forwardRef((props, ref) => {
    const [tableData, setTableData] = useState({});
    const [div, setDiv] = useState("");
    const [script, setScript] = useState('');

    const updateShowableData = (newData) => {
        if (newData.type === "table") {
            if(Object.keys(tableData).length === 0){
                setTableData(newData);
            }else{
                table_ref.current.updateData({dataframe: newData});
            }
            setScript("");
            setDiv("");
        } else {
            if (div !== "") {
                graph_ref.current.updateDiv(newData);
            } else {
                setDiv(newData.div);
                setScript(newData.script);
            }
            setTableData({});
        }
    }

    useImperativeHandle(ref, () => {
        return {
            updateData: updateShowableData
        }
    });

    const graph_ref = useRef({});
    const table_ref = useRef({});

    return (<div style={{position: 'relative', zIndex: 1000, backgroundColor: "white", width: '100%', height: '100%'}}>
            {Object.keys(tableData).length === 0 ?
                div !== "" ?
                    <GraphComponent div={div} ref={graph_ref} script={script}/> :
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '47vh',
                        zIndex: 1000
                    }}>
                        No active output
                    </div> :
                <TableComponent ref={table_ref} dataframe={tableData}/>}
        </div>

    );
});

export default OutputWrapper;
