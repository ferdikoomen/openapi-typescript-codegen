declare module 'camelcase' {
    export default function camelcase(
        input: string,
        options?: {
            pascalCase?: boolean;
        }
    ): string;
}
