import { Button, Divider, Grid2, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import fetchMemberIds from "../../services/fetchMemberIds";
import fetchMember from "../../services/fetchMember";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import dayjs from "dayjs";
import {v4 as uuidv4} from 'uuid';

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
    const uniqueCustomData = {};
    for (let key in initCustomData) {
        uniqueCustomData[uuidv4()] = [key, initCustomData[key]];
    }

    const [customData, setCustomData] = useState(uniqueCustomData);

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

    function changeTeamLead(idx, newId) {
        const updatedTeamLead = teamLead.map((lead, index) => 
            index === idx ? { ...lead, id: newId } : lead
        );
        setTeamLead(updatedTeamLead); 
    }

    function addCustomProperty() {
        let newCustomData = {...customData};
        newCustomData[uuidv4()] = ["", ""];
        console.log("new", newCustomData);
        setCustomData(newCustomData);
    }

    function editCustomProperty(e, id) {
        const newKey = e.target.form.elements[0].value;
        const newVal = e.target.form.elements[2].value;

        const newCustomData = {...customData};

        newCustomData[id] = [newKey, newVal];
        setCustomData(newCustomData);
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

                { Object.entries(customData).map(([id, pair]) => 
                    <Grid2 container key={ id } spacing={1}>
                        <form>
                            <TextField value={ customData[id][0] } onChange={ (e) => editCustomProperty(e, id) }></TextField>
                            <TextField value={ customData[id][1] } onChange={ (e) => editCustomProperty(e, id) }></TextField>
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