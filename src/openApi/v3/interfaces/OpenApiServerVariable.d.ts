import type { WithEnumExtension } from './Extensions/WithEnumExtension';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.2.md#serverVariableObject
 */
export interface OpenApiServerVariable extends WithEnumExtension {
    enum?: (string | number)[];
    default: string;
    description?: string;
}
