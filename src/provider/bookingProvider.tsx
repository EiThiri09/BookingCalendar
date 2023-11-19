import { useState, useMemo, useReducer, useContext } from "react";
import bookingList from "../constants/bookingList";
import { BookingContext } from "../context/BookingContext";
import { bookingReducer } from "../reducers/bookingReducer";

export const BookingProvider = ({ children }: any) => {
    const [bookings, dispatch] = useReducer(bookingReducer, bookingList);

    const addBooking = async (booking: any) => {
        console.log("add new booking")
        dispatch({ type: 'ADD_NEW_BOOKING', payload: booking });
    };

    return (
        <BookingContext.Provider value={{ bookings, addBooking }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};
