import { createContext, Dispatch, SetStateAction, useContext } from "react";

interface BookingContextProps {
    bookings: any[];
    addBooking: (booking: any) => void;
}

export const BookingContext = createContext<BookingContextProps | undefined>(undefined);

