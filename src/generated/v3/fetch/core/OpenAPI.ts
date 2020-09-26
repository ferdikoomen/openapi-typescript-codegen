interface Config {
    BASE: string;
    VERSION: string;
    CLIENT: 'fetch' | 'xhr' | 'node';
    WITH_CREDENTIALS: boolean;
    TOKEN: string;
}

export const OpenAPI: Config = {
    BASE: 'http://localhost:3000/base',
    VERSION: '1.0',
    CLIENT: 'fetch',
    WITH_CREDENTIALS: false,
    TOKEN: '',
};
