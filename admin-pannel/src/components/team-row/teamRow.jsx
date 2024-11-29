import { Box, Checkbox, Container, Grid2, Paper, Typography } from "@mui/material";
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
            padding: "0.5rem",
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
                    <Box component="img" src={team.teamLogo} sx={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                    }}></Box>
                </Grid2>
            
                {/* Team Name */}
                <Grid2 size={{xs: 2, md: 3}}>{team.name}</Grid2>
            
                {/* Team Lead */}
                <Grid2 size={4} sx={{
                    height: "3rem",
                    display: "flex",
                    gap: "1rem",
                }}>
                    { (team.teamLead.map((lead, idx) => {
                        return (
                            <Grid2 key={idx} container sx={{
                                height: "100%",
                                alignItems: "center",
                                gap: "1rem",
                            }}>
                                <Box component="img" src={lead.profilePicture} sx={{
                                    height: "100%",
                                }}></Box>
                                <Typography>{lead.name}</Typography>
                            </Grid2>
                        );
                    })) }
                </Grid2>
                {/* Discord Role */}
                <Grid2 size={2}>
                    <Typography>{team.discordId}</Typography>
                </Grid2>
            </Grid2>
        </Paper>
    );
}

export default TeamRow;