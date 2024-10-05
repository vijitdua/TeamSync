import ThemeWrapper from "./wrappers/ThemeWrapper";
import AuthRedirectWrapper from "./wrappers/AuthRedirectWrapper";
import {AuthProvider} from "./contexts/authContextProvider";

function enabledContextsAndWrappers({children}) {
    return (
        <>
            <ThemeWrapper>
                <AuthProvider>
                    <AuthRedirectWrapper>
                        {children}
                    </AuthRedirectWrapper>
                </AuthProvider>
            </ThemeWrapper>
        </>
    );
}

export default enabledContextsAndWrappers;
