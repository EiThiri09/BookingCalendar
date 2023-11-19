import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';

// const Home = React.lazy(() =>
//     import('./pages/Home').then(({ Home }) => ({
//         default: Home,
//     }))
// );


function MainRoute() {
    return (
        <Router >
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                </Route>
            </Routes>
        </Router>
    )
}

export default MainRoute;
