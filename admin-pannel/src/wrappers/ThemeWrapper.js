import {CssBaseline, ThemeProvider} from "@mui/material";
import {theme} from "../themes/defaultTheme";

function ThemeWrapper({children}) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            {children}
        </ThemeProvider>
    );
}

export default ThemeWrapper;
