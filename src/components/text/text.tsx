import { Color } from "../../constants/colourConfigurations";
import { Helper } from "../../utils";
import "./text.css";

export enum TextType {
    inline = "inline",
    header = "header",
}

interface TextProps {
    /**
     * Text input
     */
    text: string;
    /**
     * Alternative text type (set to paragraph by default)
     */
    type?: TextType;
    /**
     * Clickable text
     */
    clickable?: boolean;
    /**
     * Grid for block paragraph (sm)
     */
    sm?: number;
    /**
     * Grid for block paragraph (xs)
     */
    xs?: number;
    /**
     * Custom colour scheme for text
     */
    colour?: string;
    /**
     * Custom class for additional styling required
     */
    className?: string;
    /**
     * References for scrollIntoView
     */
    refs?: any;
    /**
     * Optional click handler
     */
    onClick?: () => void;
}

export const Paragraph = ({ text, xs = 12, sm = 12, type, ...props }: TextProps) => {
    const colour = props.colour ? props.colour : Helper.getConstantColour(Color.font_primary);

    if (type === TextType.inline) {
        return (
            <div
                className={props.clickable ? ["clickable-text", props.className].join(" ") : props.className}
                onClick={props.clickable ? props.onClick : undefined}
                style={{ color: colour }}
            >
                {text}
            </div>
        );
    } else {
        return (
            <div>
                {type === TextType.header && (
                    <div
                        style={{ color: colour }}
                        className={props.clickable ? ["clickable-text", props.className].join(" ") : props.className}
                        ref={props.refs}
                        onClick={props.clickable ? props.onClick : undefined}
                    >
                        {text}
                    </div>
                )}
                {type !== TextType.header && (
                    <div
                        style={{ color: colour }}
                        className={props.clickable ? ["clickable-text", props.className].join(" ") : props.className}
                        ref={props.refs}
                        onClick={props.clickable ? props.onClick : undefined}
                    >
                        {text}
                    </div>
                )}
            </div>
        );
    }
};
