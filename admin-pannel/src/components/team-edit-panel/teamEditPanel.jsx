import { Button, Divider, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import fetchMemberIds from "../../services/fetchMemberIds";
import fetchMember from "../../services/fetchMember";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import dayjs from "dayjs";

function TeamEditPanel({teamEditing, isCreate}) {
    const [teamLead, setTeamLead] = useState(teamEditing.teamLead);
    const [members, setMembers] = useState([]);
    const [foundationDate, setFoundationDate] = useState(isCreate? dayjs(new Date()) : dayjs(teamEditing.foundationDate));

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
    }, [])

    function changeTeamLead(idx, newId) {
        const updatedTeamLead = teamLead.map((lead, index) => 
            index === idx ? { ...lead, id: newId } : lead
        );
        setTeamLead(updatedTeamLead); 
    }

    return (
        <Stack spacing={2} sx={{
            backgroundColor: "white",
            padding: "1rem",
            width: "24rem",
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
                <TextField required></TextField>
            </Stack>

            <Stack spacing={1}>
                <Typography>Team Leads</Typography>
                { members.length? teamLead.map((currLead, idx) => {
                    return(<Select 
                        value={currLead.id}
                        className="dropdown" 
                        onChange={(e) => changeTeamLead(idx, e.target.value)}
                        key={{idx}}
                    >
                        { members.map((member) => 
                            (<MenuItem key={member.id} value={member.id}>
                                {member.name}
                            </MenuItem>)
                        ) }
                    </Select>);
                })
                :
                <Typography>Loading...</Typography> }
            </Stack>

            <Stack spacing={1}>
                <Typography>Team Discord</Typography>
                {/* <Select className="dropdown">
                    
                </Select> */}
            </Stack>

            <Stack spacing={1}>
                <Typography>Foundation Date</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker value={foundationDate} onChange={(e) => setFoundationDate(e.$d)}/>
                </LocalizationProvider>
            </Stack>

            <Stack spacing={1}>
                <Typography>Description</Typography>
                <TextField multiline></TextField>
            </Stack>

            <Divider />

            <Stack spacing={1}>
                <Typography>Notes</Typography>
                <TextField multiline></TextField>
            </Stack>

            <Button variant="outlined"><AddIcon />Add Property</Button>

            <Button>Delete Team</Button>
        </Stack>
    );
}

export default TeamEditPanel;