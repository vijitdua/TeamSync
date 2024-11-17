// defaultTheme.js
// Manages the primary theme for the entire app

import { createTheme, responsiveFontSizes } from "@mui/material";

import '@fontsource/inter'; // Defaults to weight 400
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// todo: actually decide on a theme lol this is just random shit

let theme = createTheme({
    breakpoints: {
        values: {
            xs: 0,     // Extra-small devices (small phones)
            sm: 750,   // Small devices (mobiles)
            md: 1050,  // Medium devices (tablets)
            lg: 1280,  // Large devices (desktops)
            xl: 1920,  // Extra-large devices (very large screens)
        },
    },

    palette: {
        primary: {
            main: '#5d5aff', // discord icon-like shade lmao
            light: '#827fff', 
            dark: '#3632d1',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#4cb6fd', // leftover from icarus alpha website
            light: '#4bff93', 
            dark: '#4cb6fd',
            contrastText: '#000000',
        },
        background: {
            default: '#ccd6f8', // light purplish blue idk??
            paper: '#FFFFFF', // white
        },
        text: {
            primary: '#000000', // white
            // secondary: '#000000', // idk
        },
    },
    typography: {
        fontFamily: 'Arial, sans-serif',
        h1: {
            fontFamily: 'Inter, Arial, sans-serif',
            fontWeight: 700,
            fontSize: '2.125rem',
        },
        h2: {
            fontFamily: 'Inter, Arial, sans-serif',
            fontWeight: 600,
            fontSize: '1.875rem',
        },
        h3: {
            fontFamily: 'Inter, Arial, sans-serif',
            fontWeight: 500,
            fontSize: '1.5rem',
        },
        h4: {
            fontFamily: 'Inter, Arial, sans-serif',
            fontWeight: 400,
            fontSize: '1.25rem',
        },
        h5: {
            fontFamily: 'Inter, Arial, sans-serif',
            fontWeight: 400,
            fontSize: '1.125rem',
        },
        h6: {
            fontFamily: 'Inter, Arial, sans-serif',
            fontWeight: 400,
            fontSize: '1rem',
        },
        body1: {
            fontFamily: 'Arial, sans-serif',
            fontSize: '1rem',
        },
        body2: {
            fontFamily: 'Arial, sans-serif',
            fontSize: '1rem',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    fontWeight: 'bold',
                    textTransform: 'none',
                    borderRadius: '5px',
                    padding: '10px 20px',
                    fontSize: '1em',
                    marginRight: '11px',
                    transition: 'transform 0.3s ease',
                },
                link: { // a button styled to look like a link
                    '&:hover': {
                        backgroundColor: "transparent",
                    },
                    padding: 0,
                }
            },
        },
    },
});

theme = responsiveFontSizes(theme);

export { theme };