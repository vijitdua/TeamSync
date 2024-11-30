import { Button, Divider, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import fetchMemberIds from "../../services/fetchMemberIds";
import fetchMember from "../../services/fetchMember";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';

function TeamEditPanel({team, isCreate}) {
    const [teamLead, setTeamLead] = useState([]);
    const [members, setMembers] = useState([]);
    const [foundationDate, setFoundationDate] = useState(null);

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
            <Stack container spacing={1}>
                <Typography>Team Name</Typography>
                <TextField required></TextField>
            </Stack>

            <Stack container spacing={1}>
                <Typography>Team Leads</Typography>
                <Select value={teamLead} className="dropdown" onChange={(e) => setTeamLead(e.target.value)}>
                    { members.map((member, idx) => {
                        return (<MenuItem key={idx} value={member.id}>{member.name}</MenuItem>);
                    }) }
                </Select>
            </Stack>

            <Stack container spacing={1}>
                <Typography>Team Discord</Typography>
                <Select className="dropdown">
                    
                </Select>
            </Stack>

            <Stack container spacing={1}>
                <Typography>Foundation Date</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker />
                </LocalizationProvider>
            </Stack>

            <Stack container spacing={1}>
                <Typography>Description</Typography>
                <TextField multiline></TextField>
            </Stack>

            <Divider />

            <Stack container spacing={1}>
                <Typography>Notes</Typography>
                <TextField multiline></TextField>
            </Stack>

            <Button variant="outlined"><AddIcon />Add Property</Button>

            <Button>Delete Team</Button>
        </Stack>
    );
}

export default TeamEditPanel;