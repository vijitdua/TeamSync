import { Button, Divider, Grid2, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import fetchMemberIds from "../../services/fetchMemberIds";
import fetchMember from "../../services/fetchMember";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import dayjs from "dayjs";

function TeamEditPanel({teamEditing, isCreate}) {
    const [teamName, setTeamName] = useState(teamEditing.name);
    const [teamLead, setTeamLead] = useState(teamEditing.teamLead);
    const [members, setMembers] = useState([]);
    const [foundationDate, setFoundationDate] = useState(isCreate? dayjs(new Date()) : dayjs(teamEditing.foundationDate));

    let initCustomData = {};
    if (teamEditing.customDataPublic) {
        initCustomData = {...initCustomData, ...teamEditing.customDataPublic};
    }
    if (teamEditing.customDataPrivate) {
        initCustomData = {...initCustomData, ...teamEditing.customDataPublic};
    }

    const [customData, setCustomData] = useState(initCustomData);

    useEffect(() => {
        console.log(teamEditing);
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
    }, [teamEditing, customData])

    function changeTeamLead(idx, newId) {
        const updatedTeamLead = teamLead.map((lead, index) => 
            index === idx ? { ...lead, id: newId } : lead
        );
        setTeamLead(updatedTeamLead); 
    }

    function addCustomProperty() {
        const newCustomData = {...customData};
        newCustomData[""] = "";
        setCustomData(newCustomData);
    }

    function editCustomProperty(e, key) {
        const newKey = e.target.form.elements[0].value;
        const newVal = e.target.form.elements[2].value;

        console.log(newKey, newVal);
        
        if (newKey !== key) {  // changed property key
            if (Object.hasOwn(customData, newKey)) {  // custom data already has this key
                // display error and don't let user sync/save
            } else {
                const newCustomData = {};
                for (let oldKey in customData) {
                    if (oldKey === key) {
                        newCustomData[newKey] = customData[oldKey];
                    } else {
                        newCustomData[oldKey] = customData[oldKey];
                    }
                }
                setCustomData(newCustomData);
            }
        } else {  // changed property value
            const newCustomData = {...customData};
            newCustomData[newKey] = newVal;
            setCustomData(newCustomData);
        } 
    }

    return (
        <Stack spacing={2} sx={{
            backgroundColor: "white",
            padding: "1rem",
            width: "32rem",
            "& input": {
                height: "0.5rem",
            },
            "& .dropdown": {
                height: "2.5rem",
            },
        }}>
            <Typography variant="h3">{isCreate ? "Create Team" : "Edit Team"}</Typography>
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

                { Object.entries(customData).map(([key, val]) => 
                    <Grid2 container key={ key } spacing={1}>
                        <form>
                            <TextField defaultValue={ key } onChange={ (e) => editCustomProperty(e, key) }></TextField>
                            <TextField defaultValue={ val } onChange={ (e) => editCustomProperty(e, key) }></TextField>
                        </form>
                    </Grid2>
                ) }

            <Stack spacing={1}>
                <Typography>Notes</Typography>
                <TextField multiline></TextField>
            </Stack>

            <Button variant="outlined" onClick={ addCustomProperty }>
                <AddIcon />
                Add Property
            </Button>

            <Button>Delete Team</Button>
        </Stack>
    );
}

export default TeamEditPanel;