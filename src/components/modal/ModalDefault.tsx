import { ReactElement, JSXElementConstructor } from "react";
import { Paragraph, TextType } from "../text";
import "./modal.css";
import { Dialog, Transition } from '@headlessui/react'
import { ButtonType, Button } from "../Button";

interface ModalProps {
    /**
     * Modal header / title
     */
    header: string;
    /**
     * body commponent nested in modal
     */
    body: ReactElement<any, string | JSXElementConstructor<any>>;
    /**
     * buttons for submission / close modal
     */
    /**
 * toggle modal visibility
 */
    visibility: boolean;
    /**
     * click to close
     */
    closeEvent: () => void;
    submitEvent?: () => void;
    size?: string;
    primaryTextBtn?: string;
    secondaryTextBtn?: string;
    hideFooter?: boolean;
}

export const ModalDefault = ({
    header,
    body,
    visibility,
    size,
    closeEvent,
    primaryTextBtn,
    secondaryTextBtn,
    submitEvent,
    hideFooter,
    ...props
}: ModalProps) => {
    return (
        <Transition appear show={visibility}>
            <Dialog as="div" className="relative z-10" onClose={closeEvent}>
                <Transition.Child
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-xl py-3 border-b border-gray-400 font-medium leading-6 text-gray-900"
                                >
                                    {header}
                                </Dialog.Title>
                                <div className="mt-2">
                                    {body}
                                </div>
                                {
                                    !hideFooter && (
                                        <div
                                            className={`flex items-center w-full bg-red shrink-0 flex-wrap p-4 text-blue-gray-500`}
                                        >
                                            <div className={`w-1/2 text-center`}>
                                                <Button
                                                    type={ButtonType.cancel}
                                                    label={secondaryTextBtn}
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
                                                    label={primaryTextBtn}
                                                    textColor={"#ffffff"}
                                                    borderRadius={"rounded-md"}
                                                    onClick={submitEvent}
                                                    className={`p-1 w-1/2 disabled:!bg-grayMedium`}
                                                />
                                            </div>
                                        </div>
                                    )
                                }

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
