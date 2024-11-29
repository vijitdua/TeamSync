import { Box, Checkbox, Container, Grid2, Paper, TableCell, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";


function TeamRow({team, onToggleSelect, isSelectMode, isCreationMode, onChangeName, onChangeLead, onCompleteTeam}) {
    const [isSelected, setIsSelected] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isCreating, setIsCreating] = useState(isCreationMode);

    // 0 for none, 1 for name, 2 for teamLead
    const focusField = useRef(1);

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
            <TableCell>{(isCreating) ? <TextField 
                onChange={(e) => onChangeName(e.target.value)} 
                onKeyDown={(e) => {
                    if (e.key === "Enter" && onCompleteTeam()) {
                        setIsCreating(false);
                    }
                }}
                onFocus={() => {
                    focusField.current = 1;
                }}
                onBlur={() => {
                    focusField.current = 0;
                    setTimeout(() => {
                        if (focusField.current === 0 && onCompleteTeam()) {
                            setIsCreating(false);
                        }
                    }, 0);
                }}
            /> 
            :
            team.name}</TableCell>
        
            {/* Team Lead */}
            <TableCell sx={{
                height: "3rem",
            }}>
                <Grid2 container spacing={2}>
                    {(isCreating)? <TextField 
                        onChange={(e) => onChangeLead(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && onCompleteTeam()) {
                                setIsCreating(false);
                            }
                        }}
                        onFocus={() => {
                            focusField.current = 2;
                        }}
                        onBlur={() => {
                            focusField.current = 0;
                            setTimeout(() => {
                                if (focusField.current === 0 && onCompleteTeam()) {
                                    setIsCreating(false);
                                }
                            }, 0);
                        }}
                    />
                    :
                    (team.teamLead.map((lead, idx) => {
                        return (
                            <Grid2>
                                <Grid2 key={idx} container spacing={1} sx={{
                                    alignItems: "center",
                                }}>
                                    {!isCreating && <Box component="img" src={lead.profilePicture} sx={{
                                        maxHeight: "3rem",
                                    }}></Box>}
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