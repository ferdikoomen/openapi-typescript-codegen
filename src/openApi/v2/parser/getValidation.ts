export function getValidation(validation: string, required: boolean = false, nullable: boolean = false): string {
    if (required) {
        validation = `${validation}.required()`;
    }

    if (nullable) {
        validation = `${validation}.nullable()`;
    }

    return validation;
}
