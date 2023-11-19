
export enum ButtonType {
    primary = "primary",
    secondary = "secondary",
    cancel = "cancel",
}

interface ButtonProps {
    label?: string; // Button's Label
    backgroundColor?: string; // Button's background color
    textColor?: string; // Button's text color
    type?: ButtonType; // Button's type
    onClick?: () => void; //Optional click handler
    border?: string; //Optional border
    borderRadius?: string; //Optional Button's border radius
    padding?: number; // Optional padding (px)
    size?: string;
    width?: any;
    className?: string;
    disabled?: boolean;
}

/**
 * Primary UI component for user interaction
 */
export const Button = ({
    type,
    backgroundColor,
    label,
    border = "border-none",
    textColor,
    borderRadius,
    padding,
    width = 48,
    className = "",
    disabled = false,
    ...props
}: ButtonProps) => {
    const color =
        type === ButtonType.secondary
            ? "bg-secondary"
            : type === ButtonType.cancel
                ? "bg-cancel"
                : "bg-primary";

    return (
        <button
            id="button-one"
            type="button"
            disabled={disabled}
            className={`${borderRadius} ${className} ${border} ${color} text-center w-${width} ${disabled ? 'opacity-75' : ''}`}
            style={{
                backgroundColor,
                color: textColor,
                padding: `${padding}px`,
            }}
            {...props}
        >
            {label}
        </button>
    );
};
