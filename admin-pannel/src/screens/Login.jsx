import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import Stack from '@mui/material/Stack';
import { useState } from "react";
import { auth } from "../services/auth";
import { routes } from "../config/routesConfig";
import { useNavigate } from "react-router-dom";

// call auth function to attempt login
// successful login sends cookie back for future requests
// todo: add check to see if successful login, if so, redirect


// todo: improve this layout it's really meh
function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);

    function handleSubmit(username, password) {
        auth(username, password)
            .then((isLoggedIn) => {
                if (isLoggedIn) {
                    navigate(routes.home);
                }
            })
            .catch((error) => {
                console.error("error occurred:", error.message);
            });
    }

    return(
        <Container maxWidth="md" sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
        }}>
            <Stack spacing={6}>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}>
                    <Typography variant="h2">
                        {process.env.REACT_APP_COMPANY_NAME}'s
                    </Typography>
                    <Typography variant="h1" gutterBottom>Team Sync</Typography>  {/* placeholder for banner */}
                </Box>
                <Paper maxWidth="xs" sx={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "1rem",
                    minWidth: "50%",
                    width: "20rem",
                    textAlign: "center",
                }}>
                    <Stack spacing={2}>
                        <Typography variant="h3" gutterBottom>Log in to access</Typography>
                        <TextField 
                            label="Username" 
                            variant="outlined" 
                            required 
                            onChange={(event) => {
                                setUsername(event.target.value);
                            }}
                        />
                        <TextField 
                            label="Password" 
                            variant="outlined" 
                            type="password"
                            required 
                            onChange={(event) => {
                                setPassword(event.target.value);
                            }}
                        />
                        <Button 
                            variant="contained"
                            onClick={() => handleSubmit(username, password) }
                        >LOG IN</Button>
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}

export default Login;