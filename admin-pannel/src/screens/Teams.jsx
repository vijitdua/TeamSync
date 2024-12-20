import { useEffect, useState } from "react";
import TeamRow from "../components/team-row/teamRow";
import MainLayout from "../layouts/MainLayout";
import { Box, Button, Checkbox, Container, Grid2, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import fetchTeams from "../services/fetchTeams";
import fetchMember from "../services/fetchMember";
import getMemberIdFromName from "../services/getMemberIdFromName";
import TeamEditPanel from "../components/team-edit-panel/teamEditPanel";
import { useGlobalSnackbar } from "../contexts/globalFeedbackSnackbarProvider";

/**
 * TODO
 * - sync with backend (save data)
 * - Team logo upload
 * - Edit menu from add button
 */

function Teams() {
    const [selectedTeams, setSelectedTeams] = useState(new Set([]));
    const [teamData, setTeamData] = useState([]);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [newTeam, setNewTeam] = useState(null);
    const [teamEditing, setTeamEditing] = useState(null);
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [checkIsHovered, setCheckIsHovered] = useState(false);

    const [allChecked, setAllChecked] = useState(false);

    // TODO: id would be created by backend
    const newTeamTemplate = {
        name: "",
        teamLead: [""],
        foundationDate: new Date(),
        description: "",
        notes: "",
        id: "NEW_TEAM"
    }

    const snackbar = useGlobalSnackbar();

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
        const newSelected = new Set(selectedTeams);
        if (newSelected.has(teamID)) {
            if (newSelected.size === 1) {
                setIsSelectMode(false);
            }
            newSelected.delete(teamID);
            setAllChecked(false);
        } else {
            setIsSelectMode(true);
            newSelected.add(teamID);
            if (newSelected.length === teamData.length) {
                setAllChecked(true);
            }
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

    async function completeNewTeam() {
        console.log(newTeam);
        if (newTeam === null) {
            snackbar.enqueueAlertFeedbackSnackbar("Unknown error-- tried to complete new team when new team wasn't initialized");
            return false;
        }
        if (!newTeam.name) {
            snackbar.enqueueAlertFeedbackSnackbar("Must enter team name.");
            return false;
        }
        if (!newTeam.teamLead || newTeam.teamLead[0] === "") {
            snackbar.enqueueAlertFeedbackSnackbar("Must enter one team lead name.");
            return false;
        }
        const teamLeadId = await getMemberIdFromName(newTeam.teamLead[0]);
        if (teamLeadId === null) {
            snackbar.enqueueAlertFeedbackSnackbar(`Could not find member named ${newTeam.teamLead[0]}.`);
            return false;
        };
        const nextTeam = newTeam;
        nextTeam.teamLead[0] = teamLeadId;
        const newTeams = teamData;
        newTeams[newTeams.length - 1] = nextTeam;
        setTeamData(newTeams);
        setNewTeam(null);
        snackbar.enqueueSuccessFeedbackSnackbar("Successfully created team.", 3000);
        return true;
    }

    function saveChanges() {
        if (unsavedChanges) {
            snackbar.enqueueAlertFeedbackSnackbar("Save or reset unsaved changes before exiting.");
        } else {
            const newTeamData = [...teamData];
            let editedTeam = false;
            for (let i = 0; i < newTeamData.length; i++) {  // iterate through teamData
                if (newTeamData[i].id === teamEditing.id) {
                    newTeamData[i] = teamEditing;
                    editedTeam = true;
                }
            }

            // this is a new team
            if (editedTeam === false) {
                newTeamData.push(teamEditing);
            }

            setTeamData(newTeamData);
            setTeamEditing(null);
        }
    }

    function toggleSelectAll() {
        const newSelected = new Set(selectedTeams);
        if (allChecked) {
            newSelected.clear();
            setIsSelectMode(false);
            setAllChecked(false);
        } else {
            for (let i = 0; i < teamData.length; i ++) {
                newSelected.add(teamData[i].id);
            }
            setIsSelectMode(true);
            setAllChecked(true);
        }
        console.log(newSelected);
        setSelectedTeams(newSelected);
    }

    return (
        <Box>
            <MainLayout teamEditing={teamEditing}>
                <Stack spacing={2}>
                    <Grid2 container sx={{
                        justifyContent: "flex-end",
                    }}>
                        <Button variant="contained" onClick={() => setTeamEditing(newTeamTemplate)}>
                            <Grid2 container spacing={1}>
                                <AddIcon />
                                <Typography>Add</Typography>
                            </Grid2>
                        </Button>
                    </Grid2>
                    <Table>
                        <TableHead>
                            <TableRow sx={{
                                "& th": {
                                    borderBottom: "1px solid #a9b8ec",
                                },
                                padding: "0",
                            }}>
                                {/* Checkbox */}
                                <TableCell sx={{
                                    padding: "none",
                                }}>
                                    <Checkbox sx={{
                                            opacity: (checkIsHovered || isSelectMode)? "1" : "0",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }} onChange={ toggleSelectAll }
                                        checked={allChecked}
                                        onMouseOver={() => {
                                            setCheckIsHovered(true);
                                        }}
                                        onMouseOut={() => {
                                            setCheckIsHovered(false);
                                        }}
                                    ></Checkbox>
                                </TableCell>
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
                                        selectedTeams={selectedTeams}
                                        isSelectMode={isSelectMode}
                                        isCreationMode={newTeam !== null}
                                        onToggleSelect={() => toggleSelectTeam(team.id)}
                                        onChangeName={changeTeamName}
                                        onChangeLead={changeTeamLead}
                                        onCompleteTeam={completeNewTeam}
                                        setTeamEditing={setTeamEditing}
                                    />
                                );
                            }) }
                            { newTeam === null && <TableRow>
                                <TableCell colSpan={5} align="center" sx={{
                                    border: "none",
                                    padding: "0.5rem",
                                }}>
                                    <Container
                                        onClick={startCreatingTeam}
                                        sx={{
                                            backgroundColor: "#bbc8f3",
                                            borderRadius: "8px",
                                            height: "3rem",
                                            display: "flex",
                                            alignItems: "center",
                                            cursor: "pointer",
                                            "&:hover": { backgroundColor: "#abbbee" }
                                        }}
                                    >
                                        <Box sx={{
                                            position: "relative",
                                            left: "1rem",
                                        }}>
                                            <Grid2 container spacing={2}>
                                                <AddIcon />
                                                <Typography>Add Team</Typography>
                                            </Grid2>
                                        </Box>
                                    </Container>
                                </TableCell>
                            </TableRow> }
                        </TableBody>
                    </Table>
                </Stack>
            </MainLayout>
            { teamEditing !== null && <Box 
                sx={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    flexGrow: "1",
                    height: "100vh",
                    width: "100%",
                    backgroundColor: "black",
                    opacity: "50%",
                }} 
                onClick={ saveChanges }
            />}
            { teamEditing !== null && <Box sx={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    width: "24rem",
                    height: "100vh",
                }}>
                    <TeamEditPanel teamEditing={teamEditing} setTeamEditing={setTeamEditing} teamData={teamData} saveChanges={saveChanges} setUnsavedChanges={setUnsavedChanges}></TeamEditPanel>
            </Box> }
        </Box>
    );
}

export default Teams