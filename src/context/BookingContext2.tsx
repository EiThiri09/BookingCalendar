import { createContext, Dispatch, SetStateAction, useContext } from "react";
import bookingItemList from "../constants/bookingList";

interface IBookingContext {
    bookingList: any;
    setBookingList: Dispatch<SetStateAction<any[]>>;
}

export const BookingContext = createContext<IBookingContext>({
    bookingList: bookingItemList,
    setBookingList: () => { },
});
export const useBooking = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};