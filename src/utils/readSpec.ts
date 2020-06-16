import { readSpecFromDisk } from './readSpecFromDisk';
import { readSpecFromHttp } from './readSpecFromHttp';
import { readSpecFromHttps } from './readSpecFromHttps';

export async function readSpec(input: string): Promise<string> {
    if (input.startsWith('https://')) {
        return await readSpecFromHttps(input);
    }
    if (input.startsWith('http://')) {
        return await readSpecFromHttp(input);
    }
    return await readSpecFromDisk(input);
}
