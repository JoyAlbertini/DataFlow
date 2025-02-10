import React, { useState, useEffect } from 'react';
import {TextField, Box, Chip, Typography} from "@mui/material";
import {findAllColumns} from "../requests/NodeRequests.js";
import {useFlow} from "../../FlowContext.jsx";


function extractColumnsWithPositions(query, knownColumns) {
    const normalizedQuery = query.toLowerCase();
    const parts = [];
    let lastIndex = 0;
    knownColumns.forEach(column => {
        const columnLower = column.toLowerCase();
        let index = normalizedQuery.indexOf(columnLower, lastIndex);
        while (index !== -1) {
            if (index > lastIndex) {
                parts.push({ text: query.substring(lastIndex, index), isChip: false });
            }
            parts.push({ text: query.substring(index, index + column.length), isChip: true });
            lastIndex = index + column.length;
            index = normalizedQuery.indexOf(columnLower, lastIndex);
        }
    });
    if (lastIndex < query.length) {
        parts.push({ text: query.substring(lastIndex), isChip: false });
    }
    return parts;
}

const PandasParser = ({ onQueryChange, id}) => {
    const [query, setQuery] = useState('');
    const [parsedQuery, setParsedQuery] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const [availableColumns, setAvailableColumns] = useState([]);
    const [columnsFetched, setColumnsFetched] = useState(false);

    const { nodes, edges } = useFlow();

    const fetchColumns = async () => {
        if (!columnsFetched) {
            try {
                const columns = await findAllColumns(nodes, edges, id);
                setAvailableColumns(columns);
                setColumnsFetched(true);  // Mark as fetched to prevent refetching
            } catch (error) {
                console.error('Error fetching columns:', error);
                setAvailableColumns([]); // Set to empty if there's an error
            }
        }
    };

    const { handleNodeDataChange } = useFlow();

    useEffect(() => {
        if (onQueryChange) {
            onQueryChange(query);
        }
    }, [query, availableColumns, onQueryChange]);

    const handleInputChange = (event) => {
        setQuery(event.target.value);
        setParsedQuery(extractColumnsWithPositions(query, availableColumns));
        handleNodeDataChange(id)
    };

    const handleFocus = () => {
        setIsActive(true);
        fetchColumns(); // Fetch columns on focus
    };

    return (
        <Box sx={{ maxWidth: '600px', position: 'relative' }}>
            <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.54)', marginBottom: '5px' }}>Filter</Typography>
            {(isActive || query === '') && (
                <TextField
                    fullWidth
                    variant="standard"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Enter text"
                    onBlur={() => setIsActive(false)}
                    onFocus={handleFocus}  // Handle focus event
                    onMouseEnter={() => setIsActive(true)}
                    onMouseLeave={() => setIsActive(query !== '')}
                />
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, marginTop: (isActive || query === '') ? '8px' : '0px' }}
                 onMouseEnter={() => setIsActive(true)}
                 onMouseLeave={() => setIsActive(false)}>
                {parsedQuery.map((part, index) => (
                    part.isChip ? <Chip key={index} label={part.text} color="primary" /> : <span key={index}>{part.text} </span>
                ))}
            </Box>
        </Box>
    );
};

export default PandasParser;