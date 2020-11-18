declare module 'rimraf' {
    export default function rimraf(path: string, callback: (error: Error) => void): void;
}
