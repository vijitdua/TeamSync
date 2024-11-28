import { Box, List, ListItemButton, ListItemText, Stack, Typography, useTheme } from "@mui/material";
import { routes } from "../config/routesConfig";

function MainLayout({children}){
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

    const theme = useTheme();
    return (
        <Box sx={{
            display: "flex",
            minHeight: "100vh",
        }}>
            <Stack spacing={10} variant="sidebar">
                <Typography variant="h1" gutterBottom>Team Sync</Typography>  {/* placeholder for image */}
                <List sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}>
                    { navOptions.map((option, idx) => {
                        return (
                            <ListItemButton key={ idx }>
                                <ListItemText>{ option.name }</ListItemText>
                            </ListItemButton>
                        );
                    }) }
                </List>
            </Stack>
            <Stack>
                <Typography variant="h1" gutterBottom>{process.env.REACT_APP_COMPANY_NAME}</Typography> 
                {children}
                <Typography variant="body2">developed by Naomi & Vijit @ TeamSync</Typography>
            </Stack>
        </Box>
    );
}

export default MainLayout;
