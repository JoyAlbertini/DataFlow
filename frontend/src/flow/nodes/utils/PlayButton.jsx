import React from 'react';
import IconButton from '@mui/material/IconButton';
import PlayCircleFilledOutlinedIcon from '@mui/icons-material/PlayCircleFilledOutlined';

const CustomIconButton = ({ onClick }) => {
    return (
        <IconButton
            aria-label="play"
            color="primary"
            style={{
                fontSize: '20px',
                padding: '2px',
                marginLeft: '5px'
            }}
            onClick={onClick}
        >
            <PlayCircleFilledOutlinedIcon style={{ fontSize: '1.2rem' }} />
        </IconButton>
    );
};

export default CustomIconButton;