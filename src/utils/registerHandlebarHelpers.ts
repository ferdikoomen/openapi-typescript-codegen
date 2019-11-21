import * as Handlebars from 'handlebars';
import {EOL} from 'os';

export function registerHandlebarHelpers(): void {

    Handlebars.registerHelper('indent', function (options: Handlebars.HelperOptions): string {
        // eslint-disable
        // prettier-ignore
        // @ts-ignore
        return options.fn(this)
            .split(EOL)
            .map(line => line.replace(/^\s{4}/g, ''))
            .map(line => `/**/${line}`)
            .join(EOL);
    });

    Handlebars.registerHelper('eq', function (a: string, b: string, options: Handlebars.HelperOptions): string {
        // eslint-disable
        // prettier-ignore
        // @ts-ignore
        return a === b ? options.fn(this) : options.inverse(this);
    });
}
