export function findConnectedInput(nodes, edges, startNodeId) {
    if (!nodes.some(node => node.id === startNodeId)) {
        return { input2Nodes: [], allTraversedNodes: [], edges: [] };
    }

    let queue = [startNodeId];
    let visited = new Set();
    let inputNodes = [];
    let allTraversedNodes = [];
    let traversedEdges = [];
    const nodeMap = new Map(nodes.map(node => [node.id, node]));

    while (queue.length > 0) {
        const nodeId = queue.shift();

        if (visited.has(nodeId)) {
            continue;
        }

        visited.add(nodeId);
        const currentNode = nodeMap.get(nodeId);

        if (currentNode) {
            allTraversedNodes.push(currentNode);

            if (currentNode.type === 'input2') {
                inputNodes.push(currentNode);
            }

            const incomingEdges = edges.filter(edge => edge.target === currentNode.id);

            incomingEdges.forEach(edge => {
                if (!visited.has(edge.source)) {
                    queue.push(edge.source);
                    traversedEdges.push(edge);
                }
            });
        }
    }

    return {inputNodes: inputNodes, nodes: allTraversedNodes, edges: traversedEdges };
}
