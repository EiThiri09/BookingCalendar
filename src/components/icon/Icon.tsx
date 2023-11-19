

import { Color } from "../../constants/colourConfigurations";
import { Helper } from "../../utils";
import "./icon.css";
import { Vehicle, Calendar } from "../../assets/svg";

export enum IconType {

    vehicle = "vehicle",
    calendar = "calendar"

}

export enum IconVariant {
    inline = "inline",
    clickable = "clickable",
}

interface IconProps {
    /**
     * Icon appearance
     */
    type: IconType;
    /**
     * Optional colour customization
     */
    colour?: string;
    fill?: string;
    /**
     * Optional size customization
     */
    size?: number;
    /**
     * Notification (if this is >1, will show up as notification)
     */
    notification?: number;
    /**
     * If items is inline or clickable item
     */
    variant?: IconVariant;
    /**
     * Optional class name
     */
    className?: string;
    /**
     * Optional click handler
     */
    onClick?: () => void;
    isNotification?: boolean;
}

export const Icon = ({ type, colour, fill, size = 24, variant, ...props }: IconProps) => {
    const getIconType = () => {
        switch (type) {
            case IconType.vehicle:
                return <Vehicle width={size} height={size} fill={colour} />;
            case IconType.calendar:
                return <Calendar width={size} height={size} fill={colour} />;
            default:
                return <></>;
        }
    };

    if (props.isNotification)
        return (
            <button onClick={variant === IconVariant.clickable ? props.onClick : undefined}>
                <div className="cursor-pointer">
                    <strong className="relative inline-flex items-center px-2.5 py-1.5 text-xs font-medium">
                        <span
                            className={[
                                "absolute -top-0 -right-2 h-5 w-5 rounded-full bg-red-600 flex justify-center items-center items",
                                !props.notification ? "hidden" : "block",
                            ].join(" ")}
                        >
                            <span className="text-black">{props.notification}</span>
                        </span>
                        <span className={`ml-1.5 text-${colour}`}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                fill="currentColor"
                                className="bi bi-bell"
                                viewBox="0 0 16 16"
                            >
                                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z" />
                            </svg>
                        </span>
                    </strong>
                </div>
            </button>
        );
    else if (variant === IconVariant.inline) return <>{getIconType()}</>;
    else return <button onClick={variant === IconVariant.clickable ? props.onClick : undefined}>{getIconType()}</button>;
};
