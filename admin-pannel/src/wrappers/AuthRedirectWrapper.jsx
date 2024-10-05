import {useEffect} from "react";
import {routes} from "../config/routesConfig";
import {useAuth} from "../contexts/authContextProvider";
import {useNavigate} from "react-router-dom";

function AuthRedirectWrapper({children}){
    const {isLoggedIn} = useAuth();
    const navigate = useNavigate();

    // Redirects to login page if the user is not authenticated.
    useEffect(() => {
        if (!isLoggedIn) {
            console.log("User is not logged in");
            console.log("Navigating to login page")
            navigate(routes.login);
        }
    }, [isLoggedIn, navigate]);

    return (
        <>
            {children}
        </>
    );
}

export default AuthRedirectWrapper;
