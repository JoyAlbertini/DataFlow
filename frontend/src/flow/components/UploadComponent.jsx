import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import Alert from '@mui/material/Alert';


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function UploadDialog({ open, handleClose }) {
    const [files, setFiles] = useState([]);
    const [totalSize, setTotalSize] = useState(0);

    const [alertInfo, setAlertInfo] = useState({ open: false, message: '' });

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
        },
        onDrop: (acceptedFiles, fileRejections) => {
            const duplicates = acceptedFiles.filter(file =>
                files.some(f => f.path === file.path)
            );

            const newFiles = acceptedFiles.filter(file =>
                !files.some(f => f.path === file.path)
            );

            if (duplicates.length > 0) {
                setAlertInfo({
                    open: true,
                    message: `Some files not added because they already exist: ${duplicates.map(f => f.path).join(', ')}`
                });
            }

            const newSize = newFiles.reduce((total, file) => total + file.size, totalSize);
            if (newSize <= 4294967296) { // 4GB in bytes
                const updatedFiles = [...files, ...newFiles.map(file => ({
                    path: file.path,
                    size: file.size
                }))];
                setFiles(updatedFiles);
                setTotalSize(newSize);
            } else {
                setAlertInfo({
                    open: true,
                    message: `Some files not added because the total size exceeds 4GB limit.`
                });
            }
        }
    });

    const handleCloseAlert = () => {
        setAlertInfo({ ...alertInfo, open: false });
    };


    const handleRemoveFile = (filePath) => {
        const updatedFiles = files.filter(file => file.path !== filePath);
        const newSize = updatedFiles.reduce((total, file) => total + file.size, 0);
        setFiles(updatedFiles);
        setTotalSize(newSize);
    };

    function formatFileSize(bytes) {
        const KB = 1024;
        const MB = KB * 1024;
        const GB = MB * 1024;

        if (bytes < KB) return bytes + ' bytes';
        else if (bytes < MB) return (bytes / KB).toFixed(2) + ' KB';
        else if (bytes < GB) return (bytes / MB).toFixed(2) + ' MB';
        else return (bytes / GB).toFixed(2) + ' GB';
    }


    return (
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
        >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                Upload a file
            </DialogTitle>
            <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <center>
                    <CloseIcon />
                </center>
            </IconButton>
            <DialogContent dividers>
                {alertInfo.open && (
                    <Alert severity="warning" onClose={handleCloseAlert}>
                        {alertInfo.message}
                    </Alert>
                )}
                <div style={{width:'1200px'}}></div>
                <div {...getRootProps({ style: { border: '2px dashed gray', padding: '20px', cursor: 'pointer' } })}>
                    <input {...getInputProps()} />
                    <Typography gutterBottom>
                        Drag 'n' drop some files here, or click to select files
                    </Typography>
                    <CloudUploadIcon style={{ fontSize: 30 }} />
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {files.map(file => (
                        <div key={file.path} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0' }}>
                            <Typography>
                                {file.path} - {formatFileSize(file.size)}
                            </Typography>
                            <IconButton onClick={() => handleRemoveFile(file.path)} size="small">
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    ))}
                </div>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={handleClose}>
                    Save changes
                </Button>
            </DialogActions>
        </BootstrapDialog>
    );
}

export default UploadDialog;
