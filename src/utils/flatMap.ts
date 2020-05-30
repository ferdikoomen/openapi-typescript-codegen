/**
 * Calls a defined callback function on each element of an array.
 * Then, flattens the result into a new array.
 */
export function flatMap<U, T>(array: T[], callback: (value: T, index: number, array: T[]) => U[]): U[] {
    const result: U[] = [];
    array.map<U[]>(callback).forEach(arr => {
        result.push(...arr);
    });
    return result;
}
