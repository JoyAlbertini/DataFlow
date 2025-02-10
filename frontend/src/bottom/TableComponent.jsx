import React, {createContext, forwardRef, useContext, useImperativeHandle} from 'react';
import {DataGrid, GridToolbar} from '@mui/x-data-grid';
import { Box } from '@mui/material';


function getColumns(data){
    console.log(data);
    const sample = data.dataframe.sample;
    if(sample === undefined){
        return [];
    }
    if (sample["0"] === undefined) {
        return [];
    }
    return Object.keys(sample["0"]).map((e)=>
    {return {field: e, headerName: e.charAt(0).toUpperCase() + e.slice(1), width: e.toUpperCase() == "ID" ? 90: 150}});
}

function getRows(data){
    const sample = data.dataframe.sample;
    if (sample === undefined){
        return [];
    }
    let keys = Object.keys(sample);
    let res = [];
    for(let i=0; i<keys.length; i++){
        res.push(sample[keys[i]]);
    }
    return res;
}



const TableContext = createContext(null);

export const useTable = () => useContext(TableContext);
export const TableProvider = TableContext.Provider;


const TableComponent = forwardRef((data, ref) => {
    const [columns, setColumns] = React.useState(getColumns(data));
    const [rows, setRows] = React.useState(getRows(data));

    const updateData = (newData)=>{
        setColumns(getColumns(newData));
        setRows(getRows(newData));
    }

    useImperativeHandle(ref, () => {
        return {
            updateData: updateData
        }
    });


    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={100}
                rowsPerPageOptions={[1000]}
                checkboxSelection
                style={{ height: '100%', width: '100%' }}
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                    },
                }}
            />
        </Box>
    );
})


export default TableComponent;
