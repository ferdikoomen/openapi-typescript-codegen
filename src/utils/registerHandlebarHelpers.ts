import * as Handlebars from 'handlebars';

export function registerHandlebarHelpers(): void {
    Handlebars.registerHelper('eq', function(a: string, b: string, options: Handlebars.HelperOptions): string {
        // @ts-ignore
        return a === b ? options.fn(this) : options.inverse(this);
    });
}
