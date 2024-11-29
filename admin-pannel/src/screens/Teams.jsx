import { useEffect, useState } from "react";
import TeamRow from "../components/team-row/teamRow";
import MainLayout from "../layouts/MainLayout";
import { Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import fetchTeams from "../services/fetchTeams";
import fetchMember from "../services/fetchMember";

function Teams() {
    const [selectedTeams, setSelectedTeams] = useState(new Set([]));
    const [teamData, setTeamData] = useState([]);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [newTeam, setNewTeam] = useState(null);

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

    function startCreatingTeam() {
        const nextTeam = {};
        const newTeams = teamData;
        teamData.push(nextTeam);
        setNewTeam(nextTeam);
        setTeamData(newTeams);
    }

    function changeTeamName(name) {
        const nextTeam = newTeam;
        nextTeam.name = name;
        setNewTeam(nextTeam);
    }

    function changeTeamLead(name) {
        const nextTeam = newTeam;
        if (!nextTeam.hasOwnProperty("teamLead")) {
            nextTeam.teamLead = [""];
        }
        nextTeam.teamLead[0] = name;
    }

    function completeNewTeam() {
        if (newTeam.hasOwnProperty("teamLead") && newTeam.teamLead[0] !== "" && newTeam.name) {
            const newTeams = teamData;
            newTeams[newTeams.length - 1] = newTeam;
            setTeamData(newTeams);
            setNewTeam(null);
            console.log(newTeams);
            return true;
        }
        return false;
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
                                <TeamRow key={idx}
                                    team={team}
                                    isSelectMode={isSelectMode}
                                    isCreationMode={newTeam !== null}
                                    onToggleSelect={() => toggleSelectTeam(team.id)} 
                                    onChangeName={changeTeamName}
                                    onChangeLead={changeTeamLead}
                                    onCompleteTeam={completeNewTeam}
                                />
                            );
                        }) }
                        { newTeam === null && <TableRow sx={{
                            "& td": {
                                border: "none",
                            },
                            backgroundColor: "#bbc8f3",
                        }}>
                            <TableCell colSpan={5} onClick={startCreatingTeam} align="center">
                                <Typography>Add Team</Typography>
                            </TableCell>
                        </TableRow> }
                    </TableBody>
                </Table>
                
            </Stack>
        </MainLayout>
    );
}

export default Teams