import axios from 'axios';
import {findConnectedInput} from "../../flowQueries/FlowQueries.js";

export const fetchColumns = (dataFrameNames, operation="union") => {
    return axios.post('http://localhost:3000/columns', {
        df_names: dataFrameNames,
        method: operation
    })
        .then(response => {
            return response.data.columns_names;
        })
        .catch(error => {
            console.error('Error fetching columns:', error);
            return [];
        });
};

export async function findAllColumns(nodes, edges, id, operation="union") {
    const connectedNodeData = findConnectedInput(nodes, edges, id).inputNodes.map(node => node.data.value);
    const uniqueConnectedNodeData = Array.from(new Set(connectedNodeData));
    if (uniqueConnectedNodeData.length === 0) {
        return [];
    }
    try {
        let columns = await fetchColumns(uniqueConnectedNodeData, operation);
        columns.push("Count", "Count unique", "Max", "Min", "Mean", "Std");
        return columns.toSorted();
    } catch (error) {
        console.error('Error in fetching columns:', error);
        return [];
    }
}

export async function findDatabase(nodes, edges, id) {
    const connectedNodeData = findConnectedInput(nodes, edges, id).inputNodes.map(node => node.data.value);
    const uniqueConnectedNodeData = Array.from(new Set(connectedNodeData));
    if (uniqueConnectedNodeData.length === 0) {
        return [];
    }
    try {
        return uniqueConnectedNodeData;
    } catch (error) {
        console.error('Error in fetching database');
        return [];
    }
}

