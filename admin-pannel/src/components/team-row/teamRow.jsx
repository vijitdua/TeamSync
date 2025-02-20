import { Box, Button, Checkbox, Grid2, TableCell, TableRow, TextField, Typography } from "@mui/material";
import { useState } from "react";


function TeamRow({ team, selectedTeams, onToggleSelect, isSelectMode, isCreationMode, onChangeName, onChangeLead, onCompleteTeam, setTeamEditing }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isCreating, setIsCreating] = useState(isCreationMode);

    const isSelected = selectedTeams.has(team.id);

    async function attemptCompleteTeam() {
        const response = await onCompleteTeam();
        if (response === true) {
            setIsCreating(false);
        }
    }

    return (
        <TableRow sx={{
            "& td": {
              borderBottom: "1px solid #a9b8ec",
              padding: "0",
            },
            backgroundColor: (isSelected || isHovered)? "#bbc8f3" : "transparent",
            height: "4rem",
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
                <Checkbox onChange={ onToggleSelect } id={`checkbox-${team.id}`} sx={{
                    display: (isHovered || isSelectMode)? "block" : "none",
                }} checked={ isSelected }></Checkbox>
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
                    if (e.key === "Enter") {
                        attemptCompleteTeam();
                    }
                }}
            /> 
            :
            <Typography onClick={() => setTeamEditing(team)}>{team.name}</Typography>}</TableCell>
        
            {/* Team Lead */}
            <TableCell sx={{
                height: "3rem",
            }}>
                <Grid2 container spacing={2}>
                    {(isCreating)? <TextField 
                        onChange={(e) => onChangeLead(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                attemptCompleteTeam();
                            }
                        }}
                    />
                    :
                    (team.teamLead.map((lead, idx) => {
                        return (
                            <Grid2 key={idx}>
                                <Grid2 container spacing={1} sx={{
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

            <TableCell sx={{
                borderRight: "none",
            }}>
                {/* Confirmation button for creating team */}
                { isCreating && <Button variant="contained" onClick={ attemptCompleteTeam }>Confirm New Team</Button>}

                {/* Discord Role */}
                <Typography>{team.discordId}</Typography>
            </TableCell>
        </TableRow>
    );
}

export default TeamRow;