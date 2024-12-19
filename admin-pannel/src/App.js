import React from 'react';
import { Routes, Route } from "react-router-dom";
import { routes } from './config/routesConfig';
import Login from './screens/Login';
import Home from './screens/Home';
import Members from './screens/Members';
import Teams from './screens/Teams';

function App(){
    return (
        <>
            <Routes>
                <Route path={routes.home} element={<Home />} />
                <Route path={routes.login} element={<Login />} />
                <Route path={routes.members} element={<Members />} />
                <Route path={routes.teams} element={<Teams />} />
            </Routes>
        </>
    );
}

export default App;
