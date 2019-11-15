import { EnumSymbol } from '../../../client/interfaces/EnumSymbol';

export function getEnumSymbolsFromDescription(description: string): EnumSymbol[] {
    // Check if we can find this special format string:
    // None=0,Something=1,AnotherThing=2
    if (/^(\w+=[0-9]+,?)+$/g.test(description)) {
        const matches = description.match(/(\w+=[0-9]+,?)/g);
        if (matches) {
            // Grab the values from the description
            const symbols: EnumSymbol[] = [];
            matches.forEach(match => {
                const name = match.split('=')[0];
                const value = parseInt(match.split('=')[1].replace(/[^0-9]/g, ''));
                if (name && Number.isInteger(value)) {
                    symbols.push({
                        name: name.replace(/([a-z])([A-Z]+)/g, '$1_$2').toUpperCase(),
                        value: String(value),
                    });
                }
            });

            // Filter out any duplicate names
            return symbols.filter((symbol, index, arr) => {
                return arr.map(item => item.name).indexOf(symbol.name) === index;
            });
        }
    }

    return [];
}
