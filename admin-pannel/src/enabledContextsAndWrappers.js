import ThemeWrapper from "./wrappers/ThemeWrapper";
import AuthRedirectWrapper from "./wrappers/AuthRedirectWrapper";
import {AuthProvider} from "./contexts/authContextProvider";
import {DialogProvider} from "./contexts/dialogProvider";
import {GlobalFeedbackSnackbarProvider} from "./contexts/globalFeedbackSnackbarProvider";

function enabledContextsAndWrappers({children}) {
    return (
        <>
            <ThemeWrapper>
                <AuthProvider>
                    <AuthRedirectWrapper>
                        <GlobalFeedbackSnackbarProvider>
                            <DialogProvider>
                                {children}
                            </DialogProvider>
                        </GlobalFeedbackSnackbarProvider>
                    </AuthRedirectWrapper>
                </AuthProvider>
            </ThemeWrapper>
        </>
    );
}

export default enabledContextsAndWrappers;
