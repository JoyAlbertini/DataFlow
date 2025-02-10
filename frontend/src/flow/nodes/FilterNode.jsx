import React, { memo, useEffect, useState, useRef } from "react";
import PropTypes from 'prop-types';
import { Handle, Position } from "reactflow";
import {Edges} from "../edges/types/utilsEdge.js";
import {useFlow} from "../FlowContext.jsx";
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import {findAllColumns, findDatabase} from "./requests/NodeRequests.js";
import { List as VirtualizedList, AutoSizer } from 'react-virtualized';
import './FilterNode.css';
import {InputLabel} from "@mui/material";

export const createFilterNode = (position) => {
    return {
        id: `${new Date().getTime()}`,
        type: 'filter',
        position,
        data: {
            label: 'Filter',
            value: '',
            edgeSource: Edges.dataframe,
            edgesAccepted: [Edges.dataframe]
        },
    };
};

const FilterNode = memo(({ id, data, isConnectable }) => {

    const [isTyping, setIsTyping] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [typedString, setTypedString] = useState(data.value);
    const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const inputRef = useRef(null);
    const { nodes, edges, handleNodeDataChange } = useFlow();
    const [columns, setColumns] = useState([]);
    const [db, setDb] = useState([]);    
    const [purpleKeyword, setPurpleKeyword] = useState([]);
    const [maxSuggestionWidth, setMaxSuggestionWidth] = useState(200);


    let initialAutocompleteSuggestions = ["NULL"];

    const highlightSyntax = (text) => {
        const escapedKeywords = columns.map((kw) => kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
        const escapedKeywordsPurple = purpleKeyword.map((kw) => kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));

        const regexKeywords = new RegExp(`\\b(${escapedKeywords.join("|")})\\b`, "gi");
        const regexKeywordsPurple = new RegExp(`\\b(${escapedKeywordsPurple.join("|")})\\b`, "gi");

        return text
            .replace(regexKeywords, (match) => `<span style="color: blue; font-weight: bold;">${match}</span>`)
            .replace(regexKeywordsPurple, (match) => `<span style="color: purple; font-weight: bold;">${match}</span>`);
    };

    const inputFocus = async () => {
        setIsFocused(true)
        const columns = await findAllColumns(nodes, edges, id);
        const db = await findDatabase(nodes, edges, id);
        setColumns(columns);
        setPurpleKeyword(["None", "AND", "OR"]);
        setDb(db);
        setAutocompleteSuggestions([ ...initialAutocompleteSuggestions, ...columns]);

        setIsTyping(true);

        db.forEach(async (db) => {
            try {
                const response = await fetch(`http://localhost:3000/suggestQueries/${db}`);
                const data = await response.json();
                setAutocompleteSuggestions(prevSuggestions => [
                    ...prevSuggestions,
                    ...data.queries
                ]);
            } catch (error) {
                console.error("Error fetching suggestions for db:", db, error);
                setAutocompleteSuggestions(initialAutocompleteSuggestions);
            }
        });
    }

    const inputChange = () => {
        const newValue = inputRef.current.innerText;
        setTypedString(newValue);
        data.value = newValue;
        togglePlaceholder(newValue);
        updateSuggestions(newValue);
        setIsTyping(true);
    };

    const togglePlaceholder = (text) => {
        if (text) {
            inputRef.current.classList.remove('placeholder');
        } else {
            inputRef.current.classList.add('placeholder');
        }
    };

    const updateSuggestions = (text) => {
        if (text) {
            const lastWord = text.split(' ').pop();
            const filtered = autocompleteSuggestions.filter((suggestion) =>
                suggestion.toLowerCase().includes(lastWord.toLowerCase())
            );
            setFilteredSuggestions(filtered);
        } else {
            setFilteredSuggestions([]);
        }
    };

    useEffect(() => {
        setTypedString(data.value);
        togglePlaceholder(data.value);
        updateSuggestions(data.value);
    }, [data.value]);

    useEffect(() => {
        if (inputRef.current) {
            const caretPosition = getCaretPosition(inputRef.current);
            inputRef.current.innerHTML = highlightSyntax(typedString);
            setCaretPosition(inputRef.current, caretPosition);
        }
    }, [typedString]);

    const handleSuggestionClick = (suggestion) => {
        replaceLastWordWithSuggestion(suggestion);
        inputRef.current.focus();
        togglePlaceholder(inputRef.current.innerText);
        setCaretToEnd(inputRef.current);
        updateSuggestions(inputRef.current.innerText);
    };

    function onBlur() {
        setIsFocused(false);
        // need timeout
        setTimeout(() => {
            setIsTyping(false);
        }, 2000);
    }

    const replaceLastWordWithSuggestion = (suggestion) => {
        const text = inputRef.current.innerText;
        const words = text.split(' ');
        words.pop();
        const newText = `${words.join(' ')} ${suggestion} `;
        setTypedString(newText);
        data.value = newText;

        // Using document.execCommand to prevent cursor position reset
        inputRef.current.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, newText);
    };

    const setCaretToEnd = (element) => {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        element.focus();
    };

    const getCaretPosition = (element) => {
        let caretOffset = 0;
        const doc = element.ownerDocument || element.document;
        const win = doc.defaultView || doc.parentWindow;
        const sel = win.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
        return caretOffset;
    };

    const setCaretPosition = (element, offset) => {
        const range = document.createRange();
        const sel = window.getSelection();
        const charIndex = { count: 0 };

        const traverseNodes = (node) => {
            if (node.nodeType === 3) {
                const textLength = node.textContent.length;
                if (charIndex.count + textLength >= offset) {
                    range.setStart(node, offset - charIndex.count);
                    return true;
                } else {
                    charIndex.count += textLength;
                }
            } else {
                for (let i = 0; i < node.childNodes.length; i++) {
                    if (traverseNodes(node.childNodes[i])) {
                        return true;
                    }
                }
            }
            return false;
        };

        traverseNodes(element);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        element.focus();
    };

    function renderRow({ index, key, style }) {
        return (
            <ListItem style={style} key={key} component="div" disablePadding>
                <ListItemButton onClick={() => handleSuggestionClick(filteredSuggestions[index])}>
                    <ListItemText className={"suggestion"} primary={filteredSuggestions[index]}/>
                </ListItemButton>
            </ListItem>
        );
    }

    return (
        <div style={{position: 'relative'}}>
            <div className='node'>
                <Handle
                    type="target"
                    id={`${id}-target-1`}
                    position={Position.Left}
                    style={{background: '#555'}}
                    isConnectable={isConnectable}
                />
                <InputLabel variant="standard">
                    Filter
                </InputLabel>
                <div style={{position: 'relative', minWidth: '200px'}}>
                    <div
                        ref={inputRef}
                        contentEditable
                        style={{
                            ...textfieldStyle,
                            ...(isFocused ? focusStyle : {})
                        }}
                        onFocus={inputFocus}
                        onInput={inputChange}
                        onBlur={onBlur}
                        spellCheck="false"
                        className="placeholder"
                        data-placeholder="Enter your filter query..."
                    />
                </div>
                <Handle
                    type="source"
                    id={`${id}-source-1`}
                    position={Position.Right}
                    style={{background: '#555'}}
                    isConnectable={isConnectable}
                />
            </div>
            <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1,
            }}>
                {isTyping && filteredSuggestions.length > 0 && (
                    <AutoSizer disableHeight>
                        {({width}) => (
                            <VirtualizedList
                                persistentScrollbar={true}
                                className={'suggestions'}
                                height={200}
                                width={500}
                                rowCount={filteredSuggestions.length}
                                rowHeight={40}
                                rowRenderer={renderRow}
                            />
                        )}
                    </AutoSizer>
                )}
            </div>
        </div>
    )
});

FilterNode.propTypes = {
    id: PropTypes.string.isRequired,
    data: PropTypes.shape({
        value: PropTypes.string
    }).isRequired,
    isConnectable: PropTypes.bool.isRequired
};

export default FilterNode;

const textfieldStyle = {
    width: '100%',
    padding: '6px 0 7px',
    marginTop: '0px',
    marginBottom: '2px',
    boxSizing: 'border-box',
    borderBottom: '1px solid rgba(0, 0, 0, 0.42)',
    borderRadius: '0px',
    outline: 'none',
    fontSize: '1rem',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    lineHeight: '1.4375em',
    transition: 'border-bottom-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
};

const focusStyle = {
    borderBottom: '2px solid',
};
