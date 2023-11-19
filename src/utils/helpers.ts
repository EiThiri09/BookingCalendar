import { IFile } from "../types/utilities/IFile";


const isValid = (data: any): boolean => {
    return !(data === undefined || data === null);
};

const isValidText = (data: any): boolean => {
    return isValid(data) && data !== "";
};

const isFile = (data: any): boolean => {
    return data instanceof File;
};

const isNumber = (data: any): boolean => {
    return !isNaN(data);
};

const isDate = (data: any): boolean => {
    return data instanceof Date;
};

const isEmail = (data: any): boolean => {
    const regex = /^\w+([.-]?\w+)([+]?\w+)?@\w+([.-]?\w+)(.\w{2,3})+$/; // /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (regex.test(data)) {
        return true;
    }
    return false;
};

const isValidArray = (data: any): boolean => {
    const isValidData = isValid(data);
    const isArray = isValidData && data instanceof Array;

    return isArray;
};

const isValidObject = (data: any): boolean => {
    return data instanceof Object;
};

const downloadBase64 = (file: IFile): any => {
    const append = `data:${file.mimeType};base64,`;
    const linkSource = `${append}${file.fileBytes}`;
    const downloadLink = document.createElement("a");
    const fileName = file.fileName;

    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
};


const getConstantColour = (colourCode: string): any => {
    const style = getComputedStyle(document.body);
    return style.getPropertyValue(colourCode);
};

const isMobile = (width: number): boolean => {
    // max width of mobile devices is 768
    return width <= 768;
};


export const Helper = {
    isValid,
    isValidText,
    isFile,
    isNumber,
    isDate,
    isEmail,
    isValidArray,
    isValidObject,
    downloadBase64,
    getConstantColour,
    isMobile,
};
