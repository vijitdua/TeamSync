import { useState } from "react";
import TeamRow from "../components/team-row/teamRow";
import MainLayout from "../layouts/MainLayout";
import { Grid2, Stack, Typography } from "@mui/material";

function Teams() {
    const [selectedTeams, setSelectedTeams] = useState(new Set([]));

    const teamData = [
        {
            "id": "wd1",
            "name": "Web Dev",
            "teamLead": ["leadUUID"],
            "foundationDate": "2022-01-01T00:00:00.000Z",
            "teamLogo": "https://example.com/logo.png",
            "description": "Team description",
            "discordId": 123456789012345678,
            "customDataPublic": {"key": "value"},
            "customDataPrivate": {"privateKey": "privateValue"},
            "deletionDate": "2023-09-28T00:00:00.000Z"
        },
        {
            "id": "dd432",
            "name": "Davis Dot",
            "teamLead": ["leadUUID"],
            "foundationDate": "2022-01-01T00:00:00.000Z",
            "teamLogo": "https://example.com/logo.png",
            "description": "Team description",
            "discordId": 123456789012345678,
            "customDataPublic": {"key": "value"},
            "customDataPrivate": {"privateKey": "privateValue"},
            "deletionDate": "2023-09-28T00:00:00.000Z"
        },
    ];

    function toggleSelectTeam(teamID) {
        const newSelected = selectedTeams;
        if (newSelected.has(teamID)) {
            newSelected.delete(teamID);
        } else {
            newSelected.add(teamID);
        }
        setSelectedTeams(newSelected);
        console.log(newSelected);
    }

    return (
        <MainLayout>
            <Stack spacing={2}>
                <Grid2 container spacing={2}>
                    <Grid2 size={0.5}></Grid2> 
                    <Grid2 size={4}><Typography variant="h3" sx={{
                        position: "relative",
                        left: "1rem",
                    }}>Team</Typography></Grid2>
                    <Grid2 size={4}><Typography variant="h3">Team Lead</Typography></Grid2>
                    <Grid2 size={2}><Typography variant="h3">Discord Role</Typography></Grid2>
                </Grid2>
                
                <Stack spacing={1}>
                    { teamData.map((team, idx) => {
                        return (
                            <TeamRow key={idx} team={team} onToggleSelect={() => toggleSelectTeam(team.id)}></TeamRow>
                        );
                    }) }
                </Stack>
            </Stack>
        </MainLayout>
    );
}

export default Teams