import { useEffect, useState } from "react";
import TeamRow from "../components/team-row/teamRow";
import MainLayout from "../layouts/MainLayout";
import { Grid2, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import fetchTeams from "../services/fetchTeams";
import fetchMember from "../services/fetchMember";

function Teams() {
    const [selectedTeams, setSelectedTeams] = useState(new Set([]));
    const [teamData, setTeamData] = useState([]);
    const [isSelectMode, setIsSelectMode] = useState(false);

    useEffect(() => {
        const getTeams = async () => {
            const teamData = await fetchTeams();
            for (let team of teamData) {
                for (let idx in team.teamLead){
                    const id = team.teamLead[idx];
                    const member = await fetchMember(id);
                    team.teamLead[idx] = member;
                }
            }
            setTeamData(teamData);
        }

        getTeams();
    }, []);

    function toggleSelectTeam(teamID) {
        const newSelected = selectedTeams;
        if (newSelected.has(teamID)) {
            if (selectedTeams.size === 1) {
                setIsSelectMode(false);
            }
            newSelected.delete(teamID);
        } else {
            setIsSelectMode(true);
            newSelected.add(teamID);
        }
        setSelectedTeams(newSelected);
    }

    return (
        <MainLayout>
            <Stack spacing={2}>
                <Table>
                    <TableHead>
                        <TableRow sx={{
                            "& th": {
                                borderBottom: "1px solid #a9b8ec",
                            },
                        }}>
                            <TableCell/>
                            <TableCell colSpan={2}><Typography variant="h3">Team</Typography></TableCell>
                            <TableCell><Typography variant="h3">Team Lead</Typography></TableCell>
                            <TableCell><Typography variant="h3">Discord Role</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { teamData.map((team, idx) => {
                            return (
                                <TeamRow key={idx} team={team} isSelectMode={isSelectMode} onToggleSelect={() => toggleSelectTeam(team.id)}></TeamRow>
                            );
                        }) }
                    </TableBody>
                </Table>
                
            </Stack>
        </MainLayout>
    );
}

export default Teams