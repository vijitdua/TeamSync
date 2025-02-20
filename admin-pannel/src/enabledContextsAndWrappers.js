import ThemeWrapper from "./wrappers/ThemeWrapper";
import AuthRedirectWrapper from "./wrappers/AuthRedirectWrapper";
import {AuthProvider} from "./contexts/authContextProvider";
import {DialogProvider} from "./contexts/dialogProvider";
import {GlobalFeedbackSnackbarProvider} from "./contexts/globalFeedbackSnackbarProvider";
import { BrowserRouter } from "react-router-dom";

function enabledContextsAndWrappers({children}) {
    return (
        <>
            <ThemeWrapper>
                <AuthProvider>
                    <BrowserRouter>
                        <AuthRedirectWrapper>
                            <GlobalFeedbackSnackbarProvider>
                                <DialogProvider>
                                    {children}
                                </DialogProvider>
                            </GlobalFeedbackSnackbarProvider>
                        </AuthRedirectWrapper>
                    </BrowserRouter>
                </AuthProvider>
            </ThemeWrapper>
        </>
    );
}

export default enabledContextsAndWrappers;
