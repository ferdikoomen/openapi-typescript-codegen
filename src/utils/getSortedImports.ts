/**
 * Sort a list of strings and filter out any duplicates.
 * @param imports List of strings.
 */
export function getSortedImports(imports: string[]): string[] {
    return imports
        .filter(name => name)
        .filter(name => name.trim())
        .filter((name, index, arr) => {
            return arr.indexOf(name) === index;
        })
        .sort((a, b) => {
            const nameA = a.toLowerCase();
            const nameB = b.toLowerCase();
            return nameA.localeCompare(nameB, 'en');
        });
}
