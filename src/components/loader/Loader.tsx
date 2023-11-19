import "./loader.css";

interface LoaderProps {
    visibility: boolean;
    colour?: string;
    backdrop?: boolean;
    zIndex?: boolean;
    loader: boolean;
    zIndexLevel?: number;
}

export const Loader = ({
    visibility,
    colour,
    backdrop,
    zIndex,
    loader,
    zIndexLevel
}: LoaderProps) => {
    return (
        <div
            className={[
                visibility ? "show" : "",
                backdrop ? "h-screen backdrop backdrop-blur-md" : "",
                zIndex ? zIndexLevel ? `z-[${zIndexLevel}]` : "z-[40]" : "",
            ].join(" ")}
        >
            <div className="spinner-container">
                <div id={loader && visibility ? "loadingScreenShow" : ""} className={`loading-spinner ${loader && "show"}`} ></div>
            </div>
        </div>
    );
};
