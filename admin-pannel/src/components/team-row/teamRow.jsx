import { Box, Checkbox, Grid2, Paper, Typography } from "@mui/material";
import { useState } from "react";


function TeamRow({team, onToggleSelect}) {
    const [isSelected, setIsSelected] = useState(false);

    function toggleSelect() {
        setIsSelected(!isSelected);
        onToggleSelect();
    }

    return (
        <Paper variant="outlined" sx={{
            backgroundColor: isSelected ? "#e9eeff" : "#d6ddf9",
        }}>
            <Grid2 container spacing={2} sx={{
                alignItems: "center",
            }}>
                {/* Checkbox */}
                <Grid2 size={0.5} sx={{
                    display: "flex",
                    justifyContent: "center",
                }}>
                    <Checkbox onChange={ toggleSelect }></Checkbox>
                </Grid2>
                
                {/* Logo */}
                <Grid2 size={{xs: 2, md: 1}} sx={{
                    height: "3rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <Box component="img" src="/logo192.png" sx={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                    }}></Box>
                </Grid2>
            
                {/* Team Name */}
                <Grid2 size={{xs: 2, md: 3}}>{team.name}</Grid2>
            
                {/* Team Lead */}
                <Grid2 size={4}>
                    { (team.teamLead.map((leadId, idx) => {
                        return (
                            <Typography key={idx}>{leadId}</Typography>
                        );
                    })) }
                </Grid2>
                {/* Discord Role */}
                <Grid2 size={2}>
                    <Typography>@roleName</Typography>
                </Grid2>
            </Grid2>
        </Paper>
    );
}

export default TeamRow;