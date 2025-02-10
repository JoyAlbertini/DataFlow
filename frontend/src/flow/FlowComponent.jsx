import React, {useCallback, useRef, useState} from 'react';
import ReactFlow, {addEdge, Background, Controls, ReactFlowProvider, useEdgesState, useNodesState,} from 'reactflow';
import 'reactflow/dist/style.css';


import Sidebar from './Sidebar.jsx';

import './index.css';
import {FlowProvider} from './FlowContext';
import exportFlowToJson, {callBackend, downloadFile} from "./save/export.js";
import joinNode, {createJoinNode} from "./nodes/JoinNode.jsx";
import groupByNode, {createGroupByNode} from "./nodes/GroupByNode.jsx";
import filterNode, {createFilterNode} from "./nodes/FilterNode.jsx";
import outputNode, {createOutputNode} from "./nodes/OutputNode";
import inputNode, {createInputNode} from "./nodes/InputNode.jsx";
import {Edges} from "./edges/types/utilsEdge.js";
import {dataFrameEdge} from "./edges/dataframeEdge.jsx";
import {groupByDataframeEdge} from "./edges/groupByDataframeEdge.jsx";
import graphOutputNode, {createGraphOutputNode} from "./nodes/GraphNodes/GraphOutputNode.jsx";
import {findConnectedInput} from "./flowQueries/FlowQueries.js";
import dropNode, {createDropNode} from "./nodes/DropNode.jsx";
import mergeNod, {createMergeNode} from './nodes/MergeNode.jsx';
import graphFilterNode, {createGraphFilter} from "./nodes/GraphNodes/GraphFilter.jsx";
import sortNode, {createSortNode} from "./nodes/SortNode.jsx";
import exportNode, {createExportNode} from "./nodes/ExportNode.jsx";

const INITIAL_POS = { x: 250, y: 5 };

const initialNodes = [createInputNode(INITIAL_POS)];

const nodeTypes = {
    input2: inputNode,
    output2: outputNode,
    filter: filterNode,
    groupBy : groupByNode,
    join: joinNode,
    graph_output: graphOutputNode,
    graph_filter: graphFilterNode,
    drop: dropNode,
    merge: mergeNod,
    sort: sortNode,
    export: exportNode
};


const DnDFlow = (data) => {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [queryEdges, setQueryEdges] = useState(null);
    const [queryNodes, setQueryNodes] = useState(null);


    const onConnect = useCallback((params) => {
        let edge = edge => edge.target === params.target && edge.targetHandle === params.targetHandle;
        const existingConnection = edges.some(edge);
        if (!existingConnection) {
            const sourceNode = nodes.find(node => node.id === params.source);
            const targetNode = nodes.find(node => node.id === params.target);

            if (!sourceNode || !targetNode) {
                console.error('Source or target node not found.');
                return;
            }
            if (!targetNode.data.edgesAccepted.includes(sourceNode.data.edgeSource)) {
                console.error('Incompatible types');
                return;
            }

            let newEdge = null;
            switch (sourceNode.data.edgeSource) {
                case Edges.dataframe:
                    newEdge = dataFrameEdge(params)
                    break;
                case Edges.groupByDataframe:
                    newEdge = groupByDataframeEdge(params)
                    break;
                default:
                    console.log('Unknown edge type');
                    return;
            }

            if (newEdge) {
                setEdges(eds => addEdge(newEdge, eds));
            }
        } else {
            console.log('This handle can only accept one connection.');
        }
    }, [nodes, edges, setEdges]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            let newNode;
            switch (type) {
                case 'input':
                    newNode = createInputNode(position);
                    break;
                case 'output':
                    newNode = createOutputNode(position);
                    break;
                case 'filter':
                    newNode = createFilterNode(position);
                    break;
                case 'groupBy':
                    newNode = createGroupByNode(position);
                    break;
                case 'join':
                    newNode = createJoinNode(position);
                    break;
                case "graph_output":
                    newNode = createGraphOutputNode(position);
                    break;
                case "drop":
                    newNode = createDropNode(position);
                    break;
                case "merge":
                    newNode = createMergeNode(position);
                    break;
                case "sort":
                    newNode = createSortNode(position);
                    break;
                case 'graph_filter':
                    newNode = createGraphFilter(position);
                    break;
                case 'export':
                    newNode = createExportNode(position);
                    break;
                default:
                    return;
            }

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance],
    );

    const getFlow = () => {
        console.log(exportFlowToJson(nodes, edges));
    };


    const backendRequest = async (nodeId, method) =>{
        makeEdgesNotAnimated();
        let res = findConnectedInput(nodes, edges, nodeId);
        setQueryEdges(res.edges);
        setQueryNodes(res.nodes);
        makeEdgesAnimated(res.edges);
        return await method();
    }


    const getOutput = async (nodeId) => {
        return backendRequest(nodeId, () => callBackend(nodes, edges, nodeId, data.update));
    }

    const exportDataframe = async (nodeId) => {
        return backendRequest(nodeId, () => downloadFile(nodes, edges, nodeId));
    }

    const makeEdgesAnimated = (edges) => {
        if (edges === null) {
            return;
        }
        edges.map(edge => {edge.animated = true; edge.style = { stroke: 'lightgreen', strokeWidth: 2.4 }});
        setEdges((currentEdges) => replaceEdges(currentEdges, edges));
    };

    const makeEdgesNotAnimated = () => {
        if (queryEdges !== null) {
            //TODO handle colors if multiple node type
            queryEdges.map(edge => {edge.animated = false; edge.style = {stroke: 'black', strokeWidth: 1}});
            setEdges((currentEdges) => replaceEdges(currentEdges, queryEdges));
            setQueryEdges(null);
        }
    };

    const replaceEdges = (currentEdges, newEdges) => {
        const newEdgesIds = newEdges.map(edge => edge.id);
        return currentEdges.map(edge => {
            if (newEdgesIds.includes(edge.id)) {
                return newEdges.find(newEdge => newEdge.id === edge.id);
            }
            return edge;
        });
    };

    const onNodesDelete = useCallback((deletedNodes) => {
        const nodeIdsToDelete = deletedNodes.map(node => node.id);
        if (queryNodes !== null) {
            const nodeInQueryNodes = nodeIdsToDelete.some(nodeId => queryNodes.some(queryNode => queryNode.id === nodeId));

            if (nodeInQueryNodes) {
                makeEdgesNotAnimated();
            }
        }

        setNodes((nds) => nds.filter((node) => !nodeIdsToDelete.includes(node.id)));
    }, [queryNodes]);

    const onEdgesDelete = useCallback((deletedEdges) => {
        const edgeIdsToDelete = deletedEdges.map(edge => edge.id);
        if (queryEdges !== null) {
            const edgeInQueryEdges = edgeIdsToDelete.some(edgeId => queryEdges.some(queryEdge => queryEdge.id === edgeId));

            if (edgeInQueryEdges) {
                makeEdgesNotAnimated();
            }
        }

        setEdges((eds) => eds.filter((edge) => !edgeIdsToDelete.includes(edge.id)));
    }, [queryEdges]);


    const handleNodeDataChange = (nodeId) => {
        if (queryNodes !== null) {
            const isQueryNode = queryNodes.some(queryNode => queryNode.id === nodeId);
            if (isQueryNode) {
                makeEdgesNotAnimated();
            }
        }
    };

    return (
        <FlowProvider value={{ nodes, edges, setNodes, setEdges, getFlow, getOutput, handleNodeDataChange, exportDataframe }}>
        <div className="dndflow">
            <ReactFlowProvider>
                <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onNodesDelete={onNodesDelete}
                        onEdgesDelete={onEdgesDelete}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        fitView

                    >
                        <Controls/>
                        <Background variant="lines" />
                    </ReactFlow>

                </div>
                <Sidebar/>
            </ReactFlowProvider>
        </div>
        </FlowProvider>
    );
};

export default DnDFlow;

