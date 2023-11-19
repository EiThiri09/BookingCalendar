
import { useContext, useEffect, useState } from "react";
import { Input } from "./inputs";
import { IconType } from "./icon/Icon";
import { Button, ButtonType } from "./Button";
import { useDispatch, useSelector } from 'react-redux';
import { Color } from "../constants/colourConfigurations";
import { start } from "repl";
//@ts-ignore
import { BookingContext } from "../context/BookingContext";
import { useBooking } from "../provider/bookingProvider";
import moment from "moment";



interface CreateBookingCardProp {
    startDate: any,
    vehicleId: number,
    closeEvent: () => void,
}

const CreateBookingCard = ({ startDate, vehicleId, closeEvent }: CreateBookingCardProp) => {

    const [vehicleName, setVehicleName] = useState("");
    const formattedDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');

    const [endDate, setEndDate] = useState(formattedDate);
    const dispatch = useDispatch();
    const { bookings, addBooking } = useBooking();

    const handleCreateNewBooking = async () => {

        let newBooking = {
            vehicleId: vehicleId,
            startDate: startDate,
            endDate: endDate
        }
        console.log("add new booking item", newBooking)

        let bookingResult = await addBooking(newBooking);

        closeEvent();
    };

    const getVehicleById = (vehicleId: number) => {
        const vehicleInfo = bookings.filter((e: any) => e.id === vehicleId)[0];
        setVehicleName(vehicleInfo.name);

    }

    useEffect(() => {
        getVehicleById(vehicleId)
    }, [])

    const handleChangeEndDate = (event: any) => {
        setEndDate(event.target.value);
    }


    return (
        <div className="  w-[500px]">
            <div className="flex p-4 flex-col gap-y-4 border border-gray-400 rounded-lg">
                <Input
                    id={1}
                    key={1}
                    name={"vehiclename"}
                    label={"Vehicle Name"}
                    placeholder={''}
                    required={false}
                    //onBlur={onBlur}
                    // error={
                    //     isSubmit && txArg.includes("required")
                    //         ? colData.txFieldType == "email"
                    //             ? !Helper.isEmail(formValues.filter((e) => e.vendorFieldDataId == inputId)[0]?.txValue)
                    //             : !formValues.filter((e) => e.vendorFieldDataId == inputId)[0]?.txValue
                    //         : false
                    // }
                    helperText={""}
                    readonly={false}
                    showIcon={true}
                    value={vehicleName}
                    type={"text"}
                    disabled={false}
                    icon={IconType.vehicle}
                />
                <Input
                    id={2}
                    key={2}
                    name={"startdate"}
                    label={"Start Date"}
                    placeholder={''}
                    required={false}
                    //onBlur={onBlur}
                    // error={
                    //     isSubmit && txArg.includes("required")
                    //         ? colData.txFieldType == "email"
                    //             ? !Helper.isEmail(formValues.filter((e) => e.vendorFieldDataId == inputId)[0]?.txValue)
                    //             : !formValues.filter((e) => e.vendorFieldDataId == inputId)[0]?.txValue
                    //         : false
                    // }
                    helperText={""}
                    readonly={false}
                    showIcon={false}
                    value={(new Date(startDate)).toDateString()}
                    type={"text"}
                    disabled={true}
                    icon={IconType.calendar}
                />
                <Input
                    id={3}
                    key={3}
                    name={"enddate"}
                    label={"End Date"}
                    placeholder={''}
                    required={false}
                    onChange={handleChangeEndDate}
                    //onBlur={onBlur}
                    // error={
                    //     isSubmit && txArg.includes("required")
                    //         ? colData.txFieldType == "email"
                    //             ? !Helper.isEmail(formValues.filter((e) => e.vendorFieldDataId == inputId)[0]?.txValue)
                    //             : !formValues.filter((e) => e.vendorFieldDataId == inputId)[0]?.txValue
                    //         : false
                    // }
                    helperText={""}
                    readonly={false}
                    showIcon={false}
                    value={endDate}
                    type={"date"}
                    disabled={true}
                    icon={IconType.calendar}
                />
            </div>
            <div
                className={`flex items-center w-full bg-red shrink-0 flex-wrap p-4 text-blue-gray-500`}
            >
                <div className={`w-1/2 text-center`}>
                    <Button
                        type={ButtonType.cancel}
                        label={"Cancel"}
                        textColor={"#ffffff"}
                        borderRadius={"rounded-md"}
                        backgroundColor={"#acacac"}
                        onClick={closeEvent}
                        className={`p-1 w-1/2`}
                    />
                </div>
                <div className={`w-1/2 text-center`}>
                    <Button
                        type={ButtonType.primary}
                        label={"Create"}
                        textColor={"#ffffff"}
                        borderRadius={"rounded-md"}
                        onClick={handleCreateNewBooking}
                        backgroundColor={Color.primary}
                        disabled={endDate === null || endDate === ""}
                        className={`p-1 w-1/2 disabled:!bg-grayMedium`}
                    />
                </div>
            </div>
        </div>
    )
}
export default CreateBookingCard;
