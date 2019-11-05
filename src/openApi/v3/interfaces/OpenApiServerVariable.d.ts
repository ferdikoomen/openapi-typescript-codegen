/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#serverVariableObject
 */
export interface OpenApiServerVariable {
    enum?: string[];
    default: string;
    description?: string;
}
