import bookingList from "../constants/bookingList";
import * as actionTypes from '../actions/actionType';
import moment from "moment";

const initialState: any[] = bookingList;

export const bookingReducer = (state = initialState, action: any) => {
    console.log("booking llist info", action.type)

    switch (action.type) {
        case actionTypes.ADD_NEW_BOOKING:
            let bookingL = [...state];
            let inputBookingInfo = action.payload;
            let index = bookingL.findIndex(e => e.id === action.payload.vehicleId);
            let newBookingInfo: any = {
                id: `${(bookingL[index].bookings.length + 1)}`,
                start: moment(inputBookingInfo.startDate).format('YYYY-MM-DD HH:mm'),
                end: moment(inputBookingInfo.endDate).format('YYYY-MM-DD HH:mm'),
                name: 'Order ' + (bookingL[index].bookings.length + 1),
                description: 'Description',
            };
            bookingL[index].bookings.push(newBookingInfo);
            return state;
        default:
            return state;

    };
}

