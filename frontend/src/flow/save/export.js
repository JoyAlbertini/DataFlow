import axios from "axios";
import Swal from "sweetalert2";
import SaveAs from "file-saver";

const exportFlowToJson = (nodes, edges) => {
    const exportObj = {
        nodes: nodes.map(node => ({
            id: node.id,
            type: node.type,
            position: node.position,
            data: node.data
        })),
        edges: edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            style: edge.style
        }))
    };


    const json = JSON.stringify(exportObj, null, 2);
    localStorage.setItem('exportedFlow', json);

    return json;
};


function findNodeById(nodes, id){
    let res =  nodes.filter((node) => node.id === id);
    return res.length ? res[0] : null;
}


function getEdgeOrNull(edges, nodeId, direction = "source"){
    let res;
    if(direction === "source"){
        res = edges.filter((node) => node.source === nodeId);
    }else{
        res = edges.filter((node) => node.target === nodeId);
    }
    return res.length ? res[0] : null;
}


function getOperator(node, nodes, edges){
    switch (node.type){
        case "input2":
            return node.data?.value ? {"operator": "input", "dataframe": node.data.value} : null;
        case "filter":
            return node.data?.value ? {"operator": "filter", "query": node.data.value} : null;
        case "output2":
            return {"operator": "output"};
        case "export":
            return {"operator": "output"}
        case "join":
            return {"operator": "join", "on": node.data.method, "how": node.data.value,
                "operand": parseJoin(nodes, edges, node)};
        case "graph_output":
            return {"x_axis": node.data.x, "y_axis": node.data.y, "type": node.data.graphType};
        case "graph_filter":
            return {"x_axis": node.data.x, "y_axis": node.data.y, "type": node.data.graphType};
        case "groupBy":
            return {"operator": "groupBy", "on": node.data.column, "aggregation": node.data.aggregation}
        case "drop":
            return {"operator": "drop", "columns": node.data.columns}
        case "merge":
            return {"operator": "merge", "left_column": node.data.left_column, "right_column": node.data.right_column, "operand": parseJoin(nodes, edges, node)}
        case "sort":
            return {"operator": "sort", "columns": node.data.columns, "method": node.data.sortOption}
    }
    return null;
}


function parseJoin(nodes, edges, node){
    let operand = [];
    let targetEdges = edges.filter((n) => n.target === node.id);

    let currentEdge = targetEdges.find((edge)=> edge.targetHandle.endsWith("target-1"));
    let current = findNodeById(nodes, currentEdge.source);
    if(current === null){
        return operand;
    }
    while(node != null){
        let operator = getOperator(current, nodes, edges);
        if(operator == null){
            break
        }
        operand.push(operator);
        targetEdges = edges.filter((node) => node.target === node.id);
        let edge = targetEdges.find((edge)=> edge.source.endsWith("target-2"));
        if(edge == null){
            break;
        }
        edges = edges.toSpliced(edges.indexOf(edge),1);
        current = findNodeById(nodes, edge.source);
    }
    return operand.toReversed();
}


const parseGraph = (nodes, edges, nodeId) => {
    let inputs = nodes.filter((node) => node.type === "input2");
    if (inputs.length === 0){
        return null;
    }
    let current = nodes.reduce((acc, el) => el.id === nodeId ? el : acc, null);
    if(current == null){
        return null;
    }
    let body = {}
    let operators = [];
    while (current != null){
        let operator= getOperator(current, nodes, edges);
        if(operator == null){
            break
        }
        if(current.type === "graph_output" || current.type === "graph_filter"){
            body.graph = operator;
        }else{
            operators.push(operator);
        }
        let edge = getEdgeOrNull(edges, current.id, "target");
        if(current.type === "join" || current.type === "merge"){
            let targetEdges = edges.filter((n) => n.target === current.id);
            edge = targetEdges.find((e)=> e.targetHandle.endsWith("target-2"));
        }
        if(edge == null){
            break;
        }
        edges = edges.toSpliced(edges.indexOf(edge), 1);
        current = findNodeById(nodes, edge.source);
    }
    operators = operators.toReversed();
    body.operators = operators;
    if(operators.length === 0 || operators[0].operator !== "input"){
        return null;
    }
    body.dataframe = operators[0].dataframe;
    return body;
}


const callBackend = (nodes, edges, nodeId, update) => {
    const body = parseGraph(nodes, edges, nodeId, update);
    if(body.graph !== undefined) {
        return axios.post("http://localhost:3000/perform-operations-graph/", {data: body})
            .then(response => {
                let newData = response.data;
                newData.type = "graph_output";
                update(newData);
                return newData;
            }).catch((reason)=>{
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: reason
                });
            });
    }else{
        return axios.post("http://localhost:3000/perform-operations/", {data: body})
            .then(response => {
                if (response.status === 500) {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: response.error,
                    });
                    return
                }
                let newData = response.data;
                newData.type = "table";
                update(newData);
                return newData;
            }).catch((error)=>{
                console.log(error)
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: error.response.data.error,
                });
            });
    }
}


const downloadFile = (nodes, edges, nodeId) => {
    const body = parseGraph(nodes, edges, nodeId);
    console.log(body);
    return axios.post("http://localhost:3000/perform-operations-save/", {data: body})
        .then(response => {
            if (response.status === 500) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: response.error,
                });
                return
            }
            console.log(response);
            let file = response.data.csv;
            const blob = new Blob([file], {type: "text/plain;charset=utf-8"});
            SaveAs(blob, "output.csv")
        }).catch((error)=>{
            console.log(error)
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.response.data.error,
            });
        });
}

export {callBackend, exportFlowToJson, downloadFile}

export default exportFlowToJson;