import {CssBaseline, ThemeProvider} from "@mui/material";
import {theme} from "../themes/defaultTheme";

function ThemeWrapper({children}) {
    const {currentTheme} = theme;

    return (
        <ThemeProvider theme={currentTheme}>
            <CssBaseline/>
            {children}
        </ThemeProvider>
    );
}

export default ThemeWrapper;
