import { Box, Container, List, ListItemButton, ListItemText, Stack, Typography, useTheme } from "@mui/material";
import { routes } from "../config/routesConfig";
import { useNavigate } from "react-router-dom";
import TeamEditPanel from "../components/team-edit-panel/teamEditPanel";

function MainLayout({children, teamEditing}){
    const navigate = useNavigate();
    const theme = useTheme();

    const navOptions = [
        {
            name: "Members",
            route: routes.members,
        },
        {
            name: "Teams",
            route: routes.teams,
        },
        {
            name: "Deleted Members",
            route: routes.deletedMembers,
        },
        {
            name: "Deleted Teams",
            route: routes.deletedTeams,
        },
        {
            name: "Logout",
        }
    ];

    function handleNavClick(route) {
        if (route) {
            navigate(route);
        } else {
            // TODO: MAKE THIS ACTUALLY LOG OUT
            navigate(routes.login);
        }
    }
    
    return (
        <Box sx={{
            display: "flex",
            minHeight: "100vh",
        }}>
            <Stack spacing={10} variant="sidebar">
                <Typography variant="h1" gutterBottom onClick={() => navigate(routes.home)} sx={{ cursor: "pointer" }}>Team Sync</Typography>  {/* placeholder for image */}
                <List sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}>
                    { navOptions.map((option, idx) => {
                        return (
                            <ListItemButton key={ idx } onClick={() => handleNavClick(option.route)}>
                                <ListItemText>{ option.name }</ListItemText>
                            </ListItemButton>
                        );
                    }) }
                </List>
            </Stack>
            <Stack variant="content-wrapper" sx={{
                padding: "2rem",
            }}>
                <Typography variant="h1" gutterBottom>{process.env.REACT_APP_COMPANY_NAME}</Typography>
                <Container sx={{
                    flex: "1",
                }}>{children}</Container>
                <Typography variant="body2">developed by Naomi & Vijit @ TeamSync</Typography>
            </Stack>
            { teamEditing !== null && <TeamEditPanel teamEditing={teamEditing}></TeamEditPanel> }
        </Box>
    );
}

export default MainLayout;
