import { Box, Button, Divider, Grid2, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import fetchMemberIds from "../../services/fetchMemberIds";
import fetchMember from "../../services/fetchMember";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from "dayjs";
import {v4 as uuidv4} from 'uuid';
import { useGlobalSnackbar } from "../../contexts/globalFeedbackSnackbarProvider";

/**
 * pop-up at right side of screen when editing a team in team view
 */
function TeamEditPanel({teamEditing, setTeamEditing, teamData, saveChanges, setUnsavedChanges}) {
    const isCreate = teamEditing.id === "NEW_TEAM";

    const [teamName, setTeamName] = useState(teamEditing.name);
    const [teamLead, setTeamLead] = useState(teamEditing.teamLead);
    const [members, setMembers] = useState([]);
    const [foundationDate, setFoundationDate] = useState(isCreate? dayjs(new Date()) : dayjs(teamEditing.foundationDate));

    const defaultDescriptionValue = (Object.hasOwn(teamEditing, "description") && teamEditing.description !== null) ? teamEditing.description : "";
    const [description, setDescription] = useState(defaultDescriptionValue);

    const defaultNotesValue = (Object.hasOwn(teamEditing, "notes") && teamEditing.notes !== null) ? teamEditing.notes : "";
    const [notes, setNotes] = useState(defaultNotesValue);

    const snackbar = useGlobalSnackbar();

    const uniqueCustomData = {};
    for (let key in teamEditing.customDataPublic) {
        uniqueCustomData[uuidv4()] = {
            key: key, 
            value: teamEditing.customDataPublic[key],
            visibility: "public",
        };
    }
    for (let key in teamEditing.customDataPrivate) {
        uniqueCustomData[uuidv4()] = {
            key: key, 
            value: teamEditing.customDataPrivate[key],
            visibility: "private",
        };
    }

    const [customData, setCustomData] = useState(uniqueCustomData);

    /**
     * run when component is rendered
     * get members list from backend for team lead drop-downs
     */
    useEffect(() => {
        const getMembers = async () => {
            const memberIds = await fetchMemberIds();
            const newMembers = [];
            for (let id of memberIds) {
                const member = await fetchMember(id);
                newMembers.push(member);
            }
            setMembers(newMembers);
        }
        getMembers();
    }, []);

    useEffect(() => {
        if (isCreate) {
            setUnsavedChanges(true);
        }
    }, [isCreate, setUnsavedChanges]);

    /**
     * TODO: error checking...
     * @param {uuid} idx 
     * @param {uuid} newId 
     */
    function changeTeamLead(idx, newId) {
        let newLeadMember = {};
        for (let j = 0; j < members.length; j ++) {
            if (members[j].id === newId) {
                newLeadMember = members[j];
            }
        }
        if (Object.keys(newLeadMember).length === 0) {
            snackbar.enqueueAlertFeedbackSnackbar(`Unknown error: couldn't find member with id ${newId}`);
            return;
        }
        const updatedTeamLead = [...teamLead];
        for (let i = 0; i < teamLead.length; i ++) {
            if (i === idx) {
                updatedTeamLead[i] = newLeadMember;
            }
        }
        setTeamLead(updatedTeamLead);
        setUnsavedChanges(true);
    }

    /**
     * Add a new custom property to this team.
     */
    function addCustomProperty() {
        let newCustomData = {...customData};
        newCustomData[uuidv4()] = {key: "", value: "", visibility: "private"};
        setCustomData(newCustomData);
        setUnsavedChanges(true);
    }

    /**
     * Edit a custom property.
     * @param {Event} e: The event from button click
     * @param {UUID} id: ID of the property 
     */
    function editCustomProperty(e, id) {
        const newKey = e.target.form.elements[1].value;
        const newVal = e.target.form.elements[3].value;

        const newCustomData = {...customData};

        newCustomData[id].key = newKey;
        newCustomData[id].value = newVal;
        setCustomData(newCustomData);
        setUnsavedChanges(true);
    }

    /**
     * Change the visibility of a custom property.
     * @param {UUID} id 
     */
    function toggleVisibility(id) {
        const newCustomData = {...customData};
        if (newCustomData[id].visibility === "public") {
            newCustomData[id].visibility = "private";
        } else {
            newCustomData[id].visibility = "public";
        }
        setCustomData(newCustomData);
        setUnsavedChanges(true);
    }

    /**
     * Delete a custom property.
     * @param {UUID} id 
     */
    function deleteAttribute(id) {
        const newCustomData = {...customData};
        delete newCustomData[id];
        setCustomData(newCustomData);
        setUnsavedChanges(true);
    }

    /**
     * Update the team that is currently being edited stored in teamEditing.
     * This is called when the "Save Changes" button of the panel is clicked.
     */
    function updateTeam() {
        const newTeamEditing = {...teamEditing};
        newTeamEditing.name = teamName;

        // check if team name is empty
        if (teamName.length === 0) {
            snackbar.enqueueAlertFeedbackSnackbar("Team name cannot be empty.");
            return;
        }

        // check if team name has already been used
        for (let i = 0; i < teamData.length; i ++) {
            if (teamData[i].name === teamName && teamData[i].id !== newTeamEditing.id) {
                snackbar.enqueueAlertFeedbackSnackbar("Team name already used.");
                return;
            }
        }

        newTeamEditing.foundationDate = foundationDate.toDate();  // convert to JavaScript date

        for (let i = 0; i < teamLead.length; i ++) {
            if (Object.keys(teamLead[i]).length === 0) {
                snackbar.enqueueAlertFeedbackSnackbar("Team lead selection cannot be empty.");
                return;
            }
        }
        newTeamEditing.teamLead = teamLead;

        const customDataKeySet = new Set([]);
        
        const customDataPublic = {};
        const customDataPrivate = {};

        for (let id in customData) {
            if (customDataKeySet.has(customData[id].key)) {  // check if key has already been used
                snackbar.enqueueAlertFeedbackSnackbar("Custom data keys must be unique.");
                return;
            }
            if (customData[id].visibility === "public") {
                customDataPublic[customData[id].key] = customData[id].value;
            } else {
                customDataPrivate[customData[id].key] = customData[id].value;
            }
            customDataKeySet.add(customData[id].key);
        }

        newTeamEditing.customDataPublic = customDataPublic;
        newTeamEditing.customDataPrivate = customDataPrivate;
        newTeamEditing.updatedAt = new Date();
        newTeamEditing.notes = notes;
        newTeamEditing.description = description;

        setTeamEditing(newTeamEditing);
        setUnsavedChanges(false);
        snackbar.enqueueSuccessFeedbackSnackbar("Changes saved.");
    }

    /**
     * Reset any changes that have been done in the edit panel but not yet saved.
     */
    function resetChanges() {
        setTeamName(teamEditing.name);
        setTeamLead(teamEditing.teamLead);
        setFoundationDate(dayjs(teamEditing.foundationDate));
        setDescription(defaultDescriptionValue);
        setNotes(defaultNotesValue);
        snackbar.enqueueSuccessFeedbackSnackbar("Changes reset.");
        setUnsavedChanges(true);
    }

    /**
     * Delete a lead from the list of leads given the index in the teamLead array.
     */
    function deleteLeadEntry(idx) {
        const newTeamLead = teamLead.toSpliced(idx, 1);
        setTeamLead(newTeamLead);
        setUnsavedChanges(true);
    }

    /**
     * Add a new lead to the team lead array that is empty.
     */
    function addLeadEntry() {
        const newTeamLead = [...teamLead];
        newTeamLead.push({});
        setTeamLead(newTeamLead);
        setUnsavedChanges(true);
    }

    return (
        <Stack spacing={2} sx={{
            backgroundColor: "white",
            padding: "1rem",
            height: "100vh",
            overflow: "auto",
            "& input": {
                height: "0.5rem",
            },
            "& .dropdown": {
                height: "2.5rem",
            },
        }}>
            <Grid2 container spacing={1} sx={{
                alignItems: "center",
                justifyContent: "space-between",
            }}>
                <Grid2>
                    <Typography variant="h3">{isCreate ? "Create Team" : "Edit Team"}</Typography>
                </Grid2>
                <Grid2>
                    <Box component="button" sx={{
                        border: "none",
                        backgroundColor: "transparent",
                        padding: "none",
                        cursor: "pointer",
                    }} onClick={ saveChanges }>
                        <CloseIcon/>
                    </Box>
                </Grid2>
            </Grid2>
            <Stack spacing={0}>
                <InputLabel htmlFor="team-name" sx={{ color: "black" }} required>Name</InputLabel>
                <TextField id="team-name" required value={teamName} onChange={(e) => {
                    setTeamName(e.target.value);
                    setUnsavedChanges(true);
                }}></TextField>
            </Stack>

            <Stack spacing={1}>
                <InputLabel sx={{ color: "black" }} required>Team Leads</InputLabel>
                <Stack spacing={1} id="team-leads">
                    { members.length? teamLead.map((currLead, idx) =>
                        <Grid2 container key={idx} spacing={1}>
                            <Grid2 sx={{
                                flex: "1",
                                display: "flex",
                            }}>
                                <Select
                                    value={currLead.id}
                                    className="dropdown"
                                    onChange={(e) => changeTeamLead(idx, e.target.value)}
                                    sx={{
                                        flex: "1",
                                    }}
                                >
                                    { members.map((member) =>
                                        <MenuItem key={member.id} value={member.id}>
                                            {member.name}
                                        </MenuItem>
                                    ) }
                                </Select>
                            </Grid2>
                            <Grid2>
                                <Box component="button" sx={{
                                    backgroundColor: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                }} onClick={() => {
                                    deleteLeadEntry(idx);
                                }}>
                                    <DeleteIcon/>
                                </Box>
                            </Grid2>
                        </Grid2>
                    )
                    :
                    <Typography>Loading...</Typography> }
                </Stack>
                <Button variant="outlined" onClick={ addLeadEntry }>
                    <AddIcon />
                    Add Team Lead
                </Button>
            </Stack>

            <Stack spacing={1}>
                <InputLabel sx={{ color: "black" }}>Team Discord</InputLabel>
                <Select className="dropdown" value="">
                    <MenuItem value=""></MenuItem>
                </Select>
            </Stack>

            <Stack spacing={1}>
                <InputLabel sx={{ color: "black" }}>Foundation Date</InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker value={foundationDate} onChange={(e) => setFoundationDate(dayjs(e.$d))}/>
                </LocalizationProvider>
            </Stack>

            <Stack spacing={1}>
                <InputLabel htmlFor="team-description" sx={{ color: "black" }}>Description</InputLabel>
                <TextField multiline id="team-description" value={description} onChange={(e) => {
                    setDescription(e.target.value);
                    setUnsavedChanges(true);
                }}></TextField>
            </Stack>

            <Divider />

            { Object.entries(customData).map(([id, pair]) => 
                    <form key={ id }>
                        <Grid2 container spacing={1} sx={{
                            display: "flex",
                            "& .attributeInput": {
                                flex: "1",
                            },
                            alignItems: "center",
                        }}>
                            <Box component="button" sx={{
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                            }} onClick={(e) => {
                                e.preventDefault();
                                toggleVisibility(id);
                            }}>
                                { pair.visibility === "public" ? <VisibilityIcon/> : <VisibilityOffIcon/>}
                            </Box>
                            <TextField value={ pair.key } onChange={ (e) => editCustomProperty(e, id) } className="attributeInput"></TextField>
                            <TextField value={ pair.value } onChange={ (e) => editCustomProperty(e, id) } className="attributeInput"></TextField>
                            <Box component="button" sx={{
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                            }} onClick={(e) => {
                                e.preventDefault();
                                deleteAttribute(id);
                            }}>
                                <DeleteIcon/>
                            </Box>
                        </Grid2>
                    </form>
            ) }
            
            <Button variant="outlined" onClick={ addCustomProperty }>
                <AddIcon />
                Add Property
            </Button>

            <Stack spacing={1}>
                <InputLabel htmlFor="team-notes" sx={{ color: "black" }}>Notes</InputLabel>
                <TextField multiline id="team-notes" value={notes} onChange={(e) => {
                    setNotes(e.target.value);
                    setUnsavedChanges(true);
                }}></TextField>
            </Stack>
            
            <Button variant="contained" onClick={ updateTeam }>Save Changes</Button>
            <Button variant="outlined" onClick={ resetChanges }>Reset Changes</Button>
            <Button>Delete Team</Button>
        </Stack>
    );
}

export default TeamEditPanel;