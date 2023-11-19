import React, { useState } from "react";


export default function Navbar() {
    const [currentSection, setCurrentSection] = useState('');

    const handleOpenSideBar = () => {
        const menu: any = document.querySelector("#navbar-default");
        menu.classList.toggle("hidden");
    }

    const handleChangeSection = (section: any) => {
        setCurrentSection(section);
    }

    return (
        <nav className="bg-primary text-white dark:bg-gray-900 flex sticky w-full z-20 top-0 left-0 justify-center">
            <div className=" flex flex-wrap items-center justify-between py-4 w-11/12">
                <a href="/" onClick={() => handleChangeSection("#home")} className="flex items-center">
                    <h2 className="font-bold text-2xl">Vehicle Order Calendar</h2>
                </a>
                <button type="button" onClick={handleOpenSideBar} className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
                    <span className="sr-only">Open main menu</span>
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15" />
                    </svg>
                </button>
                {/* <div className="hidden md:relative absolute top-14 lg:top-auto md:top-auto right-0  ml-1 w-full md:block md:w-auto" id="navbar-default">
                <ul className="font-medium text-white justify-between text-sm flex flex-col p-4 gap-y-2  md:p-0 mt-4 rounded-lg md:flex-row  md:mt-0 md:border-0 ">
                    <li className={`rounded hover:bg-gray-100 px-2 md:border-0 border-b border-gray-200`} >
                        <a href="#" className="block py-2" aria-current="page">How It Works</a>
                    </li>
                    <li className=" flex rounded hover:bg-gray-100 px-2 md:border-0 border-b border-gray-200">
                        <a href="#" className="block py-2 rounded ">Our Work</a>
                    </li>
                    <li className=" rounded hover:bg-gray-100 px-2 md:border-0 border-b border-gray-200">
                        <a href="#" className="block py-2 rounded">Services</a>
                    </li>
                    <li className="rounded hover:bg-gray-100  px-2 md:border-0 border-b border-gray-200">
                        <a href="#" className="block py-2 rounded">Pricing</a>
                    </li>
                    <li onClick={() => handleChangeSection("#aboutus")} className={`${currentSection === '#aboutus' ? 'bg-primary text-white' : 'hover:bg-gray-10'} 0  px-2 md:border-0 rounded border-b border-gray-200`}>
                        <a href="#aboutus" className="block py-2 rounded ">About Us</a>
                    </li>
                    <li className="lg:hidden bg-primary w-fit rounded-xl text-white md:hidden px-4 lg:px-0 md:px-0 md:flex">
                        <a href="#" className="block py-2 rounded">Try It Now</a>
                    </li>
                </ul>
            </div> */}
                {/* <div className="hidden md:block text-xs order-2">
                <button type="button" className="font-medium text-white bg-primary rounded-lg focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-sm px-4 py-2 text-center mr-3 md:mr-0 hover:text-primary hover:bg-white">Create New</button>
            </div> */}
            </div>
        </nav>
    );
}