import { useSelector } from 'react-redux';
import * as actionTypes from './actionType';

export const addBooking = (booking: any) => {
    return {
        type: actionTypes.ADD_NEW_BOOKING,
        payload: booking,
    };
};
export const getBookingList = () => {

    return {
        type: actionTypes.GET_BOOKING_LIST,
        payload: []
    };
};