import { Container, Typography } from "@mui/material";
import MainLayout from "../layouts/MainLayout";

function Home() {
    return(
        <MainLayout teamEditing={null}>
            <Container sx={{
                height: "100%",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                <Typography variant="h4">Select an option on the side bar to continue</Typography>
            </Container>
        </MainLayout>
    );
}

export default Home;