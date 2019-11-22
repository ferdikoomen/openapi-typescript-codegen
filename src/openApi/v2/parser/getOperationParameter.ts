import { OpenApiParameter } from '../interfaces/OpenApiParameter';
import { OpenApi } from '../interfaces/OpenApi';
import { getComment } from './getComment';
import { getOperationParameterName } from './getOperationParameterName';
import { OperationParameter } from '../../../client/interfaces/OperationParameter';
import { PrimaryType } from './constants';
import { getType } from './getType';
import { getEnum } from './getEnum';
import { getEnumType } from './getEnumType';
import { getEnumFromDescription } from './getEnumFromDescription';
import { getModel } from './getModel';

export function getOperationParameter(openApi: OpenApi, parameter: OpenApiParameter): OperationParameter {
    const result: OperationParameter = {
        in: parameter.in,
        prop: parameter.name,
        name: getOperationParameterName(parameter.name),
        export: 'interface',
        type: PrimaryType.OBJECT,
        base: PrimaryType.OBJECT,
        template: null,
        description: getComment(parameter.description),
        required: parameter.required || false,
        nullable: false,
        imports: [],
        enum: [],
        model: null,
        default: null,
    };

    if (parameter.$ref) {
        const definitionRef = getType(parameter.$ref);
        result.export = 'reference';
        result.type = definitionRef.type;
        result.base = definitionRef.base;
        result.template = definitionRef.template;
        result.imports.push(...definitionRef.imports);
        return result;
    }

    if (parameter.enum) {
        const enumerators = getEnum(parameter.enum);
        if (enumerators.length) {
            result.export = 'enum';
            result.type = getEnumType(enumerators);
            result.base = PrimaryType.STRING;
            result.enum.push(...enumerators);
            return result;
        }
    }

    if ((parameter.type === 'int' || parameter.type === 'integer') && parameter.description) {
        const enumerators = getEnumFromDescription(parameter.description);
        if (enumerators.length) {
            result.export = 'enum';
            result.type = getEnumType(enumerators);
            result.base = PrimaryType.NUMBER;
            result.enum.push(...enumerators);
            return result;
        }
    }

    // if (parameter.type === 'array' && parameter.items) {
    //     const arrayItems = getModel(openApi, parameter.items);
    //     result.export = 'array';
    //     result.type = arrayItems.type;
    //     result.base = arrayItems.base;
    //     result.template = arrayItems.template;
    //     result.link = arrayItems;
    //     result.imports.push(...arrayItems.imports);
    //     return result;
    // }

    if (parameter.schema) {
        if (parameter.schema.$ref) {
            const model = getType(parameter.schema.$ref);
            result.export = 'reference';
            result.type = model.type;
            result.base = model.base;
            result.template = model.template;
            result.imports.push(...model.imports);
        } else {
            const model = getModel(openApi, parameter.schema);
            result.export = 'interface';
            result.type = model.type;
            result.base = model.base;
            result.template = model.template;
            result.imports.push(...model.imports);
            result.model = model;
        }
    }

    // If the parameter has a type than it can be a basic or generic type.
    if (parameter.type) {
        const definitionType = getType(parameter.type);
        result.export = 'generic';
        result.type = definitionType.type;
        result.base = definitionType.base;
        result.template = definitionType.template;
        result.imports.push(...definitionType.imports);
        return result;
    }

    return result;
}
