import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import {createTheme} from "@mui/material/styles";
import {ThemeProvider} from "@mui/material";
import App from "./App.jsx";

const theme = createTheme({
    palette: {
        primary: {
            main: '#2bda52',  // Example primary color
            light: '#757ce8', // Lighter shade of the primary color
            dark: '#002884',  // Darker shade of the primary color
            contrastText: '#fff', // Text color that contrasts with the primary color
        },
    },
});


const root = createRoot(document.getElementById("root"));
root.render(
    <ThemeProvider theme={theme}>
         <App />
    </ThemeProvider>
);