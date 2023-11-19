import React from "react";
import { useState } from "react";
import { Color } from "../../constants/colourConfigurations";
// import { Icon, IconType, IconVariant } from "../../Icon";
import { GrSearchAdvanced } from "react-icons/gr";
import { BsEyeFill, BsEyeSlashFill, BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Icon, IconType, IconVariant } from "../icon/Icon";
import { ReactComponent as AddUser } from "../../assets/svg/addUser.svg";

interface InputProps {
    /**
     * Id of field
     */
    id: any;
    /**
     * Name of field
     */
    name: string;
    /**
     * Field label
     */
    label: string;
    /**
     * Placeholder label
     */
    placeholder: string;
    /**
     * Required field
     */
    required: boolean;
    /**
     * onChange callback
     */
    onChange?: (event: any) => void;
    /**
     * Error flag for display style
     */
    onBlur?: any;
    /**
     * Error flag for display style
     */
    error?: boolean;
    /**
     * Helper text for eror message
     */
    helperText?: string;
    /**
     * Readonly flag
     */
    readonly: boolean;
    /**
     * Disabled flag
     */
    disabled?: boolean;
    /**
     * Show icon boolean (Does field have icon?)
     */
    showIcon: boolean;
    /**
     * value for controlled field
     */
    value: string;
    /**
     * Icon type (if showIcon flag is true)
     */
    // icon?: IconType;
    /**
     * Text, Password, Date type input
     */
    type: "text" | "password" | "date" | "email" | "dateRange" | "number";
    /**
     * For date type only, minimum date
     */
    minimumDate?: Date;
    /**
     * For date type only, maximum date
     */
    maximumDate?: Date;
    onEnter?: (event: any) => void;
    onClick?: (event: any) => void;
    showProductMenu?: boolean;
    callProductMenu?: (formFieldId: string) => void;
    formFieldId?: string;
    customLabelClass?: string;
    icon: IconType,
}

export const Input = (input: InputProps) => {
    const [viewPass, setViewPass] = useState(false);
    const showIconInput = (
        <div className="flex flex-col gap-y-2">
            <label className="pl-2 text-warning">{input.label}</label>
            <div className="flex items-center focus-within:text-cancel">
                {/* <span className="absolute m-2 w-auto">
                    <Icon
                        type={input.icon}
                        variant={IconVariant.inline}
                        colour={input.error ? Color.error : Color.primary}
                        size={20}
                    />
                </span> */}
                <input
                    id={input.id}
                    name={input.name}
                    placeholder={input.placeholder}
                    className={[
                        "w-full px-2 rounded-lg h-10 border focus:border-inputFocusRing focus:ring-1 focus:ring-inputFocusRing",
                        input.error ? "border-warning shadow-xl" : "",
                        input.readonly
                            ? "border-none text-readOnlyText text-base font-bold cursor-default pl-0"
                            : "border-gray-300 text-gray-900 text-sm",
                    ].join(" ")}
                    value={input.value}
                    type={
                        input.type === "password"
                            ? viewPass
                                ? "text"
                                : "password"
                            : input.type === "dateRange"
                                ? "text"
                                : input.type
                    }
                    onChange={input.onChange}
                    onBlur={input.onBlur}
                    onClick={input.onClick}
                    readOnly={input.onClick ? true : input.readonly}
                    disabled={input.onClick ? false : input.readonly}
                    onKeyDown={input.onEnter}
                    required
                    autoComplete="new-password"
                />
            </div>
        </div>
    );

    return (
        <>
            {showIconInput}
        </>
    );
};
