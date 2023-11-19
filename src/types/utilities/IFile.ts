export interface IFile {
    mimeType: string;
    fileBytes: string;
    fileName: string;
}

export interface IBlobFile {
    buffer: Promise<ArrayBuffer>;
    type: string;
}
