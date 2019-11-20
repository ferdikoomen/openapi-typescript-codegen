// Replace "    /**/}" with "}"
// Replace "    /**/)" with ")"
// Replace "    /**/]" with "]"

export function fixIndentation(s: string): string {
    return s
        .replace(/\s{4}\/\*\*\/\}/g, '}')
        .replace(/\s{4}\/\*\*\/\)/g, ')')
        .replace(/\s{4}\/\*\*\/\]/g, ']');
}
