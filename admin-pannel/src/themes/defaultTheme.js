// primaryTheme.js
// Manages the primary theme for the entire app

import { createTheme, responsiveFontSizes } from "@mui/material";

import '@fontsource/inter'; // Defaults to weight 400
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// TODO: THIS IS JUST THE EXAMPLE COPIED FROM ANOTHER ONE OF OUR PROJECTS, CHANGE THIS THO, THIS THEME IS SHIT I ONLY COPIED IT FOR THE SYNTAX

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
            main: '#ff5aa7', // From --title-gradient start
            light: '#f7a059', // From --title-gradient end
            dark: '#ff5aa7',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#4cb6fd', // From --team-header-gradient start
            light: '#4bff93', // From --team-header-gradient end
            dark: '#4cb6fd',
            contrastText: '#ffffff',
        },
        background: {
            default: '#101010', // From body background gradient start
            paper: '#232323', // From body background gradient end
        },
        text: {
            primary: '#ffffff', // From --text-color
            secondary: '#88cded', // From --p-color
        },

        appBar: {
            background: 'linear-gradient(to right, #ff5aa7, #f7a059)',
        },

        mobileAppBarBurgerMenu: {
            background: '#1f1f1f',
            listBackground: '#2b2b2b',
            iconColor: '#fff',
        }
    },
    typography: {
        fontFamily: 'Arial, sans-serif',
        h1: {
            fontFamily: 'Inter, Arial, sans-serif',
            fontWeight: 700,
            fontSize: '2.95rem',
            background: 'linear-gradient(to right, #ff5aa7, #f7a059)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
        },
        h2: {
            fontFamily: 'Inter, Arial, sans-serif',
            fontWeight: 600,
            fontSize: '2.45rem',
            background: 'linear-gradient(to right, #4cb6fd, #4bff93)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
        },
        h3: {
            fontFamily: 'Inter, Arial, sans-serif',
            fontWeight: 500,
            fontSize: '1.75rem',
            background: 'linear-gradient(to right, #38f4d8, #2ebac6)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
        },
        h4: {
            fontFamily: 'Inter, Arial, sans-serif',
            color: '#38f4d8',
            fontWeight: 400,
            fontSize: '1.75rem',
        },
        h5: {
            fontFamily: 'Inter, Arial, sans-serif',
            color: '#2ebac6',
            fontWeight: 400,
            fontSize: '1.5rem',
        },
        h6: {
            fontFamily: 'Inter, Arial, sans-serif',
            color: '#2ebac6',
            fontWeight: 400,
            fontSize: '1.25rem',
        },
        body1: {
            fontFamily: 'Arial, sans-serif',
            fontSize: '1.12rem',
        },
        body2: {
            fontFamily: 'Arial, sans-serif',
            fontSize: '1.12rem',
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
                containedPrimary: {
                    background: 'linear-gradient(to right, #ff5aa7, #f7a059)',
                    backgroundSize: '500% 500%',
                    animation: 'movingGradient 15s linear infinite alternate',
                },
                containedSecondary: {
                    background: 'linear-gradient(to right, #ff9a76, #ffcd56)',
                },
                link: { // a button styled to look like a link
                    '&:hover': {
                        backgroundColor: "transparent",
                    },
                    padding: 0,
                    color: "#2ebac6",
                }
            },
        },
    },
});

theme = responsiveFontSizes(theme);

export { theme };