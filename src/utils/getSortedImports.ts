/**
 * Sort a list of strings and filter out any duplicates.
 * @param imports List of strings.
 */
export function getSortedImports(imports: string[]): string[] {
    return imports
        .filter(name => name)
        .filter(name => name.trim())
        .filter((name: string, index: number, arr: string[]) => {
            return arr.indexOf(name) === index;
        })
        .sort((a, b) => {
            const nameA: string = a.toLowerCase();
            const nameB: string = b.toLowerCase();
            return nameA.localeCompare(nameB, 'en');
        });
}
