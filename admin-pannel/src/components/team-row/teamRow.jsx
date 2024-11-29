import { Box, Checkbox, Container, Grid2, Paper, TableCell, TableRow, Typography } from "@mui/material";
import { useState } from "react";


function TeamRow({team, onToggleSelect, isSelectMode}) {
    const [isSelected, setIsSelected] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    function toggleSelect() {
        setIsSelected(!isSelected);
        onToggleSelect();
    }

    return (
        <TableRow sx={{
            "& td": {
              borderBottom: "1px solid #a9b8ec",
              padding: "0",
            },
            backgroundColor: (isSelected || isHovered)? "#bbc8f3" : "transparent",
        }}
        onMouseOver={() => {
            setIsHovered(true);
        }}
        onMouseOut={() => {
            setIsHovered(false);
        }}
        >
            {/* Checkbox */}
            <TableCell align="center" sx={{
                width: "4rem",
            }}>
                <Checkbox onChange={ toggleSelect } sx={{
                    display: (isHovered || isSelectMode)? "inline" : "none",
                }}></Checkbox>
            </TableCell>

            {/* Logo */}
            <TableCell align="center" sx={{
                width: "4rem",
            }}>
                <Box component="img" src={team.teamLogo} sx={{
                    maxWidth: "100%",
                }}></Box>
            </TableCell>
        
            {/* Team Name */}
            <TableCell>{team.name}</TableCell>
        
            {/* Team Lead */}
            <TableCell sx={{
                height: "3rem",
            }}>
                <Grid2 container spacing={2}>
                    { (team.teamLead.map((lead, idx) => {
                        return (
                            <Grid2>
                                <Grid2 key={idx} container spacing={1} sx={{
                                    alignItems: "center",
                                }}>
                                    <Box component="img" src={lead.profilePicture} sx={{
                                        maxHeight: "3rem",
                                    }}></Box>
                                    <Typography>{lead.name}</Typography>
                                </Grid2>
                            </Grid2>
                        );
                    })) }
                </Grid2>
            </TableCell>

            {/* Discord Role */}
            <TableCell sx={{
                borderRight: "none",
            }}>
                <Typography>{team.discordId}</Typography>
            </TableCell>
        </TableRow>
    );
}

export default TeamRow;