import { Box, Button, Divider, Grid2, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
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
import dayjs from "dayjs";
import {v4 as uuidv4} from 'uuid';

/**
 * TODO
 * - sync with backend (save data)
 * - snackbar for notifications and errors
 * - Team logo upload
 * - Stars for required fields
 * - Prompt text for inputs
 */

/**
 * pop-up at right side of screen when editing a team in team view
 */
function TeamEditPanel({teamEditing, isCreate, saveChanges}) {
    const [teamName, setTeamName] = useState(teamEditing.name);
    const [teamLead, setTeamLead] = useState(teamEditing.teamLead);
    const [members, setMembers] = useState([]);
    const [foundationDate, setFoundationDate] = useState(isCreate? dayjs(new Date()) : dayjs(teamEditing.foundationDate));

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
        console.log(customData);
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
    }, [customData])

    /**
     * 
     * @param {uuid} idx 
     * @param {uuid} newId 
     */
    function changeTeamLead(idx, newId) {
        const updatedTeamLead = teamLead.map((lead, index) => 
            index === idx ? { ...lead, id: newId } : lead
        );
        setTeamLead(updatedTeamLead); 
    }

    /**
     * Add a new custom property to this team.
     */
    function addCustomProperty() {
        let newCustomData = {...customData};
        newCustomData[uuidv4()] = {key: "", value: "", visibility: "private"};
        setCustomData(newCustomData);
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
    }

    /**
     * Delete a custom property.
     * @param {UUID} id 
     */
    function deleteAttribute(id) {
        const newCustomData = {...customData};
        delete newCustomData[id];
        setCustomData(newCustomData);
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
                    <Button variant="outlined" onClick={saveChanges}>Save Changes</Button>
                </Grid2>
            </Grid2>
            <Stack spacing={1}>
                <Typography>Team Name</Typography>
                <TextField required value={teamName} onChange={(e) => setTeamName(e.target.value)}></TextField>
            </Stack>

            <Stack spacing={1}>
                <Typography>Team Leads</Typography>
                { members.length? teamLead.map((currLead, idx) =>
                    <Select 
                        value={currLead.id}
                        className="dropdown" 
                        onChange={(e) => changeTeamLead(idx, e.target.value)}
                        key={idx}
                    >
                        { members.map((member) => 
                            <MenuItem key={member.id} value={member.id}>
                                {member.name}
                            </MenuItem>
                        ) }
                    </Select>
                )
                :
                <Typography>Loading...</Typography> }
            </Stack>

            <Stack spacing={1}>
                <Typography>Team Discord</Typography>
                <Select className="dropdown" value="">
                    <MenuItem value=""></MenuItem>
                </Select>
            </Stack>

            <Stack spacing={1}>
                <Typography>Foundation Date</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker value={foundationDate} onChange={(e) => setFoundationDate(dayjs(e.$d))}/>
                </LocalizationProvider>
            </Stack>

            <Stack spacing={1}>
                <Typography>Description</Typography>
                <TextField multiline></TextField>
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
                <Typography>Notes</Typography>
                <TextField multiline></TextField>
            </Stack>

            <Button>Delete Team</Button>
        </Stack>
    );
}

export default TeamEditPanel;