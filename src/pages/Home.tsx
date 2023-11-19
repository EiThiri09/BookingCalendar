import React, { useState, useRef, useEffect, useContext } from "react";
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Calendar from 'react-calendar';
//@ts-ignore
import Gantt from "../package/booking-calendar";
import moment from 'moment';

import 'react-calendar/dist/Calendar.css';
import { ModalDefault } from "../components/modal";
import CreateBookingCard from "../components/CreateBookingCard";
import { connect, useDispatch, useSelector } from 'react-redux';
import { BookingContext } from "../context/BookingContext";
import { useBooking } from "../provider/bookingProvider";


const dateRangeList =
    [
        { value: 'Day', label: 'Day' },
        { value: 'Week', label: 'Week' },
        { value: 'Month', label: 'Month' }
    ];

// const properties = [
//     {
//         name: 'Toyota Viaos 2023 (G478329)',
//         id: 1,
//         background_color: 'lightblue',
//         bookings: [
//             {
//                 id: '1',
//                 start: '2023-07-31 10:00',
//                 end: '2023-08-2 06:10',
//                 name: 'Order 1',
//                 description: 'Description',
//             },
//             {
//                 id: '2',
//                 start: '2023-08-04 05:15',
//                 end: '2023-08-06 12:05',
//                 name: 'Order 2',
//                 description: 'Description',
//             },
//         ],
//     },
//     {
//         name: 'Ford C1 2023 (Hu6555)',
//         id: 2,
//         background_color: 'lightblue',
//         bookings: [
//             {
//                 id: '1',
//                 start: '2023-08-02 02:04',
//                 end: '2023-08-05 16:02',
//                 name: 'Order 3',
//                 description: 'Description',
//             }

//         ],
//     },
//     {
//         name: 'Nissan N1 2022 (J65532)',
//         id: 3,
//         background_color: 'lightblue',
//         bookings: [
//             {
//                 id: '1',
//                 start: '2023-08-10 01:04',
//                 end: '2023-08-12 05:02',
//                 name: 'Order 4',
//                 description: 'Description',
//             },
//             {
//                 id: '2',
//                 start: '2023-08-05 06:04',
//                 end: '2023-08-08 12:00',
//                 name: 'Order 5',
//                 description: 'Description',
//             }


//         ],
//     },
// ];

export default function Home() {

    const ganttRef = useRef(null);
    const [dateValue, setDateValue] = useState(new Date());
    const [selectedOption, setSelectedOption] = useState(dateRangeList[1].value);
    const [startDateRangeValue, setStartDateRangeValue] = useState("");
    const [endDateRangeValue, setEndDateRangeValue] = useState("");
    const [isShowCreatePopup, setIsShowCreatePopup] = useState(false);
    const [selectedBarId, setSelectedBarId] = useState(0);
    const [selectedStartDate, setSelectedStartDate] = useState("");
    const [selectedEndDate, setSelectedEndDate] = useState("");
    const [selectedVehicleID, setSelectedVehicleID] = useState(0);
    const [vehicleName, setVehicleName] = useState("");
    const [endDate, setEndDate] = useState("");
    const { bookings } = useBooking();
    const [bookingVehicleList, setBookingVehicleList]: any = useState(bookings);


    // const { bookingList, setBookingList }: any = useContext(BookingContext);


    const handleOptionChange = (event: any) => {
        setSelectedOption(event.target.value);
    };

    useEffect(() => {


        handleSetGanttProperties();

    }, [selectedOption, dateValue, bookingVehicleList]);

    useEffect(() => {

        getBookingCalendarList();
        handleSetGanttProperties();

    }, []);

    const getBookingCalendarList = () => {

    }

    const handleSetGanttProperties = (bookingItemList = bookingVehicleList, startDate = "", endDate = "") => {
        let startD = startDate;
        let endD = endDate;
        let dateRangeOption = selectedOption;
        let bookingList = bookingItemList;

        if (startD === "" || endD === "") {
            if (dateRangeOption === "Month") {
                // startD = '2023-07-01 00:00';
                // endD = '2023-07-31 00:00';

                startD = moment(dateValue, 'MM DD YYYY HH:MM').startOf('month').format('YYYY-MM-DD');
                endD = moment(dateValue, 'MM DD YYYY HH:MM').endOf('month').format('YYYY-MM-DD HH:MM');

            } else if (dateRangeOption === "Week") {
                // startD = '2023-07-31 00:00';
                // endD = '2023-08-06 00:00';
                startD = moment(dateValue, 'MM DD YYYY HH:MM').startOf('isoWeek').format('YYYY-MM-DD');
                endD = moment(dateValue, 'MM DD YYYY HH:MM').endOf('isoWeek').format('YYYY-MM-DD HH:MM');

            } else if (dateRangeOption == "Day") {
                // startD = '2023-08-01 00:00';
                // endD = '2023-08-02 00:00';
                startD = moment(dateValue, 'MM DD YYYY HH:MM').startOf('day').format('YYYY-MM-DD');
                endD = moment(dateValue, 'MM DD YYYY HH:MM').endOf('day').format('YYYY-MM-DD HH:MM');

            }
        } else {
            dateRangeOption = "Month"
        }


        console.log("get changed value info", bookingList)


        const options = {
            on_click: function (task: any) {
                console.log("click in bar list", task);
            },
            on_date_change: function (task: any, start: any, end: any, lastScrollXPosition: any) {
                console.log(task);
            },
            on_progress_change: function (task: any, progress: any) {
                console.log(task, progress);
            },
            on_view_change: function (mode: any) {
            },
            header_height: 50,
            column_width: 30,
            step: 1,
            view_modes: ['Day', 'Week', 'Month'],
            popup_trigger: 'mouseover',
            bar_height: 60,
            bar_corner_radius: 3,
            arrow_curve: 5,
            padding: 18,
            view_mode: selectedOption,
            date_format: 'YYYY-MM-DD HH:MM',
            custom_popup_html: null,
            start_date: startD,
            end_date: endD,
            show_label: true,
            animations_active: false,
            init_scroll_position: 0,
            custom_click_on_bar: handleCustomClickOnBar,
            add_new_data_entry: handleAddNewBar,
        };

        new Gantt(ganttRef.current, bookingList, options);
        setBookingVehicleList(bookingList);

    }

    const handleAddNewBar = (startDate: any, vehicleId: number) => {
        setIsShowCreatePopup(true);
        setSelectedStartDate(startDate);
        setSelectedVehicleID(vehicleId);
    }

    const handleCustomClickOnBar = (startDate: any, endDate: any, Id: any) => {
        console.log("click on custom click bar", startDate, endDate, Id)
        setIsShowCreatePopup(true);
        setSelectedEndDate(endDate);
        setSelectedStartDate(startDate);
        setSelectedBarId(Id);
    }

    const handleViewOrderCalendar = () => {
        handleSetGanttProperties(startDateRangeValue, endDateRangeValue);
    }


    const handleChangeDate = (target: any) => {
        // a callback function when user select a date
        console.log("Get date value info", target);

        setDateValue(target);
    }

    const handleChangePreviousRange = () => {
        let currentDate: any = dateValue;
        if (selectedOption === "Week") {
            currentDate = moment(currentDate).subtract(1, 'weeks').calendar();
        } else if (selectedOption === "Month") {
            currentDate = moment(currentDate).subtract(1, 'months').calendar();
        } else {
            currentDate = moment(currentDate).subtract(1, 'days').calendar();
        }

        setDateValue(currentDate);

    }

    const changetToToday = () => {
        setDateValue(new Date());
    }

    const handleChangeNextRange = () => {
        let currentDate: any = dateValue;
        if (selectedOption === "Week") {
            currentDate = moment(currentDate).add(1, 'weeks').calendar();
        } else if (selectedOption === "Month") {
            currentDate = moment(currentDate).add(1, 'months').calendar();
        } else {
            currentDate = moment(currentDate).add(1, 'days').calendar();
        }

        setDateValue(currentDate);

    }


    const handleChangeStartDateInput = (event: any) => {
        console.log("Get stasrt date input", event)
        setStartDateRangeValue(event.target.value)

    }

    const handleChangeEndDateInput = (event: any) => {
        setEndDateRangeValue(event.target.value)
    }

    const handleCloseEditPopup = () => {
        setIsShowCreatePopup(false);
        handleSetGanttProperties(bookings);
    }

    return (
        <div className="flex w-full justify-center">
            <div className="flex flex-col space-y-4 py-20  w-11/12">
                <div className="flex overflow-hidden w-full space-x-4 justify-between">
                    <div className="flex flex-col space-y-3">
                        <div className="flex flex-col space-y-2">
                            <div className="flex w-full space-x-2">
                                <input className="w-[8rem]" type="date" value={startDateRangeValue} onChange={handleChangeStartDateInput} />
                                <label>To</label>
                                <input className="w-[8rem]" type="date" value={endDateRangeValue} onChange={handleChangeEndDateInput} />
                                <div className="border border-primary p-2 text-sm font-semibold rounded-lg flex text-center align-middle cursor-pointer" onClick={handleViewOrderCalendar}>View</div>
                            </div>
                            <div className='flex w-full ml-10 gap-4'>
                                <div className={`flex items-center cursor-pointer`} onClick={handleChangePreviousRange} >
                                    <FiChevronLeft size={20} className={``} />
                                </div>
                                <div className='border-2 border-grayMedium text-sm flex items-center rounded-md py-1 px-2 cursor-pointer' onClick={changetToToday}>
                                    Today
                                </div>
                                <div className={` flex items-center cursor-pointer`} onClick={handleChangeNextRange}>
                                    <FiChevronRight size={20} className={``} />
                                </div>
                                <div className={''}>
                                    <select value={selectedOption} onChange={handleOptionChange}
                                        className={'border border-grayCancel outline-0 rounded-lg'}
                                    >
                                        {dateRangeList.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                        </div>
                        <Calendar onChange={handleChangeDate} value={dateValue} />
                    </div>
                    <svg id="gantt" ref={ganttRef} />
                    <ModalDefault
                        header={"Create New Booking"}
                        body={<CreateBookingCard vehicleId={selectedVehicleID} startDate={selectedStartDate} closeEvent={handleCloseEditPopup} />}
                        visibility={isShowCreatePopup}
                        closeEvent={handleCloseEditPopup}
                        hideFooter={true}
                        secondaryTextBtn={"cancel"}
                        primaryTextBtn="Ok"
                        size={"xs"}
                    />

                </div>
            </div>
        </div >
    )
}

