import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";


function Layout() {
    return (
        <div className="flex flex-col">
            <Navbar />
            <main className="flex w-full bg-white flex-col items-center justify-between">
                <Outlet />
            </main>

        </div>
    )
}

export default Layout