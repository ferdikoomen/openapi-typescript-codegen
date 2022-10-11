'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var camelCase = require('camelcase');
var RefParser = require('json-schema-ref-parser');
var os = require('os');
var path = require('path');
var fsExtra = require('fs-extra');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var camelCase__default = /*#__PURE__*/_interopDefaultLegacy(camelCase);
var RefParser__default = /*#__PURE__*/_interopDefaultLegacy(RefParser);

exports.HttpClient = void 0;
(function (HttpClient) {
    HttpClient["FETCH"] = "fetch";
    HttpClient["XHR"] = "xhr";
    HttpClient["NODE"] = "node";
    HttpClient["AXIOS"] = "axios";
    HttpClient["ANGULAR"] = "angular";
})(exports.HttpClient || (exports.HttpClient = {}));

exports.Indent = void 0;
(function (Indent) {
    Indent["SPACE_4"] = "4";
    Indent["SPACE_2"] = "2";
    Indent["TAB"] = "tab";
})(exports.Indent || (exports.Indent = {}));

/**
 * The spec generates a pattern like this '^\d{3}-\d{2}-\d{4}$'
 * However, to use it in HTML or inside new RegExp() we need to
 * escape the pattern to become: '^\\d{3}-\\d{2}-\\d{4}$' in order
 * to make it a valid regexp string.
 * @param pattern
 */
const getPattern = (pattern) => {
    return pattern === null || pattern === void 0 ? void 0 : pattern.replace(/\\/g, '\\\\');
};

const isString = (val) => {
    return typeof val === 'string';
};

/**
 * Extend the enum with the x-enum properties. This adds the capability
 * to use names and descriptions inside the generated enums.
 * @param enumerators
 * @param definition
 */
const extendEnum$1 = (enumerators, definition) => {
    var _a, _b;
    const names = (_a = definition['x-enum-varnames']) === null || _a === void 0 ? void 0 : _a.filter(isString);
    const descriptions = (_b = definition['x-enum-descriptions']) === null || _b === void 0 ? void 0 : _b.filter(isString);
    return enumerators.map((enumerator, index) => ({
        name: (names === null || names === void 0 ? void 0 : names[index]) || enumerator.name,
        description: (descriptions === null || descriptions === void 0 ? void 0 : descriptions[index]) || enumerator.description,
        value: enumerator.value,
        type: enumerator.type,
    }));
};

const getEnum$1 = (values) => {
    if (Array.isArray(values)) {
        return values
            .filter((value, index, arr) => {
            return arr.indexOf(value) === index;
        })
            .filter((value) => {
            return typeof value === 'number' || typeof value === 'string';
        })
            .map(value => {
            if (typeof value === 'number') {
                return {
                    name: `'_${value}'`,
                    value: String(value),
                    type: 'number',
                    description: null,
                };
            }
            return {
                name: String(value)
                    .replace(/\W+/g, '_')
                    .replace(/^(\d+)/g, '_$1')
                    .replace(/([a-z])([A-Z]+)/g, '$1_$2')
                    .toUpperCase(),
                value: `'${value.replace(/'/g, "\\'")}'`,
                type: 'string',
                description: null,
            };
        });
    }
    return [];
};

const escapeName$1 = (value) => {
    if (value || value === '') {
        const validName = /^[a-zA-Z_$][\w$]+$/g.test(value);
        if (!validName) {
            return `'${value}'`;
        }
    }
    return value;
};

const TYPE_MAPPINGS$1 = new Map([
    ['file', 'binary'],
    ['any', 'any'],
    ['object', 'any'],
    ['array', 'any[]'],
    ['boolean', 'boolean'],
    ['byte', 'number'],
    ['int', 'number'],
    ['integer', 'number'],
    ['float', 'number'],
    ['double', 'number'],
    ['short', 'number'],
    ['long', 'number'],
    ['number', 'number'],
    ['char', 'string'],
    ['date', 'string'],
    ['date-time', 'string'],
    ['password', 'string'],
    ['string', 'string'],
    ['void', 'void'],
    ['null', 'null'],
]);
/**
 * Get mapped type for given type to any basic Typescript/Javascript type.
 */
const getMappedType$1 = (type, format) => {
    if (format === 'binary') {
        return 'binary';
    }
    return TYPE_MAPPINGS$1.get(type);
};

/**
 * Strip (OpenAPI) namespaces fom values.
 * @param value
 */
const stripNamespace$1 = (value) => {
    return value
        .trim()
        .replace(/^#\/definitions\//, '')
        .replace(/^#\/parameters\//, '')
        .replace(/^#\/responses\//, '')
        .replace(/^#\/securityDefinitions\//, '');
};

const encode$1 = (value) => {
    return value.replace(/^[^a-zA-Z_$]+/g, '').replace(/[^\w$]+/g, '_');
};
/**
 * Parse any string value into a type object.
 * @param type String value like "integer" or "Link[Model]".
 * @param format String value like "binary" or "date".
 */
const getType$1 = (type = 'any', format) => {
    const result = {
        type: 'any',
        base: 'any',
        template: null,
        imports: [],
        isNullable: false,
    };
    const mapped = getMappedType$1(type, format);
    if (mapped) {
        result.type = mapped;
        result.base = mapped;
        return result;
    }
    const typeWithoutNamespace = decodeURIComponent(stripNamespace$1(type));
    if (/\[.*\]$/g.test(typeWithoutNamespace)) {
        const matches = typeWithoutNamespace.match(/(.*?)\[(.*)\]$/);
        if (matches === null || matches === void 0 ? void 0 : matches.length) {
            const match1 = getType$1(encode$1(matches[1]));
            const match2 = getType$1(encode$1(matches[2]));
            if (match1.type === 'any[]') {
                result.type = `${match2.type}[]`;
                result.base = match2.type;
                match1.imports = [];
            }
            else if (match2.type) {
                result.type = `${match1.type}<${match2.type}>`;
                result.base = match1.type;
                result.template = match2.type;
            }
            else {
                result.type = match1.type;
                result.base = match1.type;
                result.template = match1.type;
            }
            result.imports.push(...match1.imports);
            result.imports.push(...match2.imports);
            return result;
        }
    }
    if (typeWithoutNamespace) {
        const type = encode$1(typeWithoutNamespace);
        result.type = type;
        result.base = type;
        result.imports.push(type);
        return result;
    }
    return result;
};

const getModelProperties$1 = (openApi, definition, getModel) => {
    var _a;
    const models = [];
    for (const propertyName in definition.properties) {
        if (definition.properties.hasOwnProperty(propertyName)) {
            const property = definition.properties[propertyName];
            const propertyRequired = !!((_a = definition.required) === null || _a === void 0 ? void 0 : _a.includes(propertyName));
            if (property.$ref) {
                const model = getType$1(property.$ref);
                models.push({
                    name: escapeName$1(propertyName),
                    export: 'reference',
                    type: model.type,
                    base: model.base,
                    template: model.template,
                    link: null,
                    description: property.description || null,
                    isDefinition: false,
                    isReadOnly: property.readOnly === true,
                    isRequired: propertyRequired,
                    isNullable: property['x-nullable'] === true,
                    format: property.format,
                    maximum: property.maximum,
                    exclusiveMaximum: property.exclusiveMaximum,
                    minimum: property.minimum,
                    exclusiveMinimum: property.exclusiveMinimum,
                    multipleOf: property.multipleOf,
                    maxLength: property.maxLength,
                    minLength: property.minLength,
                    maxItems: property.maxItems,
                    minItems: property.minItems,
                    uniqueItems: property.uniqueItems,
                    maxProperties: property.maxProperties,
                    minProperties: property.minProperties,
                    pattern: getPattern(property.pattern),
                    imports: model.imports,
                    enum: [],
                    enums: [],
                    properties: [],
                });
            }
            else {
                const model = getModel(openApi, property);
                models.push({
                    name: escapeName$1(propertyName),
                    export: model.export,
                    type: model.type,
                    base: model.base,
                    template: model.template,
                    link: model.link,
                    description: property.description || null,
                    isDefinition: false,
                    isReadOnly: property.readOnly === true,
                    isRequired: propertyRequired,
                    isNullable: property['x-nullable'] === true,
                    format: property.format,
                    maximum: property.maximum,
                    exclusiveMaximum: property.exclusiveMaximum,
                    minimum: property.minimum,
                    exclusiveMinimum: property.exclusiveMinimum,
                    multipleOf: property.multipleOf,
                    maxLength: property.maxLength,
                    minLength: property.minLength,
                    maxItems: property.maxItems,
                    minItems: property.minItems,
                    uniqueItems: property.uniqueItems,
                    maxProperties: property.maxProperties,
                    minProperties: property.minProperties,
                    pattern: getPattern(property.pattern),
                    imports: model.imports,
                    enum: model.enum,
                    enums: model.enums,
                    properties: model.properties,
                });
            }
        }
    }
    return models;
};

const ESCAPED_REF_SLASH$1 = /~1/g;
const ESCAPED_REF_TILDE$1 = /~0/g;
const getRef$1 = (openApi, item) => {
    if (item.$ref) {
        // Fetch the paths to the definitions, this converts:
        // "#/definitions/Form" to ["definitions", "Form"]
        const paths = item.$ref
            .replace(/^#/g, '')
            .split('/')
            .filter(item => item);
        // Try to find the reference by walking down the path,
        // if we cannot find it, then we throw an error.
        let result = openApi;
        paths.forEach(path => {
            const decodedPath = decodeURIComponent(path.replace(ESCAPED_REF_SLASH$1, '/').replace(ESCAPED_REF_TILDE$1, '~'));
            if (result.hasOwnProperty(decodedPath)) {
                result = result[decodedPath];
            }
            else {
                throw new Error(`Could not find reference: "${item.$ref}"`);
            }
        });
        return result;
    }
    return item;
};

const getRequiredPropertiesFromComposition$1 = (openApi, required, definitions, getModel) => {
    return definitions
        .reduce((properties, definition) => {
        if (definition.$ref) {
            const schema = getRef$1(openApi, definition);
            return [...properties, ...getModel(openApi, schema).properties];
        }
        return [...properties, ...getModel(openApi, definition).properties];
    }, [])
        .filter(property => {
        return !property.isRequired && required.includes(property.name);
    })
        .map(property => {
        return {
            ...property,
            isRequired: true,
        };
    });
};

const getModelComposition$1 = (openApi, definition, definitions, type, getModel) => {
    const composition = {
        type,
        imports: [],
        enums: [],
        properties: [],
    };
    const properties = [];
    definitions
        .map(definition => getModel(openApi, definition))
        .filter(model => {
        const hasProperties = model.properties.length;
        const hasEnums = model.enums.length;
        const isObject = model.type === 'any';
        const isEmpty = isObject && !hasProperties && !hasEnums;
        return !isEmpty;
    })
        .forEach(model => {
        composition.imports.push(...model.imports);
        composition.enums.push(...model.enums);
        composition.properties.push(model);
    });
    if (definition.required) {
        const requiredProperties = getRequiredPropertiesFromComposition$1(openApi, definition.required, definitions, getModel);
        requiredProperties.forEach(requiredProperty => {
            composition.imports.push(...requiredProperty.imports);
            composition.enums.push(...requiredProperty.enums);
        });
        properties.push(...requiredProperties);
    }
    if (definition.properties) {
        const modelProperties = getModelProperties$1(openApi, definition, getModel);
        modelProperties.forEach(modelProperty => {
            composition.imports.push(...modelProperty.imports);
            composition.enums.push(...modelProperty.enums);
            if (modelProperty.export === 'enum') {
                composition.enums.push(modelProperty);
            }
        });
        properties.push(...modelProperties);
    }
    if (properties.length) {
        composition.properties.push({
            name: 'properties',
            export: 'interface',
            type: 'any',
            base: 'any',
            template: null,
            link: null,
            description: '',
            isDefinition: false,
            isReadOnly: false,
            isNullable: false,
            isRequired: false,
            imports: [],
            enum: [],
            enums: [],
            properties,
        });
    }
    return composition;
};

const getModel$1 = (openApi, definition, isDefinition = false, name = '') => {
    var _a;
    const model = {
        name,
        export: 'interface',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        description: definition.description || null,
        isDefinition,
        isReadOnly: definition.readOnly === true,
        isNullable: definition['x-nullable'] === true,
        isRequired: false,
        format: definition.format,
        maximum: definition.maximum,
        exclusiveMaximum: definition.exclusiveMaximum,
        minimum: definition.minimum,
        exclusiveMinimum: definition.exclusiveMinimum,
        multipleOf: definition.multipleOf,
        maxLength: definition.maxLength,
        minLength: definition.minLength,
        maxItems: definition.maxItems,
        minItems: definition.minItems,
        uniqueItems: definition.uniqueItems,
        maxProperties: definition.maxProperties,
        minProperties: definition.minProperties,
        pattern: getPattern(definition.pattern),
        imports: [],
        enum: [],
        enums: [],
        properties: [],
    };
    if (definition.$ref) {
        const definitionRef = getType$1(definition.$ref);
        model.export = 'reference';
        model.type = definitionRef.type;
        model.base = definitionRef.base;
        model.template = definitionRef.template;
        model.imports.push(...definitionRef.imports);
        return model;
    }
    if (definition.enum && definition.type !== 'boolean') {
        const enumerators = getEnum$1(definition.enum);
        const extendedEnumerators = extendEnum$1(enumerators, definition);
        if (extendedEnumerators.length) {
            model.export = 'enum';
            model.type = 'string';
            model.base = 'string';
            model.enum.push(...extendedEnumerators);
            return model;
        }
    }
    if (definition.type === 'array' && definition.items) {
        if (definition.items.$ref) {
            const arrayItems = getType$1(definition.items.$ref);
            model.export = 'array';
            model.type = arrayItems.type;
            model.base = arrayItems.base;
            model.template = arrayItems.template;
            model.imports.push(...arrayItems.imports);
            return model;
        }
        else {
            const arrayItems = getModel$1(openApi, definition.items);
            model.export = 'array';
            model.type = arrayItems.type;
            model.base = arrayItems.base;
            model.template = arrayItems.template;
            model.link = arrayItems;
            model.imports.push(...arrayItems.imports);
            return model;
        }
    }
    if (definition.type === 'object' && typeof definition.additionalProperties === 'object') {
        if (definition.additionalProperties.$ref) {
            const additionalProperties = getType$1(definition.additionalProperties.$ref);
            model.export = 'dictionary';
            model.type = additionalProperties.type;
            model.base = additionalProperties.base;
            model.template = additionalProperties.template;
            model.imports.push(...additionalProperties.imports);
            return model;
        }
        else {
            const additionalProperties = getModel$1(openApi, definition.additionalProperties);
            model.export = 'dictionary';
            model.type = additionalProperties.type;
            model.base = additionalProperties.base;
            model.template = additionalProperties.template;
            model.link = additionalProperties;
            model.imports.push(...additionalProperties.imports);
            return model;
        }
    }
    if ((_a = definition.allOf) === null || _a === void 0 ? void 0 : _a.length) {
        const composition = getModelComposition$1(openApi, definition, definition.allOf, 'all-of', getModel$1);
        model.export = composition.type;
        model.imports.push(...composition.imports);
        model.properties.push(...composition.properties);
        model.enums.push(...composition.enums);
        return model;
    }
    if (definition.type === 'object') {
        model.export = 'interface';
        model.type = 'any';
        model.base = 'any';
        if (definition.properties) {
            const modelProperties = getModelProperties$1(openApi, definition, getModel$1);
            modelProperties.forEach(modelProperty => {
                model.imports.push(...modelProperty.imports);
                model.enums.push(...modelProperty.enums);
                model.properties.push(modelProperty);
                if (modelProperty.export === 'enum') {
                    model.enums.push(modelProperty);
                }
            });
        }
        return model;
    }
    // If the schema has a type than it can be a basic or generic type.
    if (definition.type) {
        const definitionType = getType$1(definition.type, definition.format);
        model.export = 'generic';
        model.type = definitionType.type;
        model.base = definitionType.base;
        model.template = definitionType.template;
        model.imports.push(...definitionType.imports);
        return model;
    }
    return model;
};

const getModels$1 = (openApi) => {
    const models = [];
    for (const definitionName in openApi.definitions) {
        if (openApi.definitions.hasOwnProperty(definitionName)) {
            const definition = openApi.definitions[definitionName];
            const definitionType = getType$1(definitionName);
            const model = getModel$1(openApi, definition, true, definitionType.base);
            models.push(model);
        }
    }
    return models;
};

/**
 * Get the base server url.
 * @param openApi
 */
const getServer$1 = (openApi) => {
    var _a;
    const scheme = ((_a = openApi.schemes) === null || _a === void 0 ? void 0 : _a[0]) || 'http';
    const host = openApi.host;
    const basePath = openApi.basePath || '';
    const url = host ? `${scheme}://${host}${basePath}` : basePath;
    return url.replace(/\/$/g, '');
};

const unique = (val, index, arr) => {
    return arr.indexOf(val) === index;
};

/**
 *
 * @param operationResponses
 */
const getOperationErrors$1 = (operationResponses) => {
    return operationResponses
        .filter(operationResponse => {
        return operationResponse.code >= 300 && operationResponse.description;
    })
        .map(response => ({
        code: response.code,
        description: response.description,
    }));
};

/**
 * Convert the input value to a correct operation (method) classname.
 * This will use the operation ID - if available - and otherwise fallback
 * on a generated name from the URL
 */
const getOperationName$1 = (url, method, operationId) => {
    if (operationId) {
        return camelCase__default["default"](operationId
            .replace(/^[^a-zA-Z]+/g, '')
            .replace(/[^\w\-]+/g, '-')
            .trim());
    }
    const urlWithoutPlaceholders = url
        .replace(/[^/]*?{api-version}.*?\//g, '')
        .replace(/{(.*?)}/g, '')
        .replace(/\//g, '-');
    return camelCase__default["default"](`${method}-${urlWithoutPlaceholders}`);
};

const getOperationParameterDefault = (parameter, operationParameter) => {
    var _a;
    if (parameter.default === undefined) {
        return undefined;
    }
    if (parameter.default === null) {
        return 'null';
    }
    const type = parameter.type || typeof parameter.default;
    switch (type) {
        case 'int':
        case 'integer':
        case 'number':
            if (operationParameter.export === 'enum' && ((_a = operationParameter.enum) === null || _a === void 0 ? void 0 : _a[parameter.default])) {
                return operationParameter.enum[parameter.default].value;
            }
            return parameter.default;
        case 'boolean':
            return JSON.stringify(parameter.default);
        case 'string':
            return `'${parameter.default}'`;
        case 'object':
            try {
                return JSON.stringify(parameter.default, null, 4);
            }
            catch (e) {
                // Ignore
            }
    }
    return undefined;
};

const reservedWords$1 = /^(arguments|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/g;
/**
 * Replaces any invalid characters from a parameter name.
 * For example: 'filter.someProperty' becomes 'filterSomeProperty'.
 */
const getOperationParameterName$1 = (value) => {
    const clean = value
        .replace(/^[^a-zA-Z]+/g, '')
        .replace(/[^\w\-]+/g, '-')
        .trim();
    return camelCase__default["default"](clean).replace(reservedWords$1, '_$1');
};

const getOperationParameter$1 = (openApi, parameter) => {
    var _a;
    const operationParameter = {
        in: parameter.in,
        prop: parameter.name,
        export: 'interface',
        name: getOperationParameterName$1(parameter.name),
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        description: parameter.description || null,
        isDefinition: false,
        isReadOnly: false,
        isRequired: parameter.required === true,
        isNullable: parameter['x-nullable'] === true,
        format: parameter.format,
        maximum: parameter.maximum,
        exclusiveMaximum: parameter.exclusiveMaximum,
        minimum: parameter.minimum,
        exclusiveMinimum: parameter.exclusiveMinimum,
        multipleOf: parameter.multipleOf,
        maxLength: parameter.maxLength,
        minLength: parameter.minLength,
        maxItems: parameter.maxItems,
        minItems: parameter.minItems,
        uniqueItems: parameter.uniqueItems,
        pattern: getPattern(parameter.pattern),
        imports: [],
        enum: [],
        enums: [],
        properties: [],
        mediaType: null,
    };
    if (parameter.$ref) {
        const definitionRef = getType$1(parameter.$ref);
        operationParameter.export = 'reference';
        operationParameter.type = definitionRef.type;
        operationParameter.base = definitionRef.base;
        operationParameter.template = definitionRef.template;
        operationParameter.imports.push(...definitionRef.imports);
        operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
        return operationParameter;
    }
    if (parameter.enum) {
        const enumerators = getEnum$1(parameter.enum);
        const extendedEnumerators = extendEnum$1(enumerators, parameter);
        if (extendedEnumerators.length) {
            operationParameter.export = 'enum';
            operationParameter.type = 'string';
            operationParameter.base = 'string';
            operationParameter.enum.push(...extendedEnumerators);
            operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
            return operationParameter;
        }
    }
    if (parameter.type === 'array' && parameter.items) {
        const items = getType$1(parameter.items.type, parameter.items.format);
        operationParameter.export = 'array';
        operationParameter.type = items.type;
        operationParameter.base = items.base;
        operationParameter.template = items.template;
        operationParameter.imports.push(...items.imports);
        operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
        return operationParameter;
    }
    if (parameter.type === 'object' && parameter.items) {
        const items = getType$1(parameter.items.type, parameter.items.format);
        operationParameter.export = 'dictionary';
        operationParameter.type = items.type;
        operationParameter.base = items.base;
        operationParameter.template = items.template;
        operationParameter.imports.push(...items.imports);
        operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
        return operationParameter;
    }
    let schema = parameter.schema;
    if (schema) {
        if ((_a = schema.$ref) === null || _a === void 0 ? void 0 : _a.startsWith('#/parameters/')) {
            schema = getRef$1(openApi, schema);
        }
        if (schema.$ref) {
            const model = getType$1(schema.$ref);
            operationParameter.export = 'reference';
            operationParameter.type = model.type;
            operationParameter.base = model.base;
            operationParameter.template = model.template;
            operationParameter.imports.push(...model.imports);
            operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
            return operationParameter;
        }
        else {
            const model = getModel$1(openApi, schema);
            operationParameter.export = model.export;
            operationParameter.type = model.type;
            operationParameter.base = model.base;
            operationParameter.template = model.template;
            operationParameter.link = model.link;
            operationParameter.imports.push(...model.imports);
            operationParameter.enum.push(...model.enum);
            operationParameter.enums.push(...model.enums);
            operationParameter.properties.push(...model.properties);
            operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
            return operationParameter;
        }
    }
    // If the parameter has a type than it can be a basic or generic type.
    if (parameter.type) {
        const definitionType = getType$1(parameter.type, parameter.format);
        operationParameter.export = 'generic';
        operationParameter.type = definitionType.type;
        operationParameter.base = definitionType.base;
        operationParameter.template = definitionType.template;
        operationParameter.imports.push(...definitionType.imports);
        operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
        return operationParameter;
    }
    return operationParameter;
};

const getOperationParameters$1 = (openApi, parameters) => {
    const operationParameters = {
        imports: [],
        parameters: [],
        parametersPath: [],
        parametersQuery: [],
        parametersForm: [],
        parametersCookie: [],
        parametersHeader: [],
        parametersBody: null,
    };
    // Iterate over the parameters
    parameters.forEach(parameterOrReference => {
        const parameterDef = getRef$1(openApi, parameterOrReference);
        const parameter = getOperationParameter$1(openApi, parameterDef);
        // We ignore the "api-version" param, since we do not want to add this
        // as the first / default parameter for each of the service calls.
        if (parameter.prop !== 'api-version') {
            switch (parameter.in) {
                case 'path':
                    operationParameters.parametersPath.push(parameter);
                    operationParameters.parameters.push(parameter);
                    operationParameters.imports.push(...parameter.imports);
                    break;
                case 'query':
                    operationParameters.parametersQuery.push(parameter);
                    operationParameters.parameters.push(parameter);
                    operationParameters.imports.push(...parameter.imports);
                    break;
                case 'header':
                    operationParameters.parametersHeader.push(parameter);
                    operationParameters.parameters.push(parameter);
                    operationParameters.imports.push(...parameter.imports);
                    break;
                case 'formData':
                    operationParameters.parametersForm.push(parameter);
                    operationParameters.parameters.push(parameter);
                    operationParameters.imports.push(...parameter.imports);
                    break;
                case 'body':
                    operationParameters.parametersBody = parameter;
                    operationParameters.parameters.push(parameter);
                    operationParameters.imports.push(...parameter.imports);
                    break;
            }
        }
    });
    return operationParameters;
};

const getOperationResponseHeader$1 = (operationResponses) => {
    const header = operationResponses.find(operationResponses => {
        return operationResponses.in === 'header';
    });
    if (header) {
        return header.name;
    }
    return null;
};

const getOperationResponse$1 = (openApi, response, responseCode) => {
    var _a;
    const operationResponse = {
        in: 'response',
        name: '',
        code: responseCode,
        description: response.description || null,
        export: 'generic',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        isDefinition: false,
        isReadOnly: false,
        isRequired: false,
        isNullable: false,
        imports: [],
        enum: [],
        enums: [],
        properties: [],
    };
    // If this response has a schema, then we need to check two things:
    // if this is a reference then the parameter is just the 'name' of
    // this reference type. Otherwise, it might be a complex schema,
    // and then we need to parse the schema!
    let schema = response.schema;
    if (schema) {
        if ((_a = schema.$ref) === null || _a === void 0 ? void 0 : _a.startsWith('#/responses/')) {
            schema = getRef$1(openApi, schema);
        }
        if (schema.$ref) {
            const model = getType$1(schema.$ref);
            operationResponse.export = 'reference';
            operationResponse.type = model.type;
            operationResponse.base = model.base;
            operationResponse.template = model.template;
            operationResponse.imports.push(...model.imports);
            return operationResponse;
        }
        else {
            const model = getModel$1(openApi, schema);
            operationResponse.export = model.export;
            operationResponse.type = model.type;
            operationResponse.base = model.base;
            operationResponse.template = model.template;
            operationResponse.link = model.link;
            operationResponse.isReadOnly = model.isReadOnly;
            operationResponse.isRequired = model.isRequired;
            operationResponse.isNullable = model.isNullable;
            operationResponse.format = model.format;
            operationResponse.maximum = model.maximum;
            operationResponse.exclusiveMaximum = model.exclusiveMaximum;
            operationResponse.minimum = model.minimum;
            operationResponse.exclusiveMinimum = model.exclusiveMinimum;
            operationResponse.multipleOf = model.multipleOf;
            operationResponse.maxLength = model.maxLength;
            operationResponse.minLength = model.minLength;
            operationResponse.maxItems = model.maxItems;
            operationResponse.minItems = model.minItems;
            operationResponse.uniqueItems = model.uniqueItems;
            operationResponse.maxProperties = model.maxProperties;
            operationResponse.minProperties = model.minProperties;
            operationResponse.pattern = getPattern(model.pattern);
            operationResponse.imports.push(...model.imports);
            operationResponse.enum.push(...model.enum);
            operationResponse.enums.push(...model.enums);
            operationResponse.properties.push(...model.properties);
            return operationResponse;
        }
    }
    // We support basic properties from response headers, since both
    // fetch and XHR client just support string types.
    if (response.headers) {
        for (const name in response.headers) {
            if (response.headers.hasOwnProperty(name)) {
                operationResponse.in = 'header';
                operationResponse.name = name;
                operationResponse.type = 'string';
                operationResponse.base = 'string';
                return operationResponse;
            }
        }
    }
    return operationResponse;
};

const getOperationResponseCode$1 = (value) => {
    // You can specify a "default" response, this is treated as HTTP code 200
    if (value === 'default') {
        return 200;
    }
    // Check if we can parse the code and return of successful.
    if (/[0-9]+/g.test(value)) {
        const code = parseInt(value);
        if (Number.isInteger(code)) {
            return Math.abs(code);
        }
    }
    return null;
};

const getOperationResponses$1 = (openApi, responses) => {
    const operationResponses = [];
    // Iterate over each response code and get the
    // status code and response message (if any).
    for (const code in responses) {
        if (responses.hasOwnProperty(code)) {
            const responseOrReference = responses[code];
            const response = getRef$1(openApi, responseOrReference);
            const responseCode = getOperationResponseCode$1(code);
            if (responseCode) {
                const operationResponse = getOperationResponse$1(openApi, response, responseCode);
                operationResponses.push(operationResponse);
            }
        }
    }
    // Sort the responses to 2XX success codes come before 4XX and 5XX error codes.
    return operationResponses.sort((a, b) => {
        return a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
    });
};

const areEqual$1 = (a, b) => {
    const equal = a.type === b.type && a.base === b.base && a.template === b.template;
    if (equal && a.link && b.link) {
        return areEqual$1(a.link, b.link);
    }
    return equal;
};
const getOperationResults$1 = (operationResponses) => {
    const operationResults = [];
    // Filter out success response codes, but skip "204 No Content"
    operationResponses.forEach(operationResponse => {
        const { code } = operationResponse;
        if (code && code !== 204 && code >= 200 && code < 300) {
            operationResults.push(operationResponse);
        }
    });
    if (!operationResults.length) {
        operationResults.push({
            in: 'response',
            name: '',
            code: 200,
            description: '',
            export: 'generic',
            type: 'void',
            base: 'void',
            template: null,
            link: null,
            isDefinition: false,
            isReadOnly: false,
            isRequired: false,
            isNullable: false,
            imports: [],
            enum: [],
            enums: [],
            properties: [],
        });
    }
    return operationResults.filter((operationResult, index, arr) => {
        return (arr.findIndex(item => {
            return areEqual$1(item, operationResult);
        }) === index);
    });
};

/**
 * Convert the input value to a correct service name. This converts
 * the input string to PascalCase.
 */
const getServiceName$1 = (value) => {
    const clean = value
        .replace(/^[^a-zA-Z]+/g, '')
        .replace(/[^\w\-]+/g, '-')
        .trim();
    return camelCase__default["default"](clean, { pascalCase: true });
};

const sortByRequired$1 = (a, b) => {
    const aNeedsValue = a.isRequired && a.default === undefined;
    const bNeedsValue = b.isRequired && b.default === undefined;
    if (aNeedsValue && !bNeedsValue)
        return -1;
    if (bNeedsValue && !aNeedsValue)
        return 1;
    return 0;
};

const getOperation$1 = (openApi, url, method, tag, op, pathParams) => {
    const serviceName = getServiceName$1(tag);
    const operationName = getOperationName$1(url, method, op.operationId);
    // Create a new operation object for this method.
    const operation = {
        service: serviceName,
        name: operationName,
        summary: op.summary || null,
        description: op.description || null,
        deprecated: op.deprecated === true,
        method: method.toUpperCase(),
        path: url,
        parameters: [...pathParams.parameters],
        parametersPath: [...pathParams.parametersPath],
        parametersQuery: [...pathParams.parametersQuery],
        parametersForm: [...pathParams.parametersForm],
        parametersHeader: [...pathParams.parametersHeader],
        parametersCookie: [...pathParams.parametersCookie],
        parametersBody: pathParams.parametersBody,
        imports: [],
        errors: [],
        results: [],
        responseHeader: null,
    };
    // Parse the operation parameters (path, query, body, etc).
    if (op.parameters) {
        const parameters = getOperationParameters$1(openApi, op.parameters);
        operation.imports.push(...parameters.imports);
        operation.parameters.push(...parameters.parameters);
        operation.parametersPath.push(...parameters.parametersPath);
        operation.parametersQuery.push(...parameters.parametersQuery);
        operation.parametersForm.push(...parameters.parametersForm);
        operation.parametersHeader.push(...parameters.parametersHeader);
        operation.parametersCookie.push(...parameters.parametersCookie);
        operation.parametersBody = parameters.parametersBody;
    }
    // Parse the operation responses.
    if (op.responses) {
        const operationResponses = getOperationResponses$1(openApi, op.responses);
        const operationResults = getOperationResults$1(operationResponses);
        operation.errors = getOperationErrors$1(operationResponses);
        operation.responseHeader = getOperationResponseHeader$1(operationResults);
        operationResults.forEach(operationResult => {
            operation.results.push(operationResult);
            operation.imports.push(...operationResult.imports);
        });
    }
    operation.parameters = operation.parameters.sort(sortByRequired$1);
    return operation;
};

/**
 * Get the OpenAPI services
 */
const getServices$1 = (openApi) => {
    var _a;
    const services = new Map();
    for (const url in openApi.paths) {
        if (openApi.paths.hasOwnProperty(url)) {
            // Grab path and parse any global path parameters
            const path = openApi.paths[url];
            const pathParams = getOperationParameters$1(openApi, path.parameters || []);
            // Parse all the methods for this path
            for (const method in path) {
                if (path.hasOwnProperty(method)) {
                    switch (method) {
                        case 'get':
                        case 'put':
                        case 'post':
                        case 'delete':
                        case 'options':
                        case 'head':
                        case 'patch':
                            // Each method contains an OpenAPI operation, we parse the operation
                            const op = path[method];
                            const tags = ((_a = op.tags) === null || _a === void 0 ? void 0 : _a.length) ? op.tags.filter(unique) : ['Default'];
                            tags.forEach(tag => {
                                const operation = getOperation$1(openApi, url, method, tag, op, pathParams);
                                // If we have already declared a service, then we should fetch that and
                                // append the new method to it. Otherwise we should create a new service object.
                                const service = services.get(operation.service) || {
                                    name: operation.service,
                                    operations: [],
                                    imports: [],
                                };
                                // Push the operation in the service
                                service.operations.push(operation);
                                service.imports.push(...operation.imports);
                                services.set(operation.service, service);
                            });
                            break;
                    }
                }
            }
        }
    }
    return Array.from(services.values());
};

/**
 * Convert the service version to 'normal' version.
 * This basically removes any "v" prefix from the version string.
 * @param version
 */
const getServiceVersion$1 = (version = '1.0') => {
    return String(version).replace(/^v/gi, '');
};

/**
 * Parse the OpenAPI specification to a Client model that contains
 * all the models, services and schema's we should output.
 * @param openApi The OpenAPI spec  that we have loaded from disk.
 */
const parse$1 = (openApi) => {
    const version = getServiceVersion$1(openApi.info.version);
    const server = getServer$1(openApi);
    const models = getModels$1(openApi);
    const services = getServices$1(openApi);
    return { version, server, models, services };
};

/**
 * Extend the enum with the x-enum properties. This adds the capability
 * to use names and descriptions inside the generated enums.
 * @param enumerators
 * @param definition
 */
const extendEnum = (enumerators, definition) => {
    var _a, _b;
    const names = (_a = definition['x-enum-varnames']) === null || _a === void 0 ? void 0 : _a.filter(isString);
    const descriptions = (_b = definition['x-enum-descriptions']) === null || _b === void 0 ? void 0 : _b.filter(isString);
    return enumerators.map((enumerator, index) => ({
        name: (names === null || names === void 0 ? void 0 : names[index]) || enumerator.name,
        description: (descriptions === null || descriptions === void 0 ? void 0 : descriptions[index]) || enumerator.description,
        value: enumerator.value,
        type: enumerator.type,
    }));
};

const getEnum = (values) => {
    if (Array.isArray(values)) {
        return values
            .filter((value, index, arr) => {
            return arr.indexOf(value) === index;
        })
            .filter((value) => {
            return typeof value === 'number' || typeof value === 'string';
        })
            .map(value => {
            if (typeof value === 'number') {
                return {
                    name: `'_${value}'`,
                    value: String(value),
                    type: 'number',
                    description: null,
                };
            }
            return {
                name: String(value)
                    .replace(/\W+/g, '_')
                    .replace(/^(\d+)/g, '_$1')
                    .replace(/([a-z])([A-Z]+)/g, '$1_$2')
                    .toUpperCase(),
                value: `'${value.replace(/'/g, "\\'")}'`,
                type: 'string',
                description: null,
            };
        });
    }
    return [];
};

/**
 * Strip (OpenAPI) namespaces fom values.
 * @param value
 */
const stripNamespace = (value) => {
    return value
        .trim()
        .replace(/^#\/components\/schemas\//, '')
        .replace(/^#\/components\/responses\//, '')
        .replace(/^#\/components\/parameters\//, '')
        .replace(/^#\/components\/examples\//, '')
        .replace(/^#\/components\/requestBodies\//, '')
        .replace(/^#\/components\/headers\//, '')
        .replace(/^#\/components\/securitySchemes\//, '')
        .replace(/^#\/components\/links\//, '')
        .replace(/^#\/components\/callbacks\//, '');
};

const inverseDictionary = (map) => {
    const m2 = {};
    for (const key in map) {
        m2[map[key]] = key;
    }
    return m2;
};
const findOneOfParentDiscriminator = (openApi, parent) => {
    var _a;
    if (openApi.components && parent) {
        for (const definitionName in openApi.components.schemas) {
            if (openApi.components.schemas.hasOwnProperty(definitionName)) {
                const schema = openApi.components.schemas[definitionName];
                if (schema.discriminator &&
                    ((_a = schema.oneOf) === null || _a === void 0 ? void 0 : _a.length) &&
                    schema.oneOf.some(definition => definition.$ref && stripNamespace(definition.$ref) == parent.name)) {
                    return schema.discriminator;
                }
            }
        }
    }
    return undefined;
};
const mapPropertyValue = (discriminator, parent) => {
    if (discriminator.mapping) {
        const mapping = inverseDictionary(discriminator.mapping);
        const key = Object.keys(mapping).find(item => stripNamespace(item) == parent.name);
        if (key && mapping[key]) {
            return mapping[key];
        }
    }
    return parent.name;
};

const escapeName = (value) => {
    if (value || value === '') {
        const validName = /^[a-zA-Z_$][\w$]+$/g.test(value);
        if (!validName) {
            return `'${value}'`;
        }
    }
    return value;
};

/**
 * Check if a value is defined
 * @param value
 */
const isDefined = (value) => {
    return value !== undefined && value !== null && value !== '';
};

const TYPE_MAPPINGS = new Map([
    ['file', 'binary'],
    ['any', 'any'],
    ['object', 'any'],
    ['array', 'any[]'],
    ['boolean', 'boolean'],
    ['byte', 'number'],
    ['int', 'number'],
    ['integer', 'number'],
    ['float', 'number'],
    ['double', 'number'],
    ['short', 'number'],
    ['long', 'number'],
    ['number', 'number'],
    ['char', 'string'],
    ['date', 'string'],
    ['date-time', 'string'],
    ['password', 'string'],
    ['string', 'string'],
    ['void', 'void'],
    ['null', 'null'],
]);
/**
 * Get mapped type for given type to any basic Typescript/Javascript type.
 */
const getMappedType = (type, format) => {
    if (format === 'binary') {
        return 'binary';
    }
    return TYPE_MAPPINGS.get(type);
};

const encode = (value) => {
    return value.replace(/^[^a-zA-Z_$]+/g, '').replace(/[^\w$]+/g, '_');
};
/**
 * Parse any string value into a type object.
 * @param type String or String[] value like "integer", "Link[Model]" or ["string", "null"].
 * @param format String value like "binary" or "date".
 */
const getType = (type = 'any', format) => {
    const result = {
        type: 'any',
        base: 'any',
        template: null,
        imports: [],
        isNullable: false,
    };
    // Special case for JSON Schema spec (december 2020, page 17),
    // that allows type to be an array of primitive types...
    if (Array.isArray(type)) {
        const joinedType = type
            .filter(value => value !== 'null')
            .map(value => getMappedType(value, format))
            .filter(isDefined)
            .join(' | ');
        result.type = joinedType;
        result.base = joinedType;
        result.isNullable = type.includes('null');
        return result;
    }
    const mapped = getMappedType(type, format);
    if (mapped) {
        result.type = mapped;
        result.base = mapped;
        return result;
    }
    const typeWithoutNamespace = decodeURIComponent(stripNamespace(type));
    if (/\[.*\]$/g.test(typeWithoutNamespace)) {
        const matches = typeWithoutNamespace.match(/(.*?)\[(.*)\]$/);
        if (matches === null || matches === void 0 ? void 0 : matches.length) {
            const match1 = getType(encode(matches[1]));
            const match2 = getType(encode(matches[2]));
            if (match1.type === 'any[]') {
                result.type = `${match2.type}[]`;
                result.base = `${match2.type}`;
                match1.imports = [];
            }
            else if (match2.type) {
                result.type = `${match1.type}<${match2.type}>`;
                result.base = match1.type;
                result.template = match2.type;
            }
            else {
                result.type = match1.type;
                result.base = match1.type;
                result.template = match1.type;
            }
            result.imports.push(...match1.imports);
            result.imports.push(...match2.imports);
            return result;
        }
    }
    if (typeWithoutNamespace) {
        const type = encode(typeWithoutNamespace);
        result.type = type;
        result.base = type;
        result.imports.push(type);
        return result;
    }
    return result;
};

const getModelProperties = (openApi, definition, getModel, parent) => {
    var _a;
    const models = [];
    const discriminator = findOneOfParentDiscriminator(openApi, parent);
    for (const propertyName in definition.properties) {
        if (definition.properties.hasOwnProperty(propertyName)) {
            const property = definition.properties[propertyName];
            const propertyRequired = !!((_a = definition.required) === null || _a === void 0 ? void 0 : _a.includes(propertyName));
            const propertyValues = {
                name: escapeName(propertyName),
                description: property.description || null,
                deprecated: property.deprecated === true,
                isDefinition: false,
                isReadOnly: property.readOnly === true,
                isRequired: propertyRequired,
                format: property.format,
                maximum: property.maximum,
                exclusiveMaximum: property.exclusiveMaximum,
                minimum: property.minimum,
                exclusiveMinimum: property.exclusiveMinimum,
                multipleOf: property.multipleOf,
                maxLength: property.maxLength,
                minLength: property.minLength,
                maxItems: property.maxItems,
                minItems: property.minItems,
                uniqueItems: property.uniqueItems,
                maxProperties: property.maxProperties,
                minProperties: property.minProperties,
                pattern: getPattern(property.pattern),
            };
            if (parent && (discriminator === null || discriminator === void 0 ? void 0 : discriminator.propertyName) == propertyName) {
                models.push({
                    export: 'reference',
                    type: 'string',
                    base: `'${mapPropertyValue(discriminator, parent)}'`,
                    template: null,
                    isNullable: property.nullable === true,
                    link: null,
                    imports: [],
                    enum: [],
                    enums: [],
                    properties: [],
                    ...propertyValues,
                });
            }
            else if (property.$ref) {
                const model = getType(property.$ref);
                models.push({
                    export: 'reference',
                    type: model.type,
                    base: model.base,
                    template: model.template,
                    link: null,
                    isNullable: model.isNullable || property.nullable === true,
                    imports: model.imports,
                    enum: [],
                    enums: [],
                    properties: [],
                    ...propertyValues,
                });
            }
            else {
                const model = getModel(openApi, property);
                models.push({
                    export: model.export,
                    type: model.type,
                    base: model.base,
                    template: model.template,
                    link: model.link,
                    isNullable: model.isNullable || property.nullable === true,
                    imports: model.imports,
                    enum: model.enum,
                    enums: model.enums,
                    properties: model.properties,
                    ...propertyValues,
                });
            }
        }
    }
    return models;
};

const ESCAPED_REF_SLASH = /~1/g;
const ESCAPED_REF_TILDE = /~0/g;
const getRef = (openApi, item) => {
    if (item.$ref) {
        // Fetch the paths to the definitions, this converts:
        // "#/components/schemas/Form" to ["components", "schemas", "Form"]
        const paths = item.$ref
            .replace(/^#/g, '')
            .split('/')
            .filter(item => item);
        // Try to find the reference by walking down the path,
        // if we cannot find it, then we throw an error.
        let result = openApi;
        paths.forEach(path => {
            const decodedPath = decodeURIComponent(path.replace(ESCAPED_REF_SLASH, '/').replace(ESCAPED_REF_TILDE, '~'));
            if (result.hasOwnProperty(decodedPath)) {
                result = result[decodedPath];
            }
            else {
                throw new Error(`Could not find reference: "${item.$ref}"`);
            }
        });
        return result;
    }
    return item;
};

const getRequiredPropertiesFromComposition = (openApi, required, definitions, getModel) => {
    return definitions
        .reduce((properties, definition) => {
        if (definition.$ref) {
            const schema = getRef(openApi, definition);
            return [...properties, ...getModel(openApi, schema).properties];
        }
        return [...properties, ...getModel(openApi, definition).properties];
    }, [])
        .filter(property => {
        return !property.isRequired && required.includes(property.name);
    })
        .map(property => {
        return {
            ...property,
            isRequired: true,
        };
    });
};

const getModelComposition = (openApi, definition, definitions, type, getModel) => {
    const composition = {
        type,
        imports: [],
        enums: [],
        properties: [],
    };
    const properties = [];
    definitions
        .map(definition => getModel(openApi, definition))
        .filter(model => {
        const hasProperties = model.properties.length;
        const hasEnums = model.enums.length;
        const isObject = model.type === 'any';
        const isDictionary = model.export === 'dictionary';
        const isEmpty = isObject && !hasProperties && !hasEnums;
        return !isEmpty || isDictionary;
    })
        .forEach(model => {
        composition.imports.push(...model.imports);
        composition.enums.push(...model.enums);
        composition.properties.push(model);
    });
    if (definition.required) {
        const requiredProperties = getRequiredPropertiesFromComposition(openApi, definition.required, definitions, getModel);
        requiredProperties.forEach(requiredProperty => {
            composition.imports.push(...requiredProperty.imports);
            composition.enums.push(...requiredProperty.enums);
        });
        properties.push(...requiredProperties);
    }
    if (definition.properties) {
        const modelProperties = getModelProperties(openApi, definition, getModel);
        modelProperties.forEach(modelProperty => {
            composition.imports.push(...modelProperty.imports);
            composition.enums.push(...modelProperty.enums);
            if (modelProperty.export === 'enum') {
                composition.enums.push(modelProperty);
            }
        });
        properties.push(...modelProperties);
    }
    if (properties.length) {
        composition.properties.push({
            name: 'properties',
            export: 'interface',
            type: 'any',
            base: 'any',
            template: null,
            link: null,
            description: '',
            isDefinition: false,
            isReadOnly: false,
            isNullable: false,
            isRequired: false,
            imports: [],
            enum: [],
            enums: [],
            properties,
        });
    }
    return composition;
};

const getModelDefault = (definition, model) => {
    var _a;
    if (definition.default === undefined) {
        return undefined;
    }
    if (definition.default === null) {
        return 'null';
    }
    const type = definition.type || typeof definition.default;
    switch (type) {
        case 'int':
        case 'integer':
        case 'number':
            if ((model === null || model === void 0 ? void 0 : model.export) === 'enum' && ((_a = model.enum) === null || _a === void 0 ? void 0 : _a[definition.default])) {
                return model.enum[definition.default].value;
            }
            return definition.default;
        case 'boolean':
            return JSON.stringify(definition.default);
        case 'string':
            return `'${definition.default}'`;
        case 'object':
            try {
                return JSON.stringify(definition.default, null, 4);
            }
            catch (e) {
                // Ignore
            }
    }
    return undefined;
};

const getModel = (openApi, definition, isDefinition = false, name = '') => {
    var _a, _b, _c;
    const model = {
        name,
        export: 'interface',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        description: definition.description || null,
        deprecated: definition.deprecated === true,
        isDefinition,
        isReadOnly: definition.readOnly === true,
        isNullable: definition.nullable === true,
        isRequired: false,
        format: definition.format,
        maximum: definition.maximum,
        exclusiveMaximum: definition.exclusiveMaximum,
        minimum: definition.minimum,
        exclusiveMinimum: definition.exclusiveMinimum,
        multipleOf: definition.multipleOf,
        maxLength: definition.maxLength,
        minLength: definition.minLength,
        maxItems: definition.maxItems,
        minItems: definition.minItems,
        uniqueItems: definition.uniqueItems,
        maxProperties: definition.maxProperties,
        minProperties: definition.minProperties,
        pattern: getPattern(definition.pattern),
        imports: [],
        enum: [],
        enums: [],
        properties: [],
    };
    if (definition.$ref) {
        const definitionRef = getType(definition.$ref);
        model.export = 'reference';
        model.type = definitionRef.type;
        model.base = definitionRef.base;
        model.template = definitionRef.template;
        model.imports.push(...definitionRef.imports);
        model.default = getModelDefault(definition, model);
        return model;
    }
    if (definition.enum && definition.type !== 'boolean') {
        const enumerators = getEnum(definition.enum);
        const extendedEnumerators = extendEnum(enumerators, definition);
        if (extendedEnumerators.length) {
            model.export = 'enum';
            model.type = 'string';
            model.base = 'string';
            model.enum.push(...extendedEnumerators);
            model.default = getModelDefault(definition, model);
            return model;
        }
    }
    if (definition.type === 'array' && definition.items) {
        if (definition.items.$ref) {
            const arrayItems = getType(definition.items.$ref);
            model.export = 'array';
            model.type = arrayItems.type;
            model.base = arrayItems.base;
            model.template = arrayItems.template;
            model.imports.push(...arrayItems.imports);
            model.default = getModelDefault(definition, model);
            return model;
        }
        else {
            const arrayItems = getModel(openApi, definition.items);
            model.export = 'array';
            model.type = arrayItems.type;
            model.base = arrayItems.base;
            model.template = arrayItems.template;
            model.link = arrayItems;
            model.imports.push(...arrayItems.imports);
            model.default = getModelDefault(definition, model);
            return model;
        }
    }
    if (definition.type === 'object' && typeof definition.additionalProperties === 'object') {
        if (definition.additionalProperties.$ref) {
            const additionalProperties = getType(definition.additionalProperties.$ref);
            model.export = 'dictionary';
            model.type = additionalProperties.type;
            model.base = additionalProperties.base;
            model.template = additionalProperties.template;
            model.imports.push(...additionalProperties.imports);
            model.default = getModelDefault(definition, model);
            return model;
        }
        else {
            const additionalProperties = getModel(openApi, definition.additionalProperties);
            model.export = 'dictionary';
            model.type = additionalProperties.type;
            model.base = additionalProperties.base;
            model.template = additionalProperties.template;
            model.link = additionalProperties;
            model.imports.push(...additionalProperties.imports);
            model.default = getModelDefault(definition, model);
            return model;
        }
    }
    if ((_a = definition.oneOf) === null || _a === void 0 ? void 0 : _a.length) {
        const composition = getModelComposition(openApi, definition, definition.oneOf, 'one-of', getModel);
        model.export = composition.type;
        model.imports.push(...composition.imports);
        model.properties.push(...composition.properties);
        model.enums.push(...composition.enums);
        return model;
    }
    if ((_b = definition.anyOf) === null || _b === void 0 ? void 0 : _b.length) {
        const composition = getModelComposition(openApi, definition, definition.anyOf, 'any-of', getModel);
        model.export = composition.type;
        model.imports.push(...composition.imports);
        model.properties.push(...composition.properties);
        model.enums.push(...composition.enums);
        return model;
    }
    if ((_c = definition.allOf) === null || _c === void 0 ? void 0 : _c.length) {
        const composition = getModelComposition(openApi, definition, definition.allOf, 'all-of', getModel);
        model.export = composition.type;
        model.imports.push(...composition.imports);
        model.properties.push(...composition.properties);
        model.enums.push(...composition.enums);
        return model;
    }
    if (definition.type === 'object') {
        model.export = 'interface';
        model.type = 'any';
        model.base = 'any';
        model.default = getModelDefault(definition, model);
        if (definition.properties) {
            const modelProperties = getModelProperties(openApi, definition, getModel, model);
            modelProperties.forEach(modelProperty => {
                model.imports.push(...modelProperty.imports);
                model.enums.push(...modelProperty.enums);
                model.properties.push(modelProperty);
                if (modelProperty.export === 'enum') {
                    model.enums.push(modelProperty);
                }
            });
        }
        return model;
    }
    // If the schema has a type than it can be a basic or generic type.
    if (definition.type) {
        const definitionType = getType(definition.type, definition.format);
        model.export = 'generic';
        model.type = definitionType.type;
        model.base = definitionType.base;
        model.template = definitionType.template;
        model.isNullable = definitionType.isNullable || model.isNullable;
        model.imports.push(...definitionType.imports);
        model.default = getModelDefault(definition, model);
        return model;
    }
    return model;
};

const getModels = (openApi) => {
    const models = [];
    if (openApi.components) {
        for (const definitionName in openApi.components.schemas) {
            if (openApi.components.schemas.hasOwnProperty(definitionName)) {
                const definition = openApi.components.schemas[definitionName];
                const definitionType = getType(definitionName);
                const model = getModel(openApi, definition, true, definitionType.base);
                models.push(model);
            }
        }
    }
    return models;
};

const getServer = (openApi) => {
    var _a;
    const server = (_a = openApi.servers) === null || _a === void 0 ? void 0 : _a[0];
    const variables = (server === null || server === void 0 ? void 0 : server.variables) || {};
    let url = (server === null || server === void 0 ? void 0 : server.url) || '';
    for (const variable in variables) {
        if (variables.hasOwnProperty(variable)) {
            url = url.replace(`{${variable}}`, variables[variable].default);
        }
    }
    return url.replace(/\/$/g, '');
};

const getOperationErrors = (operationResponses) => {
    return operationResponses
        .filter(operationResponse => {
        return operationResponse.code >= 300 && operationResponse.description;
    })
        .map(response => ({
        code: response.code,
        description: response.description,
    }));
};

/**
 * Convert the input value to a correct operation (method) classname.
 * This will use the operation ID - if available - and otherwise fallback
 * on a generated name from the URL
 */
const getOperationName = (url, method, operationId) => {
    if (operationId) {
        return camelCase__default["default"](operationId
            .replace(/^[^a-zA-Z]+/g, '')
            .replace(/[^\w\-]+/g, '-')
            .trim());
    }
    const urlWithoutPlaceholders = url
        .replace(/[^/]*?{api-version}.*?\//g, '')
        .replace(/{(.*?)}/g, '')
        .replace(/\//g, '-');
    return camelCase__default["default"](`${method}-${urlWithoutPlaceholders}`);
};

const reservedWords = /^(arguments|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/g;
/**
 * Replaces any invalid characters from a parameter name.
 * For example: 'filter.someProperty' becomes 'filterSomeProperty'.
 */
const getOperationParameterName = (value) => {
    const clean = value
        .replace(/^[^a-zA-Z]+/g, '')
        .replace(/[^\w\-]+/g, '-')
        .trim();
    return camelCase__default["default"](clean).replace(reservedWords, '_$1');
};

const getOperationParameter = (openApi, parameter) => {
    var _a;
    const operationParameter = {
        in: parameter.in,
        prop: parameter.name,
        export: 'interface',
        name: getOperationParameterName(parameter.name),
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        description: parameter.description || null,
        deprecated: parameter.deprecated === true,
        isDefinition: false,
        isReadOnly: false,
        isRequired: parameter.required === true,
        isNullable: parameter.nullable === true,
        imports: [],
        enum: [],
        enums: [],
        properties: [],
        mediaType: null,
    };
    if (parameter.$ref) {
        const definitionRef = getType(parameter.$ref);
        operationParameter.export = 'reference';
        operationParameter.type = definitionRef.type;
        operationParameter.base = definitionRef.base;
        operationParameter.template = definitionRef.template;
        operationParameter.imports.push(...definitionRef.imports);
        return operationParameter;
    }
    let schema = parameter.schema;
    if (schema) {
        if ((_a = schema.$ref) === null || _a === void 0 ? void 0 : _a.startsWith('#/components/parameters/')) {
            schema = getRef(openApi, schema);
        }
        if (schema.$ref) {
            const model = getType(schema.$ref);
            operationParameter.export = 'reference';
            operationParameter.type = model.type;
            operationParameter.base = model.base;
            operationParameter.template = model.template;
            operationParameter.imports.push(...model.imports);
            operationParameter.default = getModelDefault(schema);
            return operationParameter;
        }
        else {
            const model = getModel(openApi, schema);
            operationParameter.export = model.export;
            operationParameter.type = model.type;
            operationParameter.base = model.base;
            operationParameter.template = model.template;
            operationParameter.link = model.link;
            operationParameter.isReadOnly = model.isReadOnly;
            operationParameter.isRequired = operationParameter.isRequired || model.isRequired;
            operationParameter.isNullable = operationParameter.isNullable || model.isNullable;
            operationParameter.format = model.format;
            operationParameter.maximum = model.maximum;
            operationParameter.exclusiveMaximum = model.exclusiveMaximum;
            operationParameter.minimum = model.minimum;
            operationParameter.exclusiveMinimum = model.exclusiveMinimum;
            operationParameter.multipleOf = model.multipleOf;
            operationParameter.maxLength = model.maxLength;
            operationParameter.minLength = model.minLength;
            operationParameter.maxItems = model.maxItems;
            operationParameter.minItems = model.minItems;
            operationParameter.uniqueItems = model.uniqueItems;
            operationParameter.maxProperties = model.maxProperties;
            operationParameter.minProperties = model.minProperties;
            operationParameter.pattern = getPattern(model.pattern);
            operationParameter.default = model.default;
            operationParameter.imports.push(...model.imports);
            operationParameter.enum.push(...model.enum);
            operationParameter.enums.push(...model.enums);
            operationParameter.properties.push(...model.properties);
            return operationParameter;
        }
    }
    return operationParameter;
};

const getOperationParameters = (openApi, parameters) => {
    const operationParameters = {
        imports: [],
        parameters: [],
        parametersPath: [],
        parametersQuery: [],
        parametersForm: [],
        parametersCookie: [],
        parametersHeader: [],
        parametersBody: null, // Not used in V3 -> @see requestBody
    };
    // Iterate over the parameters
    parameters.forEach(parameterOrReference => {
        const parameterDef = getRef(openApi, parameterOrReference);
        const parameter = getOperationParameter(openApi, parameterDef);
        // We ignore the "api-version" param, since we do not want to add this
        // as the first / default parameter for each of the service calls.
        if (parameter.prop !== 'api-version') {
            switch (parameterDef.in) {
                case 'path':
                    operationParameters.parametersPath.push(parameter);
                    operationParameters.parameters.push(parameter);
                    operationParameters.imports.push(...parameter.imports);
                    break;
                case 'query':
                    operationParameters.parametersQuery.push(parameter);
                    operationParameters.parameters.push(parameter);
                    operationParameters.imports.push(...parameter.imports);
                    break;
                case 'formData':
                    operationParameters.parametersForm.push(parameter);
                    operationParameters.parameters.push(parameter);
                    operationParameters.imports.push(...parameter.imports);
                    break;
                case 'cookie':
                    operationParameters.parametersCookie.push(parameter);
                    operationParameters.parameters.push(parameter);
                    operationParameters.imports.push(...parameter.imports);
                    break;
                case 'header':
                    operationParameters.parametersHeader.push(parameter);
                    operationParameters.parameters.push(parameter);
                    operationParameters.imports.push(...parameter.imports);
                    break;
            }
        }
    });
    return operationParameters;
};

const BASIC_MEDIA_TYPES = [
    'application/json-patch+json',
    'application/json',
    'application/x-www-form-urlencoded',
    'text/json',
    'text/plain',
    'multipart/form-data',
    'multipart/mixed',
    'multipart/related',
    'multipart/batch',
];
const getContent = (openApi, content) => {
    const basicMediaTypeWithSchema = Object.keys(content)
        .filter(mediaType => {
        const cleanMediaType = mediaType.split(';')[0].trim();
        return BASIC_MEDIA_TYPES.includes(cleanMediaType);
    })
        .find(mediaType => { var _a; return isDefined((_a = content[mediaType]) === null || _a === void 0 ? void 0 : _a.schema); });
    if (basicMediaTypeWithSchema) {
        return {
            mediaType: basicMediaTypeWithSchema,
            schema: content[basicMediaTypeWithSchema].schema,
        };
    }
    const firstMediaTypeWithSchema = Object.keys(content).find(mediaType => { var _a; return isDefined((_a = content[mediaType]) === null || _a === void 0 ? void 0 : _a.schema); });
    if (firstMediaTypeWithSchema) {
        return {
            mediaType: firstMediaTypeWithSchema,
            schema: content[firstMediaTypeWithSchema].schema,
        };
    }
    return null;
};

const getOperationRequestBody = (openApi, body) => {
    const requestBody = {
        in: 'body',
        export: 'interface',
        prop: 'requestBody',
        name: 'requestBody',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        description: body.description || null,
        default: undefined,
        isDefinition: false,
        isReadOnly: false,
        isRequired: body.required === true,
        isNullable: body.nullable === true,
        imports: [],
        enum: [],
        enums: [],
        properties: [],
        mediaType: null,
    };
    if (body.content) {
        const content = getContent(openApi, body.content);
        if (content) {
            requestBody.mediaType = content.mediaType;
            switch (requestBody.mediaType) {
                case 'application/x-www-form-urlencoded':
                case 'multipart/form-data':
                    requestBody.in = 'formData';
                    requestBody.name = 'formData';
                    requestBody.prop = 'formData';
                    break;
            }
            if (content.schema.$ref) {
                const model = getType(content.schema.$ref);
                requestBody.export = 'reference';
                requestBody.type = model.type;
                requestBody.base = model.base;
                requestBody.template = model.template;
                requestBody.imports.push(...model.imports);
                return requestBody;
            }
            else {
                const model = getModel(openApi, content.schema);
                requestBody.export = model.export;
                requestBody.type = model.type;
                requestBody.base = model.base;
                requestBody.template = model.template;
                requestBody.link = model.link;
                requestBody.isReadOnly = model.isReadOnly;
                requestBody.isRequired = requestBody.isRequired || model.isRequired;
                requestBody.isNullable = requestBody.isNullable || model.isNullable;
                requestBody.format = model.format;
                requestBody.maximum = model.maximum;
                requestBody.exclusiveMaximum = model.exclusiveMaximum;
                requestBody.minimum = model.minimum;
                requestBody.exclusiveMinimum = model.exclusiveMinimum;
                requestBody.multipleOf = model.multipleOf;
                requestBody.maxLength = model.maxLength;
                requestBody.minLength = model.minLength;
                requestBody.maxItems = model.maxItems;
                requestBody.minItems = model.minItems;
                requestBody.uniqueItems = model.uniqueItems;
                requestBody.maxProperties = model.maxProperties;
                requestBody.minProperties = model.minProperties;
                requestBody.pattern = getPattern(model.pattern);
                requestBody.imports.push(...model.imports);
                requestBody.enum.push(...model.enum);
                requestBody.enums.push(...model.enums);
                requestBody.properties.push(...model.properties);
                return requestBody;
            }
        }
    }
    return requestBody;
};

const getOperationResponseHeader = (operationResponses) => {
    const header = operationResponses.find(operationResponses => {
        return operationResponses.in === 'header';
    });
    if (header) {
        return header.name;
    }
    return null;
};

const getOperationResponse = (openApi, response, responseCode) => {
    var _a;
    const operationResponse = {
        in: 'response',
        name: '',
        code: responseCode,
        description: response.description || null,
        export: 'generic',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        isDefinition: false,
        isReadOnly: false,
        isRequired: false,
        isNullable: false,
        imports: [],
        enum: [],
        enums: [],
        properties: [],
    };
    if (response.content) {
        const content = getContent(openApi, response.content);
        if (content) {
            if ((_a = content.schema.$ref) === null || _a === void 0 ? void 0 : _a.startsWith('#/components/responses/')) {
                content.schema = getRef(openApi, content.schema);
            }
            if (content.schema.$ref) {
                const model = getType(content.schema.$ref);
                operationResponse.export = 'reference';
                operationResponse.type = model.type;
                operationResponse.base = model.base;
                operationResponse.template = model.template;
                operationResponse.imports.push(...model.imports);
                return operationResponse;
            }
            else {
                const model = getModel(openApi, content.schema);
                operationResponse.export = model.export;
                operationResponse.type = model.type;
                operationResponse.base = model.base;
                operationResponse.template = model.template;
                operationResponse.link = model.link;
                operationResponse.isReadOnly = model.isReadOnly;
                operationResponse.isRequired = model.isRequired;
                operationResponse.isNullable = model.isNullable;
                operationResponse.format = model.format;
                operationResponse.maximum = model.maximum;
                operationResponse.exclusiveMaximum = model.exclusiveMaximum;
                operationResponse.minimum = model.minimum;
                operationResponse.exclusiveMinimum = model.exclusiveMinimum;
                operationResponse.multipleOf = model.multipleOf;
                operationResponse.maxLength = model.maxLength;
                operationResponse.minLength = model.minLength;
                operationResponse.maxItems = model.maxItems;
                operationResponse.minItems = model.minItems;
                operationResponse.uniqueItems = model.uniqueItems;
                operationResponse.maxProperties = model.maxProperties;
                operationResponse.minProperties = model.minProperties;
                operationResponse.pattern = getPattern(model.pattern);
                operationResponse.imports.push(...model.imports);
                operationResponse.enum.push(...model.enum);
                operationResponse.enums.push(...model.enums);
                operationResponse.properties.push(...model.properties);
                return operationResponse;
            }
        }
    }
    // We support basic properties from response headers, since both
    // fetch and XHR client just support string types.
    if (response.headers) {
        for (const name in response.headers) {
            if (response.headers.hasOwnProperty(name)) {
                operationResponse.in = 'header';
                operationResponse.name = name;
                operationResponse.type = 'string';
                operationResponse.base = 'string';
                return operationResponse;
            }
        }
    }
    return operationResponse;
};

const getOperationResponseCode = (value) => {
    // You can specify a "default" response, this is treated as HTTP code 200
    if (value === 'default') {
        return 200;
    }
    // Check if we can parse the code and return of successful.
    if (/[0-9]+/g.test(value)) {
        const code = parseInt(value);
        if (Number.isInteger(code)) {
            return Math.abs(code);
        }
    }
    return null;
};

const getOperationResponses = (openApi, responses) => {
    const operationResponses = [];
    // Iterate over each response code and get the
    // status code and response message (if any).
    for (const code in responses) {
        if (responses.hasOwnProperty(code)) {
            const responseOrReference = responses[code];
            const response = getRef(openApi, responseOrReference);
            const responseCode = getOperationResponseCode(code);
            if (responseCode) {
                const operationResponse = getOperationResponse(openApi, response, responseCode);
                operationResponses.push(operationResponse);
            }
        }
    }
    // Sort the responses to 2XX success codes come before 4XX and 5XX error codes.
    return operationResponses.sort((a, b) => {
        return a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
    });
};

const areEqual = (a, b) => {
    const equal = a.type === b.type && a.base === b.base && a.template === b.template;
    if (equal && a.link && b.link) {
        return areEqual(a.link, b.link);
    }
    return equal;
};
const getOperationResults = (operationResponses) => {
    const operationResults = [];
    // Filter out success response codes, but skip "204 No Content"
    operationResponses.forEach(operationResponse => {
        const { code } = operationResponse;
        if (code && code !== 204 && code >= 200 && code < 300) {
            operationResults.push(operationResponse);
        }
    });
    if (!operationResults.length) {
        operationResults.push({
            in: 'response',
            name: '',
            code: 200,
            description: '',
            export: 'generic',
            type: 'void',
            base: 'void',
            template: null,
            link: null,
            isDefinition: false,
            isReadOnly: false,
            isRequired: false,
            isNullable: false,
            imports: [],
            enum: [],
            enums: [],
            properties: [],
        });
    }
    return operationResults.filter((operationResult, index, arr) => {
        return (arr.findIndex(item => {
            return areEqual(item, operationResult);
        }) === index);
    });
};

/**
 * Convert the input value to a correct service name. This converts
 * the input string to PascalCase.
 */
const getServiceName = (value) => {
    const clean = value
        .replace(/^[^a-zA-Z]+/g, '')
        .replace(/[^\w\-]+/g, '-')
        .trim();
    return camelCase__default["default"](clean, { pascalCase: true });
};

const sortByRequired = (a, b) => {
    const aNeedsValue = a.isRequired && a.default === undefined;
    const bNeedsValue = b.isRequired && b.default === undefined;
    if (aNeedsValue && !bNeedsValue)
        return -1;
    if (bNeedsValue && !aNeedsValue)
        return 1;
    return 0;
};

const getOperation = (openApi, url, method, tag, op, pathParams) => {
    const serviceName = getServiceName(tag);
    const operationName = getOperationName(url, method, op.operationId);
    // Create a new operation object for this method.
    const operation = {
        service: serviceName,
        name: operationName,
        summary: op.summary || null,
        description: op.description || null,
        deprecated: op.deprecated === true,
        method: method.toUpperCase(),
        path: url,
        parameters: [...pathParams.parameters],
        parametersPath: [...pathParams.parametersPath],
        parametersQuery: [...pathParams.parametersQuery],
        parametersForm: [...pathParams.parametersForm],
        parametersHeader: [...pathParams.parametersHeader],
        parametersCookie: [...pathParams.parametersCookie],
        parametersBody: pathParams.parametersBody,
        imports: [],
        errors: [],
        results: [],
        responseHeader: null,
    };
    // Parse the operation parameters (path, query, body, etc).
    if (op.parameters) {
        const parameters = getOperationParameters(openApi, op.parameters);
        operation.imports.push(...parameters.imports);
        operation.parameters.push(...parameters.parameters);
        operation.parametersPath.push(...parameters.parametersPath);
        operation.parametersQuery.push(...parameters.parametersQuery);
        operation.parametersForm.push(...parameters.parametersForm);
        operation.parametersHeader.push(...parameters.parametersHeader);
        operation.parametersCookie.push(...parameters.parametersCookie);
        operation.parametersBody = parameters.parametersBody;
    }
    if (op.requestBody) {
        const requestBodyDef = getRef(openApi, op.requestBody);
        const requestBody = getOperationRequestBody(openApi, requestBodyDef);
        operation.imports.push(...requestBody.imports);
        operation.parameters.push(requestBody);
        operation.parametersBody = requestBody;
    }
    // Parse the operation responses.
    if (op.responses) {
        const operationResponses = getOperationResponses(openApi, op.responses);
        const operationResults = getOperationResults(operationResponses);
        operation.errors = getOperationErrors(operationResponses);
        operation.responseHeader = getOperationResponseHeader(operationResults);
        operationResults.forEach(operationResult => {
            operation.results.push(operationResult);
            operation.imports.push(...operationResult.imports);
        });
    }
    operation.parameters = operation.parameters.sort(sortByRequired);
    return operation;
};

/**
 * Get the OpenAPI services
 */
const getServices = (openApi) => {
    var _a;
    const services = new Map();
    for (const url in openApi.paths) {
        if (openApi.paths.hasOwnProperty(url)) {
            // Grab path and parse any global path parameters
            const path = openApi.paths[url];
            const pathParams = getOperationParameters(openApi, path.parameters || []);
            // Parse all the methods for this path
            for (const method in path) {
                if (path.hasOwnProperty(method)) {
                    switch (method) {
                        case 'get':
                        case 'put':
                        case 'post':
                        case 'delete':
                        case 'options':
                        case 'head':
                        case 'patch':
                            // Each method contains an OpenAPI operation, we parse the operation
                            const op = path[method];
                            const tags = ((_a = op.tags) === null || _a === void 0 ? void 0 : _a.length) ? op.tags.filter(unique) : ['Default'];
                            tags.forEach(tag => {
                                const operation = getOperation(openApi, url, method, tag, op, pathParams);
                                // If we have already declared a service, then we should fetch that and
                                // append the new method to it. Otherwise we should create a new service object.
                                const service = services.get(operation.service) || {
                                    name: operation.service,
                                    operations: [],
                                    imports: [],
                                };
                                // Push the operation in the service
                                service.operations.push(operation);
                                service.imports.push(...operation.imports);
                                services.set(operation.service, service);
                            });
                            break;
                    }
                }
            }
        }
    }
    return Array.from(services.values());
};

/**
 * Convert the service version to 'normal' version.
 * This basically removes any "v" prefix from the version string.
 * @param version
 */
const getServiceVersion = (version = '1.0') => {
    return String(version).replace(/^v/gi, '');
};

/**
 * Parse the OpenAPI specification to a Client model that contains
 * all the models, services and schema's we should output.
 * @param openApi The OpenAPI spec  that we have loaded from disk.
 */
const parse = (openApi) => {
    const version = getServiceVersion(openApi.info.version);
    const server = getServer(openApi);
    const models = getModels(openApi);
    const services = getServices(openApi);
    return { version, server, models, services };
};

/**
 * Load and parse te open api spec. If the file extension is ".yml" or ".yaml"
 * we will try to parse the file as a YAML spec, otherwise we will fall back
 * on parsing the file as JSON.
 * @param location: Path or url
 */
const getOpenApiSpec = async (location) => {
    return await RefParser__default["default"].bundle(location, location, {});
};

var OpenApiVersion;
(function (OpenApiVersion) {
    OpenApiVersion[OpenApiVersion["V2"] = 2] = "V2";
    OpenApiVersion[OpenApiVersion["V3"] = 3] = "V3";
})(OpenApiVersion || (OpenApiVersion = {}));
/**
 * Get the Open API specification version (V2 or V3). This generator only supports
 * version 2 and 3 of the specification, so we will alert the user if we encounter
 * an incompatible type. Or if the type is missing...
 * @param openApi The loaded spec (can be any object)
 */
const getOpenApiVersion = (openApi) => {
    const info = openApi.swagger || openApi.openapi;
    if (typeof info === 'string') {
        const c = info.charAt(0);
        const v = Number.parseInt(c);
        if (v === OpenApiVersion.V2 || v === OpenApiVersion.V3) {
            return v;
        }
    }
    throw new Error(`Unsupported Open API version: "${String(info)}"`);
};

/**
 * Set unique enum values for the model
 * @param model
 */
const postProcessModelEnum = (model) => {
    return model.enum.filter((property, index, arr) => {
        return arr.findIndex(item => item.name === property.name) === index;
    });
};

/**
 * Set unique enum values for the model
 * @param model The model that is post-processed
 */
const postProcessModelEnums = (model) => {
    return model.enums.filter((property, index, arr) => {
        return arr.findIndex(item => item.name === property.name) === index;
    });
};

const sort = (a, b) => {
    const nameA = a.toLowerCase();
    const nameB = b.toLowerCase();
    return nameA.localeCompare(nameB, 'en');
};

/**
 * Set unique imports, sorted by name
 * @param model The model that is post-processed
 */
const postProcessModelImports = (model) => {
    return model.imports
        .filter(unique)
        .sort(sort)
        .filter(name => model.name !== name);
};

/**
 * Post processes the model.
 * This will clean up any double imports or enum values.
 * @param model
 */
const postProcessModel = (model) => {
    return {
        ...model,
        imports: postProcessModelImports(model),
        enums: postProcessModelEnums(model),
        enum: postProcessModelEnum(model),
    };
};

/**
 * Set unique imports, sorted by name
 * @param service
 */
const postProcessServiceImports = (service) => {
    return service.imports.filter(unique).sort(sort);
};

/**
 * Calls a defined callback on each element of an array.
 * Then, flattens the result into a new array.
 */
const flatMap = (array, callback) => {
    const result = [];
    array.map(callback).forEach(arr => {
        result.push(...arr);
    });
    return result;
};

const postProcessServiceOperations = (service) => {
    const names = new Map();
    return service.operations.map(operation => {
        const clone = { ...operation };
        // Parse the service parameters and results, very similar to how we parse
        // properties of models. These methods will extend the type if needed.
        clone.imports.push(...flatMap(clone.parameters, parameter => parameter.imports));
        clone.imports.push(...flatMap(clone.results, result => result.imports));
        // Check if the operation name is unique, if not then prefix this with a number
        const name = clone.name;
        const index = names.get(name) || 0;
        if (index > 0) {
            clone.name = `${name}${index}`;
        }
        names.set(name, index + 1);
        return clone;
    });
};

const postProcessService = (service) => {
    const clone = { ...service };
    clone.operations = postProcessServiceOperations(clone);
    clone.operations.forEach(operation => {
        clone.imports.push(...operation.imports);
    });
    clone.imports = postProcessServiceImports(clone);
    return clone;
};

/**
 * Post process client
 * @param client Client object with all the models, services, etc.
 */
const postProcessClient = (client) => {
    return {
        ...client,
        models: client.models.map(model => postProcessModel(model)),
        services: client.services.map(service => postProcessService(service)),
    };
};

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var handlebars_runtime = {exports: {}};

var base = {};

var utils = {};

utils.__esModule = true;
utils.extend = extend;
utils.indexOf = indexOf;
utils.escapeExpression = escapeExpression;
utils.isEmpty = isEmpty;
utils.createFrame = createFrame;
utils.blockParams = blockParams;
utils.appendContextPath = appendContextPath;
var escape = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

var badChars = /[&<>"'`=]/g,
    possible = /[&<>"'`=]/;

function escapeChar(chr) {
  return escape[chr];
}

function extend(obj /* , ...source */) {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        obj[key] = arguments[i][key];
      }
    }
  }

  return obj;
}

var toString = Object.prototype.toString;

utils.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
/* eslint-disable func-style */
var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
/* istanbul ignore next */
if (isFunction(/x/)) {
  utils.isFunction = isFunction = function (value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
utils.isFunction = isFunction;

/* eslint-enable func-style */

/* istanbul ignore next */
var isArray = Array.isArray || function (value) {
  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
};

utils.isArray = isArray;
// Older IE versions do not directly support indexOf so we must implement our own, sadly.

function indexOf(array, value) {
  for (var i = 0, len = array.length; i < len; i++) {
    if (array[i] === value) {
      return i;
    }
  }
  return -1;
}

function escapeExpression(string) {
  if (typeof string !== 'string') {
    // don't escape SafeStrings, since they're already safe
    if (string && string.toHTML) {
      return string.toHTML();
    } else if (string == null) {
      return '';
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = '' + string;
  }

  if (!possible.test(string)) {
    return string;
  }
  return string.replace(badChars, escapeChar);
}

function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

function createFrame(object) {
  var frame = extend({}, object);
  frame._parent = object;
  return frame;
}

function blockParams(params, ids) {
  params.path = ids;
  return params;
}

function appendContextPath(contextPath, id) {
  return (contextPath ? contextPath + '.' : '') + id;
}

var exception = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	var errorProps = ['description', 'fileName', 'lineNumber', 'endLineNumber', 'message', 'name', 'number', 'stack'];

	function Exception(message, node) {
	  var loc = node && node.loc,
	      line = undefined,
	      endLineNumber = undefined,
	      column = undefined,
	      endColumn = undefined;

	  if (loc) {
	    line = loc.start.line;
	    endLineNumber = loc.end.line;
	    column = loc.start.column;
	    endColumn = loc.end.column;

	    message += ' - ' + line + ':' + column;
	  }

	  var tmp = Error.prototype.constructor.call(this, message);

	  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
	  for (var idx = 0; idx < errorProps.length; idx++) {
	    this[errorProps[idx]] = tmp[errorProps[idx]];
	  }

	  /* istanbul ignore else */
	  if (Error.captureStackTrace) {
	    Error.captureStackTrace(this, Exception);
	  }

	  try {
	    if (loc) {
	      this.lineNumber = line;
	      this.endLineNumber = endLineNumber;

	      // Work around issue under safari where we can't directly set the column value
	      /* istanbul ignore next */
	      if (Object.defineProperty) {
	        Object.defineProperty(this, 'column', {
	          value: column,
	          enumerable: true
	        });
	        Object.defineProperty(this, 'endColumn', {
	          value: endColumn,
	          enumerable: true
	        });
	      } else {
	        this.column = column;
	        this.endColumn = endColumn;
	      }
	    }
	  } catch (nop) {
	    /* Ignore if the browser is very particular */
	  }
	}

	Exception.prototype = new Error();

	exports['default'] = Exception;
	module.exports = exports['default'];
	
} (exception, exception.exports));

var helpers = {};

var blockHelperMissing = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;

	var _utils = utils;

	exports['default'] = function (instance) {
	  instance.registerHelper('blockHelperMissing', function (context, options) {
	    var inverse = options.inverse,
	        fn = options.fn;

	    if (context === true) {
	      return fn(this);
	    } else if (context === false || context == null) {
	      return inverse(this);
	    } else if (_utils.isArray(context)) {
	      if (context.length > 0) {
	        if (options.ids) {
	          options.ids = [options.name];
	        }

	        return instance.helpers.each(context, options);
	      } else {
	        return inverse(this);
	      }
	    } else {
	      if (options.data && options.ids) {
	        var data = _utils.createFrame(options.data);
	        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.name);
	        options = { data: data };
	      }

	      return fn(context, options);
	    }
	  });
	};

	module.exports = exports['default'];
	
} (blockHelperMissing, blockHelperMissing.exports));

var each = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _utils = utils;

	var _exception = exception.exports;

	var _exception2 = _interopRequireDefault(_exception);

	exports['default'] = function (instance) {
	  instance.registerHelper('each', function (context, options) {
	    if (!options) {
	      throw new _exception2['default']('Must pass iterator to #each');
	    }

	    var fn = options.fn,
	        inverse = options.inverse,
	        i = 0,
	        ret = '',
	        data = undefined,
	        contextPath = undefined;

	    if (options.data && options.ids) {
	      contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
	    }

	    if (_utils.isFunction(context)) {
	      context = context.call(this);
	    }

	    if (options.data) {
	      data = _utils.createFrame(options.data);
	    }

	    function execIteration(field, index, last) {
	      if (data) {
	        data.key = field;
	        data.index = index;
	        data.first = index === 0;
	        data.last = !!last;

	        if (contextPath) {
	          data.contextPath = contextPath + field;
	        }
	      }

	      ret = ret + fn(context[field], {
	        data: data,
	        blockParams: _utils.blockParams([context[field], field], [contextPath + field, null])
	      });
	    }

	    if (context && typeof context === 'object') {
	      if (_utils.isArray(context)) {
	        for (var j = context.length; i < j; i++) {
	          if (i in context) {
	            execIteration(i, i, i === context.length - 1);
	          }
	        }
	      } else if (commonjsGlobal.Symbol && context[commonjsGlobal.Symbol.iterator]) {
	        var newContext = [];
	        var iterator = context[commonjsGlobal.Symbol.iterator]();
	        for (var it = iterator.next(); !it.done; it = iterator.next()) {
	          newContext.push(it.value);
	        }
	        context = newContext;
	        for (var j = context.length; i < j; i++) {
	          execIteration(i, i, i === context.length - 1);
	        }
	      } else {
	        (function () {
	          var priorKey = undefined;

	          Object.keys(context).forEach(function (key) {
	            // We're running the iterations one step out of sync so we can detect
	            // the last iteration without have to scan the object twice and create
	            // an itermediate keys array.
	            if (priorKey !== undefined) {
	              execIteration(priorKey, i - 1);
	            }
	            priorKey = key;
	            i++;
	          });
	          if (priorKey !== undefined) {
	            execIteration(priorKey, i - 1, true);
	          }
	        })();
	      }
	    }

	    if (i === 0) {
	      ret = inverse(this);
	    }

	    return ret;
	  });
	};

	module.exports = exports['default'];
	
} (each, each.exports));

var helperMissing = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _exception = exception.exports;

	var _exception2 = _interopRequireDefault(_exception);

	exports['default'] = function (instance) {
	  instance.registerHelper('helperMissing', function () /* [args, ]options */{
	    if (arguments.length === 1) {
	      // A missing field in a {{foo}} construct.
	      return undefined;
	    } else {
	      // Someone is actually trying to call something, blow up.
	      throw new _exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
	    }
	  });
	};

	module.exports = exports['default'];
	
} (helperMissing, helperMissing.exports));

var _if = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _utils = utils;

	var _exception = exception.exports;

	var _exception2 = _interopRequireDefault(_exception);

	exports['default'] = function (instance) {
	  instance.registerHelper('if', function (conditional, options) {
	    if (arguments.length != 2) {
	      throw new _exception2['default']('#if requires exactly one argument');
	    }
	    if (_utils.isFunction(conditional)) {
	      conditional = conditional.call(this);
	    }

	    // Default behavior is to render the positive path if the value is truthy and not empty.
	    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
	    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
	    if (!options.hash.includeZero && !conditional || _utils.isEmpty(conditional)) {
	      return options.inverse(this);
	    } else {
	      return options.fn(this);
	    }
	  });

	  instance.registerHelper('unless', function (conditional, options) {
	    if (arguments.length != 2) {
	      throw new _exception2['default']('#unless requires exactly one argument');
	    }
	    return instance.helpers['if'].call(this, conditional, {
	      fn: options.inverse,
	      inverse: options.fn,
	      hash: options.hash
	    });
	  });
	};

	module.exports = exports['default'];
	
} (_if, _if.exports));

var log$1 = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;

	exports['default'] = function (instance) {
	  instance.registerHelper('log', function () /* message, options */{
	    var args = [undefined],
	        options = arguments[arguments.length - 1];
	    for (var i = 0; i < arguments.length - 1; i++) {
	      args.push(arguments[i]);
	    }

	    var level = 1;
	    if (options.hash.level != null) {
	      level = options.hash.level;
	    } else if (options.data && options.data.level != null) {
	      level = options.data.level;
	    }
	    args[0] = level;

	    instance.log.apply(instance, args);
	  });
	};

	module.exports = exports['default'];
	
} (log$1, log$1.exports));

var lookup = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;

	exports['default'] = function (instance) {
	  instance.registerHelper('lookup', function (obj, field, options) {
	    if (!obj) {
	      // Note for 5.0: Change to "obj == null" in 5.0
	      return obj;
	    }
	    return options.lookupProperty(obj, field);
	  });
	};

	module.exports = exports['default'];
	
} (lookup, lookup.exports));

var _with = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _utils = utils;

	var _exception = exception.exports;

	var _exception2 = _interopRequireDefault(_exception);

	exports['default'] = function (instance) {
	  instance.registerHelper('with', function (context, options) {
	    if (arguments.length != 2) {
	      throw new _exception2['default']('#with requires exactly one argument');
	    }
	    if (_utils.isFunction(context)) {
	      context = context.call(this);
	    }

	    var fn = options.fn;

	    if (!_utils.isEmpty(context)) {
	      var data = options.data;
	      if (options.data && options.ids) {
	        data = _utils.createFrame(options.data);
	        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]);
	      }

	      return fn(context, {
	        data: data,
	        blockParams: _utils.blockParams([context], [data && data.contextPath])
	      });
	    } else {
	      return options.inverse(this);
	    }
	  });
	};

	module.exports = exports['default'];
	
} (_with, _with.exports));

helpers.__esModule = true;
helpers.registerDefaultHelpers = registerDefaultHelpers;
helpers.moveHelperToHooks = moveHelperToHooks;
// istanbul ignore next

function _interopRequireDefault$3(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersBlockHelperMissing = blockHelperMissing.exports;

var _helpersBlockHelperMissing2 = _interopRequireDefault$3(_helpersBlockHelperMissing);

var _helpersEach = each.exports;

var _helpersEach2 = _interopRequireDefault$3(_helpersEach);

var _helpersHelperMissing = helperMissing.exports;

var _helpersHelperMissing2 = _interopRequireDefault$3(_helpersHelperMissing);

var _helpersIf = _if.exports;

var _helpersIf2 = _interopRequireDefault$3(_helpersIf);

var _helpersLog = log$1.exports;

var _helpersLog2 = _interopRequireDefault$3(_helpersLog);

var _helpersLookup = lookup.exports;

var _helpersLookup2 = _interopRequireDefault$3(_helpersLookup);

var _helpersWith = _with.exports;

var _helpersWith2 = _interopRequireDefault$3(_helpersWith);

function registerDefaultHelpers(instance) {
  _helpersBlockHelperMissing2['default'](instance);
  _helpersEach2['default'](instance);
  _helpersHelperMissing2['default'](instance);
  _helpersIf2['default'](instance);
  _helpersLog2['default'](instance);
  _helpersLookup2['default'](instance);
  _helpersWith2['default'](instance);
}

function moveHelperToHooks(instance, helperName, keepHelper) {
  if (instance.helpers[helperName]) {
    instance.hooks[helperName] = instance.helpers[helperName];
    if (!keepHelper) {
      delete instance.helpers[helperName];
    }
  }
}

var decorators = {};

var inline = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;

	var _utils = utils;

	exports['default'] = function (instance) {
	  instance.registerDecorator('inline', function (fn, props, container, options) {
	    var ret = fn;
	    if (!props.partials) {
	      props.partials = {};
	      ret = function (context, options) {
	        // Create a new partials stack frame prior to exec.
	        var original = container.partials;
	        container.partials = _utils.extend({}, original, props.partials);
	        var ret = fn(context, options);
	        container.partials = original;
	        return ret;
	      };
	    }

	    props.partials[options.args[0]] = options.fn;

	    return ret;
	  });
	};

	module.exports = exports['default'];
	
} (inline, inline.exports));

decorators.__esModule = true;
decorators.registerDefaultDecorators = registerDefaultDecorators;
// istanbul ignore next

function _interopRequireDefault$2(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _decoratorsInline = inline.exports;

var _decoratorsInline2 = _interopRequireDefault$2(_decoratorsInline);

function registerDefaultDecorators(instance) {
  _decoratorsInline2['default'](instance);
}

var logger$1 = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;

	var _utils = utils;

	var logger = {
	  methodMap: ['debug', 'info', 'warn', 'error'],
	  level: 'info',

	  // Maps a given level value to the `methodMap` indexes above.
	  lookupLevel: function lookupLevel(level) {
	    if (typeof level === 'string') {
	      var levelMap = _utils.indexOf(logger.methodMap, level.toLowerCase());
	      if (levelMap >= 0) {
	        level = levelMap;
	      } else {
	        level = parseInt(level, 10);
	      }
	    }

	    return level;
	  },

	  // Can be overridden in the host environment
	  log: function log(level) {
	    level = logger.lookupLevel(level);

	    if (typeof console !== 'undefined' && logger.lookupLevel(logger.level) <= level) {
	      var method = logger.methodMap[level];
	      // eslint-disable-next-line no-console
	      if (!console[method]) {
	        method = 'log';
	      }

	      for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        message[_key - 1] = arguments[_key];
	      }

	      console[method].apply(console, message); // eslint-disable-line no-console
	    }
	  }
	};

	exports['default'] = logger;
	module.exports = exports['default'];
	
} (logger$1, logger$1.exports));

var protoAccess = {};

var createNewLookupObject$1 = {};

createNewLookupObject$1.__esModule = true;
createNewLookupObject$1.createNewLookupObject = createNewLookupObject;

var _utils$2 = utils;

/**
 * Create a new object with "null"-prototype to avoid truthy results on prototype properties.
 * The resulting object can be used with "object[property]" to check if a property exists
 * @param {...object} sources a varargs parameter of source objects that will be merged
 * @returns {object}
 */

function createNewLookupObject() {
  for (var _len = arguments.length, sources = Array(_len), _key = 0; _key < _len; _key++) {
    sources[_key] = arguments[_key];
  }

  return _utils$2.extend.apply(undefined, [Object.create(null)].concat(sources));
}

protoAccess.__esModule = true;
protoAccess.createProtoAccessControl = createProtoAccessControl;
protoAccess.resultIsAllowed = resultIsAllowed;
protoAccess.resetLoggedProperties = resetLoggedProperties;
// istanbul ignore next

function _interopRequireWildcard$1(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _createNewLookupObject = createNewLookupObject$1;

var _logger$1 = logger$1.exports;

var logger = _interopRequireWildcard$1(_logger$1);

var loggedProperties = Object.create(null);

function createProtoAccessControl(runtimeOptions) {
  var defaultMethodWhiteList = Object.create(null);
  defaultMethodWhiteList['constructor'] = false;
  defaultMethodWhiteList['__defineGetter__'] = false;
  defaultMethodWhiteList['__defineSetter__'] = false;
  defaultMethodWhiteList['__lookupGetter__'] = false;

  var defaultPropertyWhiteList = Object.create(null);
  // eslint-disable-next-line no-proto
  defaultPropertyWhiteList['__proto__'] = false;

  return {
    properties: {
      whitelist: _createNewLookupObject.createNewLookupObject(defaultPropertyWhiteList, runtimeOptions.allowedProtoProperties),
      defaultValue: runtimeOptions.allowProtoPropertiesByDefault
    },
    methods: {
      whitelist: _createNewLookupObject.createNewLookupObject(defaultMethodWhiteList, runtimeOptions.allowedProtoMethods),
      defaultValue: runtimeOptions.allowProtoMethodsByDefault
    }
  };
}

function resultIsAllowed(result, protoAccessControl, propertyName) {
  if (typeof result === 'function') {
    return checkWhiteList(protoAccessControl.methods, propertyName);
  } else {
    return checkWhiteList(protoAccessControl.properties, propertyName);
  }
}

function checkWhiteList(protoAccessControlForType, propertyName) {
  if (protoAccessControlForType.whitelist[propertyName] !== undefined) {
    return protoAccessControlForType.whitelist[propertyName] === true;
  }
  if (protoAccessControlForType.defaultValue !== undefined) {
    return protoAccessControlForType.defaultValue;
  }
  logUnexpecedPropertyAccessOnce(propertyName);
  return false;
}

function logUnexpecedPropertyAccessOnce(propertyName) {
  if (loggedProperties[propertyName] !== true) {
    loggedProperties[propertyName] = true;
    logger.log('error', 'Handlebars: Access has been denied to resolve the property "' + propertyName + '" because it is not an "own property" of its parent.\n' + 'You can add a runtime option to disable the check or this warning:\n' + 'See https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access for details');
  }
}

function resetLoggedProperties() {
  Object.keys(loggedProperties).forEach(function (propertyName) {
    delete loggedProperties[propertyName];
  });
}

base.__esModule = true;
base.HandlebarsEnvironment = HandlebarsEnvironment;
// istanbul ignore next

function _interopRequireDefault$1(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils$1 = utils;

var _exception$1 = exception.exports;

var _exception2$1 = _interopRequireDefault$1(_exception$1);

var _helpers$1 = helpers;

var _decorators = decorators;

var _logger = logger$1.exports;

var _logger2 = _interopRequireDefault$1(_logger);

var _internalProtoAccess$1 = protoAccess;

var VERSION = '4.7.7';
base.VERSION = VERSION;
var COMPILER_REVISION = 8;
base.COMPILER_REVISION = COMPILER_REVISION;
var LAST_COMPATIBLE_COMPILER_REVISION = 7;

base.LAST_COMPATIBLE_COMPILER_REVISION = LAST_COMPATIBLE_COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '== 1.x.x',
  5: '== 2.0.0-alpha.x',
  6: '>= 2.0.0-beta.1',
  7: '>= 4.0.0 <4.3.0',
  8: '>= 4.3.0'
};

base.REVISION_CHANGES = REVISION_CHANGES;
var objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials, decorators) {
  this.helpers = helpers || {};
  this.partials = partials || {};
  this.decorators = decorators || {};

  _helpers$1.registerDefaultHelpers(this);
  _decorators.registerDefaultDecorators(this);
}

HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: _logger2['default'],
  log: _logger2['default'].log,

  registerHelper: function registerHelper(name, fn) {
    if (_utils$1.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2$1['default']('Arg not supported with multiple helpers');
      }
      _utils$1.extend(this.helpers, name);
    } else {
      this.helpers[name] = fn;
    }
  },
  unregisterHelper: function unregisterHelper(name) {
    delete this.helpers[name];
  },

  registerPartial: function registerPartial(name, partial) {
    if (_utils$1.toString.call(name) === objectType) {
      _utils$1.extend(this.partials, name);
    } else {
      if (typeof partial === 'undefined') {
        throw new _exception2$1['default']('Attempting to register a partial called "' + name + '" as undefined');
      }
      this.partials[name] = partial;
    }
  },
  unregisterPartial: function unregisterPartial(name) {
    delete this.partials[name];
  },

  registerDecorator: function registerDecorator(name, fn) {
    if (_utils$1.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2$1['default']('Arg not supported with multiple decorators');
      }
      _utils$1.extend(this.decorators, name);
    } else {
      this.decorators[name] = fn;
    }
  },
  unregisterDecorator: function unregisterDecorator(name) {
    delete this.decorators[name];
  },
  /**
   * Reset the memory of illegal property accesses that have already been logged.
   * @deprecated should only be used in handlebars test-cases
   */
  resetLoggedPropertyAccesses: function resetLoggedPropertyAccesses() {
    _internalProtoAccess$1.resetLoggedProperties();
  }
};

var log = _logger2['default'].log;

base.log = log;
base.createFrame = _utils$1.createFrame;
base.logger = _logger2['default'];

var safeString = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	function SafeString(string) {
	  this.string = string;
	}

	SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
	  return '' + this.string;
	};

	exports['default'] = SafeString;
	module.exports = exports['default'];
	
} (safeString, safeString.exports));

var runtime$1 = {};

var wrapHelper$1 = {};

wrapHelper$1.__esModule = true;
wrapHelper$1.wrapHelper = wrapHelper;

function wrapHelper(helper, transformOptionsFn) {
  if (typeof helper !== 'function') {
    // This should not happen, but apparently it does in https://github.com/wycats/handlebars.js/issues/1639
    // We try to make the wrapper least-invasive by not wrapping it, if the helper is not a function.
    return helper;
  }
  var wrapper = function wrapper() /* dynamic arguments */{
    var options = arguments[arguments.length - 1];
    arguments[arguments.length - 1] = transformOptionsFn(options);
    return helper.apply(this, arguments);
  };
  return wrapper;
}

runtime$1.__esModule = true;
runtime$1.checkRevision = checkRevision;
runtime$1.template = template;
runtime$1.wrapProgram = wrapProgram;
runtime$1.resolvePartial = resolvePartial;
runtime$1.invokePartial = invokePartial;
runtime$1.noop = noop;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _utils = utils;

var Utils = _interopRequireWildcard(_utils);

var _exception = exception.exports;

var _exception2 = _interopRequireDefault(_exception);

var _base = base;

var _helpers = helpers;

var _internalWrapHelper = wrapHelper$1;

var _internalProtoAccess = protoAccess;

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = _base.COMPILER_REVISION;

  if (compilerRevision >= _base.LAST_COMPATIBLE_COMPILER_REVISION && compilerRevision <= _base.COMPILER_REVISION) {
    return;
  }

  if (compilerRevision < _base.LAST_COMPATIBLE_COMPILER_REVISION) {
    var runtimeVersions = _base.REVISION_CHANGES[currentRevision],
        compilerVersions = _base.REVISION_CHANGES[compilerRevision];
    throw new _exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
  } else {
    // Use the embedded version info since the runtime doesn't know about this revision yet
    throw new _exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
  }
}

function template(templateSpec, env) {
  /* istanbul ignore next */
  if (!env) {
    throw new _exception2['default']('No environment passed to template');
  }
  if (!templateSpec || !templateSpec.main) {
    throw new _exception2['default']('Unknown template object: ' + typeof templateSpec);
  }

  templateSpec.main.decorator = templateSpec.main_d;

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as pseudo-supported APIs.
  env.VM.checkRevision(templateSpec.compiler);

  // backwards compatibility for precompiled templates with compiler-version 7 (<4.3.0)
  var templateWasPrecompiledWithCompilerV7 = templateSpec.compiler && templateSpec.compiler[0] === 7;

  function invokePartialWrapper(partial, context, options) {
    if (options.hash) {
      context = Utils.extend({}, context, options.hash);
      if (options.ids) {
        options.ids[0] = true;
      }
    }
    partial = env.VM.resolvePartial.call(this, partial, context, options);

    var extendedOptions = Utils.extend({}, options, {
      hooks: this.hooks,
      protoAccessControl: this.protoAccessControl
    });

    var result = env.VM.invokePartial.call(this, partial, context, extendedOptions);

    if (result == null && env.compile) {
      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
      result = options.partials[options.name](context, extendedOptions);
    }
    if (result != null) {
      if (options.indent) {
        var lines = result.split('\n');
        for (var i = 0, l = lines.length; i < l; i++) {
          if (!lines[i] && i + 1 === l) {
            break;
          }

          lines[i] = options.indent + lines[i];
        }
        result = lines.join('\n');
      }
      return result;
    } else {
      throw new _exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
    }
  }

  // Just add water
  var container = {
    strict: function strict(obj, name, loc) {
      if (!obj || !(name in obj)) {
        throw new _exception2['default']('"' + name + '" not defined in ' + obj, {
          loc: loc
        });
      }
      return container.lookupProperty(obj, name);
    },
    lookupProperty: function lookupProperty(parent, propertyName) {
      var result = parent[propertyName];
      if (result == null) {
        return result;
      }
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return result;
      }

      if (_internalProtoAccess.resultIsAllowed(result, container.protoAccessControl, propertyName)) {
        return result;
      }
      return undefined;
    },
    lookup: function lookup(depths, name) {
      var len = depths.length;
      for (var i = 0; i < len; i++) {
        var result = depths[i] && container.lookupProperty(depths[i], name);
        if (result != null) {
          return depths[i][name];
        }
      }
    },
    lambda: function lambda(current, context) {
      return typeof current === 'function' ? current.call(context) : current;
    },

    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,

    fn: function fn(i) {
      var ret = templateSpec[i];
      ret.decorator = templateSpec[i + '_d'];
      return ret;
    },

    programs: [],
    program: function program(i, data, declaredBlockParams, blockParams, depths) {
      var programWrapper = this.programs[i],
          fn = this.fn(i);
      if (data || depths || blockParams || declaredBlockParams) {
        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
      }
      return programWrapper;
    },

    data: function data(value, depth) {
      while (value && depth--) {
        value = value._parent;
      }
      return value;
    },
    mergeIfNeeded: function mergeIfNeeded(param, common) {
      var obj = param || common;

      if (param && common && param !== common) {
        obj = Utils.extend({}, common, param);
      }

      return obj;
    },
    // An empty object to use as replacement for null-contexts
    nullContext: Object.seal({}),

    noop: env.VM.noop,
    compilerInfo: templateSpec.compiler
  };

  function ret(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var data = options.data;

    ret._setup(options);
    if (!options.partial && templateSpec.useData) {
      data = initData(context, data);
    }
    var depths = undefined,
        blockParams = templateSpec.useBlockParams ? [] : undefined;
    if (templateSpec.useDepths) {
      if (options.depths) {
        depths = context != options.depths[0] ? [context].concat(options.depths) : options.depths;
      } else {
        depths = [context];
      }
    }

    function main(context /*, options*/) {
      return '' + templateSpec.main(container, context, container.helpers, container.partials, data, blockParams, depths);
    }

    main = executeDecorators(templateSpec.main, main, container, options.depths || [], data, blockParams);
    return main(context, options);
  }

  ret.isTop = true;

  ret._setup = function (options) {
    if (!options.partial) {
      var mergedHelpers = Utils.extend({}, env.helpers, options.helpers);
      wrapHelpersToPassLookupProperty(mergedHelpers, container);
      container.helpers = mergedHelpers;

      if (templateSpec.usePartial) {
        // Use mergeIfNeeded here to prevent compiling global partials multiple times
        container.partials = container.mergeIfNeeded(options.partials, env.partials);
      }
      if (templateSpec.usePartial || templateSpec.useDecorators) {
        container.decorators = Utils.extend({}, env.decorators, options.decorators);
      }

      container.hooks = {};
      container.protoAccessControl = _internalProtoAccess.createProtoAccessControl(options);

      var keepHelperInHelpers = options.allowCallsToHelperMissing || templateWasPrecompiledWithCompilerV7;
      _helpers.moveHelperToHooks(container, 'helperMissing', keepHelperInHelpers);
      _helpers.moveHelperToHooks(container, 'blockHelperMissing', keepHelperInHelpers);
    } else {
      container.protoAccessControl = options.protoAccessControl; // internal option
      container.helpers = options.helpers;
      container.partials = options.partials;
      container.decorators = options.decorators;
      container.hooks = options.hooks;
    }
  };

  ret._child = function (i, data, blockParams, depths) {
    if (templateSpec.useBlockParams && !blockParams) {
      throw new _exception2['default']('must pass block params');
    }
    if (templateSpec.useDepths && !depths) {
      throw new _exception2['default']('must pass parent depths');
    }

    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
  };
  return ret;
}

function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
  function prog(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var currentDepths = depths;
    if (depths && context != depths[0] && !(context === container.nullContext && depths[0] === null)) {
      currentDepths = [context].concat(depths);
    }

    return fn(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), currentDepths);
  }

  prog = executeDecorators(fn, prog, container, depths, data, blockParams);

  prog.program = i;
  prog.depth = depths ? depths.length : 0;
  prog.blockParams = declaredBlockParams || 0;
  return prog;
}

/**
 * This is currently part of the official API, therefore implementation details should not be changed.
 */

function resolvePartial(partial, context, options) {
  if (!partial) {
    if (options.name === '@partial-block') {
      partial = options.data['partial-block'];
    } else {
      partial = options.partials[options.name];
    }
  } else if (!partial.call && !options.name) {
    // This is a dynamic partial that returned a string
    options.name = partial;
    partial = options.partials[partial];
  }
  return partial;
}

function invokePartial(partial, context, options) {
  // Use the current closure context to save the partial-block if this partial
  var currentPartialBlock = options.data && options.data['partial-block'];
  options.partial = true;
  if (options.ids) {
    options.data.contextPath = options.ids[0] || options.data.contextPath;
  }

  var partialBlock = undefined;
  if (options.fn && options.fn !== noop) {
    (function () {
      options.data = _base.createFrame(options.data);
      // Wrapper function to get access to currentPartialBlock from the closure
      var fn = options.fn;
      partialBlock = options.data['partial-block'] = function partialBlockWrapper(context) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        // Restore the partial-block from the closure for the execution of the block
        // i.e. the part inside the block of the partial call.
        options.data = _base.createFrame(options.data);
        options.data['partial-block'] = currentPartialBlock;
        return fn(context, options);
      };
      if (fn.partials) {
        options.partials = Utils.extend({}, options.partials, fn.partials);
      }
    })();
  }

  if (partial === undefined && partialBlock) {
    partial = partialBlock;
  }

  if (partial === undefined) {
    throw new _exception2['default']('The partial ' + options.name + ' could not be found');
  } else if (partial instanceof Function) {
    return partial(context, options);
  }
}

function noop() {
  return '';
}

function initData(context, data) {
  if (!data || !('root' in data)) {
    data = data ? _base.createFrame(data) : {};
    data.root = context;
  }
  return data;
}

function executeDecorators(fn, prog, container, depths, data, blockParams) {
  if (fn.decorator) {
    var props = {};
    prog = fn.decorator(prog, props, container, depths && depths[0], data, blockParams, depths);
    Utils.extend(prog, props);
  }
  return prog;
}

function wrapHelpersToPassLookupProperty(mergedHelpers, container) {
  Object.keys(mergedHelpers).forEach(function (helperName) {
    var helper = mergedHelpers[helperName];
    mergedHelpers[helperName] = passLookupPropertyOption(helper, container);
  });
}

function passLookupPropertyOption(helper, container) {
  var lookupProperty = container.lookupProperty;
  return _internalWrapHelper.wrapHelper(helper, function (options) {
    return Utils.extend({ lookupProperty: lookupProperty }, options);
  });
}

var noConflict = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;

	exports['default'] = function (Handlebars) {
	  /* istanbul ignore next */
	  var root = typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : window,
	      $Handlebars = root.Handlebars;
	  /* istanbul ignore next */
	  Handlebars.noConflict = function () {
	    if (root.Handlebars === Handlebars) {
	      root.Handlebars = $Handlebars;
	    }
	    return Handlebars;
	  };
	};

	module.exports = exports['default'];
	
} (noConflict, noConflict.exports));

(function (module, exports) {

	exports.__esModule = true;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	// istanbul ignore next

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	var _handlebarsBase = base;

	var base$1 = _interopRequireWildcard(_handlebarsBase);

	// Each of these augment the Handlebars object. No need to setup here.
	// (This is done to easily share code between commonjs and browse envs)

	var _handlebarsSafeString = safeString.exports;

	var _handlebarsSafeString2 = _interopRequireDefault(_handlebarsSafeString);

	var _handlebarsException = exception.exports;

	var _handlebarsException2 = _interopRequireDefault(_handlebarsException);

	var _handlebarsUtils = utils;

	var Utils = _interopRequireWildcard(_handlebarsUtils);

	var _handlebarsRuntime = runtime$1;

	var runtime = _interopRequireWildcard(_handlebarsRuntime);

	var _handlebarsNoConflict = noConflict.exports;

	var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict);

	// For compatibility and usage outside of module systems, make the Handlebars object a namespace
	function create() {
	  var hb = new base$1.HandlebarsEnvironment();

	  Utils.extend(hb, base$1);
	  hb.SafeString = _handlebarsSafeString2['default'];
	  hb.Exception = _handlebarsException2['default'];
	  hb.Utils = Utils;
	  hb.escapeExpression = Utils.escapeExpression;

	  hb.VM = runtime;
	  hb.template = function (spec) {
	    return runtime.template(spec, hb);
	  };

	  return hb;
	}

	var inst = create();
	inst.create = create;

	_handlebarsNoConflict2['default'](inst);

	inst['default'] = inst;

	exports['default'] = inst;
	module.exports = exports['default'];
	
} (handlebars_runtime, handlebars_runtime.exports));

// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
var runtime = handlebars_runtime.exports['default'];

var templateClient = {"1":function(container,depth0,helpers,partials,data) {
    return "import { NgModule} from '@angular/core';\nimport { HttpClientModule } from '@angular/common/http';\n\nimport { AngularHttpRequest } from './core/AngularHttpRequest';\nimport { BaseHttpRequest } from './core/BaseHttpRequest';\nimport type { OpenAPIConfig } from './core/OpenAPI';\nimport { OpenAPI } from './core/OpenAPI';\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "import type { BaseHttpRequest } from './core/BaseHttpRequest';\nimport type { OpenAPIConfig } from './core/OpenAPI';\nimport { "
    + ((stack1 = alias2(alias1(depth0, "httpRequest", {"start":{"line":14,"column":12},"end":{"line":14,"column":23}} ), depth0)) != null ? stack1 : "")
    + " } from './core/"
    + ((stack1 = alias2(alias1(depth0, "httpRequest", {"start":{"line":14,"column":45},"end":{"line":14,"column":56}} ), depth0)) != null ? stack1 : "")
    + "';\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"services"),{"name":"each","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":18,"column":0},"end":{"line":20,"column":9}}})) != null ? stack1 : "");
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "import { "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":19,"column":12},"end":{"line":19,"column":16}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "postfix", {"start":{"line":19,"column":22},"end":{"line":19,"column":35}} ), depth0)) != null ? stack1 : "")
    + " } from './services/"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":19,"column":61},"end":{"line":19,"column":65}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "postfix", {"start":{"line":19,"column":71},"end":{"line":19,"column":84}} ), depth0)) != null ? stack1 : "")
    + "';\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "@NgModule({\n	imports: [HttpClientModule],\n	providers: [\n		{\n			provide: OpenAPI,\n			useValue: {\n				BASE: OpenAPI?.BASE ?? '"
    + ((stack1 = alias2(alias1(depth0, "server", {"start":{"line":30,"column":31},"end":{"line":30,"column":37}} ), depth0)) != null ? stack1 : "")
    + "',\n				VERSION: OpenAPI?.VERSION ?? '"
    + ((stack1 = alias2(alias1(depth0, "version", {"start":{"line":31,"column":37},"end":{"line":31,"column":44}} ), depth0)) != null ? stack1 : "")
    + "',\n				WITH_CREDENTIALS: OpenAPI?.WITH_CREDENTIALS ?? false,\n				CREDENTIALS: OpenAPI?.CREDENTIALS ?? 'include',\n				TOKEN: OpenAPI?.TOKEN,\n				USERNAME: OpenAPI?.USERNAME,\n				PASSWORD: OpenAPI?.PASSWORD,\n				HEADERS: OpenAPI?.HEADERS,\n				ENCODE_PATH: OpenAPI?.ENCODE_PATH,\n			} as OpenAPIConfig,\n		},\n		{\n			provide: BaseHttpRequest,\n			useClass: AngularHttpRequest,\n		},\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"services"),{"name":"each","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":45,"column":2},"end":{"line":47,"column":11}}})) != null ? stack1 : "")
    + "	]\n})\nexport class "
    + ((stack1 = alias2(alias1(depth0, "clientName", {"start":{"line":50,"column":16},"end":{"line":50,"column":26}} ), depth0)) != null ? stack1 : "")
    + " {}\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "		"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":46,"column":5},"end":{"line":46,"column":9}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "postfix", {"start":{"line":46,"column":15},"end":{"line":46,"column":28}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, alias3=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;\n\nexport class "
    + ((stack1 = alias2(alias1(depth0, "clientName", {"start":{"line":54,"column":16},"end":{"line":54,"column":26}} ), depth0)) != null ? stack1 : "")
    + " {\n\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias3,lookupProperty(depth0,"services"),{"name":"each","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":56,"column":1},"end":{"line":58,"column":10}}})) != null ? stack1 : "")
    + "\n	public readonly request: BaseHttpRequest;\n\n	constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = "
    + ((stack1 = alias2(alias1(depth0, "httpRequest", {"start":{"line":62,"column":87},"end":{"line":62,"column":98}} ), depth0)) != null ? stack1 : "")
    + ") {\n		this.request = new HttpRequest({\n			BASE: config?.BASE ?? '"
    + ((stack1 = alias2(alias1(depth0, "server", {"start":{"line":64,"column":29},"end":{"line":64,"column":35}} ), depth0)) != null ? stack1 : "")
    + "',\n			VERSION: config?.VERSION ?? '"
    + ((stack1 = alias2(alias1(depth0, "version", {"start":{"line":65,"column":35},"end":{"line":65,"column":42}} ), depth0)) != null ? stack1 : "")
    + "',\n			WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,\n			CREDENTIALS: config?.CREDENTIALS ?? 'include',\n			TOKEN: config?.TOKEN,\n			USERNAME: config?.USERNAME,\n			PASSWORD: config?.PASSWORD,\n			HEADERS: config?.HEADERS,\n			ENCODE_PATH: config?.ENCODE_PATH,\n		});\n\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias3,lookupProperty(depth0,"services"),{"name":"each","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":75,"column":2},"end":{"line":77,"column":11}}})) != null ? stack1 : "")
    + "	}\n}\n";
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	public readonly "
    + ((stack1 = lookupProperty(helpers,"camelCase").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"name"),{"name":"camelCase","hash":{},"data":data,"loc":{"start":{"line":57,"column":17},"end":{"line":57,"column":37}}})) != null ? stack1 : "")
    + ": "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":57,"column":42},"end":{"line":57,"column":46}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "postfix", {"start":{"line":57,"column":52},"end":{"line":57,"column":65}} ), depth0)) != null ? stack1 : "")
    + ";\n";
},"14":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "		this."
    + ((stack1 = lookupProperty(helpers,"camelCase").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"name"),{"name":"camelCase","hash":{},"data":data,"loc":{"start":{"line":76,"column":7},"end":{"line":76,"column":27}}})) != null ? stack1 : "")
    + " = new "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":76,"column":37},"end":{"line":76,"column":41}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "postfix", {"start":{"line":76,"column":47},"end":{"line":76,"column":60}} ), depth0)) != null ? stack1 : "")
    + "(this.request);\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"angular",{"name":"equals","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":15,"column":11}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"services"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":17,"column":0},"end":{"line":21,"column":7}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"angular",{"name":"equals","hash":{},"fn":container.program(8, data, 0),"inverse":container.program(11, data, 0),"data":data,"loc":{"start":{"line":23,"column":0},"end":{"line":80,"column":11}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true};

var angularGetHeaders = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getHeaders = (config: OpenAPIConfig, options: ApiRequestOptions): Observable<HttpHeaders> => {\n	return forkJoin({\n		token: resolve(options, config.TOKEN),\n		username: resolve(options, config.USERNAME),\n		password: resolve(options, config.PASSWORD),\n		additionalHeaders: resolve(options, config.HEADERS),\n	}).pipe(\n		map(({ token, username, password, additionalHeaders }) => {\n			const headers = Object.entries({\n				Accept: 'application/json',\n				...additionalHeaders,\n				...options.headers,\n			})\n				.filter(([_, value]) => isDefined(value))\n				.reduce((headers, [key, value]) => ({\n					...headers,\n					[key]: String(value),\n				}), {} as Record<string, string>);\n\n			if (isStringWithValue(token)) {\n				headers['Authorization'] = `Bearer ${token}`;\n			}\n\n			if (isStringWithValue(username) && isStringWithValue(password)) {\n				const credentials = base64(`${username}:${password}`);\n				headers['Authorization'] = `Basic ${credentials}`;\n			}\n\n			if (options.body) {\n				if (options.mediaType) {\n					headers['Content-Type'] = options.mediaType;\n				} else if (isBlob(options.body)) {\n					headers['Content-Type'] = options.body.type || 'application/octet-stream';\n				} else if (isString(options.body)) {\n					headers['Content-Type'] = 'text/plain';\n				} else if (!isFormData(options.body)) {\n					headers['Content-Type'] = 'application/json';\n				}\n			}\n\n			return new HttpHeaders(headers);\n		}),\n	);\n};";
},"useData":true};

var angularGetRequestBody = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getRequestBody = (options: ApiRequestOptions): any => {\n	if (options.body) {\n		if (options.mediaType?.includes('/json')) {\n			return JSON.stringify(options.body)\n		} else if (isString(options.body) || isBlob(options.body) || isFormData(options.body)) {\n			return options.body;\n		} else {\n			return JSON.stringify(options.body);\n		}\n	}\n	return undefined;\n};";
},"useData":true};

var angularGetResponseBody = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getResponseBody = <T>(response: HttpResponse<T>): T | undefined => {\n	if (response.status !== 204 && response.body !== null) {\n		return response.body;\n	}\n	return undefined;\n};";
},"useData":true};

var angularGetResponseHeader = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getResponseHeader = <T>(response: HttpResponse<T>, responseHeader?: string): string | undefined => {\n	if (responseHeader) {\n		const value = response.headers.get(responseHeader);\n		if (isString(value)) {\n			return value;\n		}\n	}\n	return undefined;\n};";
},"useData":true};

var angularRequest = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport { HttpClient, HttpHeaders } from '@angular/common/http';\nimport type { HttpResponse, HttpErrorResponse } from '@angular/common/http';\nimport { forkJoin, of, throwError } from 'rxjs';\nimport { catchError, map, switchMap } from 'rxjs/operators';\nimport type { Observable } from 'rxjs';\n\nimport { ApiError } from './ApiError';\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { ApiResult } from './ApiResult';\nimport type { OpenAPIConfig } from './OpenAPI';\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isDefined"),depth0,{"name":"functions/isDefined","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isString"),depth0,{"name":"functions/isString","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isStringWithValue"),depth0,{"name":"functions/isStringWithValue","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isBlob"),depth0,{"name":"functions/isBlob","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isFormData"),depth0,{"name":"functions/isFormData","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/base64"),depth0,{"name":"functions/base64","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getQueryString"),depth0,{"name":"functions/getQueryString","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getUrl"),depth0,{"name":"functions/getUrl","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getFormData"),depth0,{"name":"functions/getFormData","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/resolve"),depth0,{"name":"functions/resolve","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"angular/getHeaders"),depth0,{"name":"angular/getHeaders","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"angular/getRequestBody"),depth0,{"name":"angular/getRequestBody","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"angular/sendRequest"),depth0,{"name":"angular/sendRequest","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"angular/getResponseHeader"),depth0,{"name":"angular/getResponseHeader","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"angular/getResponseBody"),depth0,{"name":"angular/getResponseBody","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/catchErrorCodes"),depth0,{"name":"functions/catchErrorCodes","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n/**\n * Request method\n * @param config The OpenAPI configuration object\n * @param http The Angular HTTP client\n * @param options The request options from the service\n * @returns Observable<T>\n * @throws ApiError\n */\nexport const request = <T>(config: OpenAPIConfig, http: HttpClient, options: ApiRequestOptions): Observable<T> => {\n	const url = getUrl(config, options);\n	const formData = getFormData(options);\n	const body = getRequestBody(options);\n\n	return getHeaders(config, options).pipe(\n		switchMap(headers => {\n			return sendRequest<T>(config, options, http, url, formData, body, headers);\n		}),\n		map(response => {\n			const responseBody = getResponseBody(response);\n			const responseHeader = getResponseHeader(response, options.responseHeader);\n			return {\n				url,\n				ok: response.ok,\n				status: response.status,\n				statusText: response.statusText,\n				body: responseHeader ?? responseBody,\n			} as ApiResult;\n		}),\n		catchError((error: HttpErrorResponse) => {\n			if (!error.status) {\n				return throwError(error);\n			}\n			return of({\n				url,\n				ok: error.ok,\n				status: error.status,\n				statusText: error.statusText,\n				body: error.error ?? error.statusText,\n			} as ApiResult);\n		}),\n		map(result => {\n			catchErrorCodes(options, result);\n			return result.body as T;\n		}),\n		catchError((error: ApiError) => {\n			return throwError(error);\n		}),\n	);\n};";
},"usePartial":true,"useData":true};

var angularSendRequest = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "export const sendRequest = <T>(\n	config: OpenAPIConfig,\n	options: ApiRequestOptions,\n	http: HttpClient,\n	url: string,\n	body: any,\n	formData: FormData | undefined,\n	headers: HttpHeaders\n): Observable<HttpResponse<T>> => {\n	return http.request<T>(options.method, url, {\n		headers,\n		body: body ?? formData,\n		withCredentials: config.WITH_CREDENTIALS,\n		observe: 'response',\n	});\n};";
},"useData":true};

var templateCoreApiError = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { ApiResult } from './ApiResult';\n\nexport class ApiError extends Error {\n	public readonly url: string;\n	public readonly status: number;\n	public readonly statusText: string;\n	public readonly body: any;\n	public readonly request: ApiRequestOptions;\n\n	constructor(request: ApiRequestOptions, response: ApiResult, message: string) {\n		super(message);\n\n		this.name = 'ApiError';\n		this.url = response.url;\n		this.status = response.status;\n		this.statusText = response.statusText;\n		this.body = response.body;\n		this.request = request;\n	}\n}";
},"usePartial":true,"useData":true};

var templateCoreApiRequestOptions = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nexport type ApiRequestOptions = {\n	readonly method: 'GET' | 'PUT' | 'POST' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PATCH';\n	readonly url: string;\n	readonly path?: Record<string, any>;\n	readonly cookies?: Record<string, any>;\n	readonly headers?: Record<string, any>;\n	readonly query?: Record<string, any>;\n	readonly formData?: Record<string, any>;\n	readonly body?: any;\n	readonly mediaType?: string;\n	readonly responseHeader?: string;\n	readonly errors?: Record<number, string>;\n};";
},"usePartial":true,"useData":true};

var templateCoreApiResult = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nexport type ApiResult = {\n	readonly url: string;\n	readonly ok: boolean;\n	readonly status: number;\n	readonly statusText: string;\n	readonly body: any;\n};";
},"usePartial":true,"useData":true};

var axiosGetHeaders = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getHeaders = async (config: OpenAPIConfig, options: ApiRequestOptions, formData?: FormData): Promise<Record<string, string>> => {\n	const token = await resolve(options, config.TOKEN);\n	const username = await resolve(options, config.USERNAME);\n	const password = await resolve(options, config.PASSWORD);\n	const additionalHeaders = await resolve(options, config.HEADERS);\n	const formHeaders = typeof formData?.getHeaders === 'function' && formData?.getHeaders() || {}\n\n	const headers = Object.entries({\n		Accept: 'application/json',\n		...additionalHeaders,\n		...options.headers,\n		...formHeaders,\n	})\n	.filter(([_, value]) => isDefined(value))\n	.reduce((headers, [key, value]) => ({\n		...headers,\n		[key]: String(value),\n	}), {} as Record<string, string>);\n\n	if (isStringWithValue(token)) {\n		headers['Authorization'] = `Bearer ${token}`;\n	}\n\n	if (isStringWithValue(username) && isStringWithValue(password)) {\n		const credentials = base64(`${username}:${password}`);\n		headers['Authorization'] = `Basic ${credentials}`;\n	}\n\n	if (options.body) {\n		if (options.mediaType) {\n			headers['Content-Type'] = options.mediaType;\n		} else if (isBlob(options.body)) {\n			headers['Content-Type'] = options.body.type || 'application/octet-stream';\n		} else if (isString(options.body)) {\n			headers['Content-Type'] = 'text/plain';\n		} else if (!isFormData(options.body)) {\n			headers['Content-Type'] = 'application/json';\n		}\n	}\n\n	return headers;\n};";
},"useData":true};

var axiosGetRequestBody = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getRequestBody = (options: ApiRequestOptions): any => {\n	if (options.body) {\n		return options.body;\n	}\n	return undefined;\n};";
},"useData":true};

var axiosGetResponseBody = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getResponseBody = (response: AxiosResponse<any>): any => {\n	if (response.status !== 204) {\n		return response.data;\n	}\n	return undefined;\n};";
},"useData":true};

var axiosGetResponseHeader = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getResponseHeader = (response: AxiosResponse<any>, responseHeader?: string): string | undefined => {\n	if (responseHeader) {\n		const content = response.headers[responseHeader];\n		if (isString(content)) {\n			return content;\n		}\n	}\n	return undefined;\n};";
},"useData":true};

var axiosRequest = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport axios from 'axios';\nimport type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';\nimport FormData from 'form-data';\n\nimport { ApiError } from './ApiError';\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { ApiResult } from './ApiResult';\nimport { CancelablePromise } from './CancelablePromise';\nimport type { OnCancel } from './CancelablePromise';\nimport type { OpenAPIConfig } from './OpenAPI';\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isDefined"),depth0,{"name":"functions/isDefined","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isString"),depth0,{"name":"functions/isString","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isStringWithValue"),depth0,{"name":"functions/isStringWithValue","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isBlob"),depth0,{"name":"functions/isBlob","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isFormData"),depth0,{"name":"functions/isFormData","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isSuccess"),depth0,{"name":"functions/isSuccess","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/base64"),depth0,{"name":"functions/base64","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getQueryString"),depth0,{"name":"functions/getQueryString","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getUrl"),depth0,{"name":"functions/getUrl","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getFormData"),depth0,{"name":"functions/getFormData","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/resolve"),depth0,{"name":"functions/resolve","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"axios/getHeaders"),depth0,{"name":"axios/getHeaders","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"axios/getRequestBody"),depth0,{"name":"axios/getRequestBody","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"axios/sendRequest"),depth0,{"name":"axios/sendRequest","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"axios/getResponseHeader"),depth0,{"name":"axios/getResponseHeader","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"axios/getResponseBody"),depth0,{"name":"axios/getResponseBody","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/catchErrorCodes"),depth0,{"name":"functions/catchErrorCodes","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n/**\n * Request method\n * @param config The OpenAPI configuration object\n * @param options The request options from the service\n * @param additionalOptions Request-level axios overwrites\n * @returns CancelablePromise<T>\n * @throws ApiError\n */\nexport const request = <T>(config: OpenAPIConfig, options: ApiRequestOptions, additionalOptions: AxiosRequestConfig): CancelablePromise<T> => {\n	return new CancelablePromise(async (resolve, reject, onCancel) => {\n		try {\n			const url = getUrl(config, options);\n			const formData = getFormData(options);\n			const body = getRequestBody(options);\n			const headers = await getHeaders(config, options, formData);\n\n			if (!onCancel.isCancelled) {\n				const response = await sendRequest<T>(config, options, url, body, formData, headers, onCancel, additionalOptions);\n				const responseBody = getResponseBody(response);\n				const responseHeader = getResponseHeader(response, options.responseHeader);\n\n				const result: ApiResult = {\n					url,\n					ok: isSuccess(response.status),\n					status: response.status,\n					statusText: response.statusText,\n					body: responseHeader ?? responseBody,\n				};\n\n				catchErrorCodes(options, result);\n\n				resolve(result.body);\n			}\n		} catch (error) {\n			reject(error);\n		}\n	});\n};";
},"usePartial":true,"useData":true};

var axiosSendRequest = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const sendRequest = async <T>(\n	config: OpenAPIConfig,\n	options: ApiRequestOptions,\n	url: string,\n	body: any,\n	formData: FormData | undefined,\n	headers: Record<string, string>,\n	onCancel: OnCancel\n	additionalOptions: AxiosRequestConfig,\n): Promise<AxiosResponse<T>> => {\n	const source = axios.CancelToken.source();\n\n	const requestConfig: AxiosRequestConfig = {\n		url,\n		headers,\n		data: body ?? formData,\n		method: options.method,\n		withCredentials: config.WITH_CREDENTIALS,\n		cancelToken: source.token,\n		...additionalOptions,\n	};\n\n	onCancel(() => source.cancel('The user aborted a request.'));\n\n	try {\n		return await axios.request(requestConfig);\n	} catch (error) {\n		const axiosError = error as AxiosError<T>;\n		if (axiosError.response) {\n			return axiosError.response;\n		}\n		throw error;\n	}\n};";
},"useData":true};

var templateCoreBaseHttpRequest = {"1":function(container,depth0,helpers,partials,data) {
    return "import type { HttpClient } from '@angular/common/http';\nimport type { Observable } from 'rxjs';\n\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { OpenAPIConfig } from './OpenAPI';\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "import type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { CancelablePromise } from './CancelablePromise';\nimport type { OpenAPIConfig } from './OpenAPI';\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "	constructor(\n		public readonly config: OpenAPIConfig,\n		public readonly http: HttpClient,\n	) {}\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "	constructor(public readonly config: OpenAPIConfig) {}\n";
},"9":function(container,depth0,helpers,partials,data) {
    return "	public abstract request<T>(options: ApiRequestOptions): Observable<T>;\n";
},"11":function(container,depth0,helpers,partials,data) {
    return "	public abstract request<T>(options: ApiRequestOptions): CancelablePromise<T>;\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"angular",{"name":"equals","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":13,"column":11}}})) != null ? stack1 : "")
    + "\nexport abstract class BaseHttpRequest {\n\n"
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"angular",{"name":"equals","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data,"loc":{"start":{"line":17,"column":1},"end":{"line":24,"column":12}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"angular",{"name":"equals","hash":{},"fn":container.program(9, data, 0),"inverse":container.program(11, data, 0),"data":data,"loc":{"start":{"line":26,"column":1},"end":{"line":30,"column":12}}})) != null ? stack1 : "")
    + "}";
},"usePartial":true,"useData":true};

var templateCancelablePromise = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nexport class CancelError extends Error {\n\n	constructor(message: string) {\n		super(message);\n		this.name = 'CancelError';\n	}\n\n	public get isCancelled(): boolean {\n		return true;\n	}\n}\n\nexport interface OnCancel {\n	readonly isResolved: boolean;\n	readonly isRejected: boolean;\n	readonly isCancelled: boolean;\n\n	(cancelHandler: () => void): void;\n}\n\nexport class CancelablePromise<T> implements Promise<T> {\n	readonly [Symbol.toStringTag]!: string;\n\n	private _isResolved: boolean;\n	private _isRejected: boolean;\n	private _isCancelled: boolean;\n	private readonly _cancelHandlers: (() => void)[];\n	private readonly _promise: Promise<T>;\n	private _resolve?: (value: T | PromiseLike<T>) => void;\n	private _reject?: (reason?: any) => void;\n\n	constructor(\n		executor: (\n			resolve: (value: T | PromiseLike<T>) => void,\n			reject: (reason?: any) => void,\n			onCancel: OnCancel\n		) => void\n	) {\n		this._isResolved = false;\n		this._isRejected = false;\n		this._isCancelled = false;\n		this._cancelHandlers = [];\n		this._promise = new Promise<T>((resolve, reject) => {\n			this._resolve = resolve;\n			this._reject = reject;\n\n			const onResolve = (value: T | PromiseLike<T>): void => {\n				if (this._isResolved || this._isRejected || this._isCancelled) {\n					return;\n				}\n				this._isResolved = true;\n				this._resolve?.(value);\n			};\n\n			const onReject = (reason?: any): void => {\n				if (this._isResolved || this._isRejected || this._isCancelled) {\n					return;\n				}\n				this._isRejected = true;\n				this._reject?.(reason);\n			};\n\n			const onCancel = (cancelHandler: () => void): void => {\n				if (this._isResolved || this._isRejected || this._isCancelled) {\n					return;\n				}\n				this._cancelHandlers.push(cancelHandler);\n			};\n\n			Object.defineProperty(onCancel, 'isResolved', {\n				get: (): boolean => this._isResolved,\n			});\n\n			Object.defineProperty(onCancel, 'isRejected', {\n				get: (): boolean => this._isRejected,\n			});\n\n			Object.defineProperty(onCancel, 'isCancelled', {\n				get: (): boolean => this._isCancelled,\n			});\n\n			return executor(onResolve, onReject, onCancel as OnCancel);\n		});\n	}\n\n	public then<TResult1 = T, TResult2 = never>(\n		onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,\n		onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null\n	): Promise<TResult1 | TResult2> {\n		return this._promise.then(onFulfilled, onRejected);\n	}\n\n	public catch<TResult = never>(\n		onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null\n	): Promise<T | TResult> {\n		return this._promise.catch(onRejected);\n	}\n\n	public finally(onFinally?: (() => void) | null): Promise<T> {\n		return this._promise.finally(onFinally);\n	}\n\n	public cancel(): void {\n		if (this._isResolved || this._isRejected || this._isCancelled) {\n			return;\n		}\n		this._isCancelled = true;\n		if (this._cancelHandlers.length) {\n			try {\n				for (const cancelHandler of this._cancelHandlers) {\n					cancelHandler();\n				}\n			} catch (error) {\n				console.warn('Cancellation threw an error', error);\n				return;\n			}\n		}\n		this._cancelHandlers.length = 0;\n		this._reject?.(new CancelError('Request aborted'));\n	}\n\n	public get isCancelled(): boolean {\n		return this._isCancelled;\n	}\n}";
},"usePartial":true,"useData":true};

var fetchGetHeaders = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getHeaders = async (config: OpenAPIConfig, options: ApiRequestOptions): Promise<Headers> => {\n	const token = await resolve(options, config.TOKEN);\n	const username = await resolve(options, config.USERNAME);\n	const password = await resolve(options, config.PASSWORD);\n	const additionalHeaders = await resolve(options, config.HEADERS);\n\n	const headers = Object.entries({\n		Accept: 'application/json',\n		...additionalHeaders,\n		...options.headers,\n	})\n		.filter(([_, value]) => isDefined(value))\n		.reduce((headers, [key, value]) => ({\n			...headers,\n			[key]: String(value),\n		}), {} as Record<string, string>);\n\n	if (isStringWithValue(token)) {\n		headers['Authorization'] = `Bearer ${token}`;\n	}\n\n	if (isStringWithValue(username) && isStringWithValue(password)) {\n		const credentials = base64(`${username}:${password}`);\n		headers['Authorization'] = `Basic ${credentials}`;\n	}\n\n	if (options.body) {\n		if (options.mediaType) {\n			headers['Content-Type'] = options.mediaType;\n		} else if (isBlob(options.body)) {\n			headers['Content-Type'] = options.body.type || 'application/octet-stream';\n		} else if (isString(options.body)) {\n			headers['Content-Type'] = 'text/plain';\n		} else if (!isFormData(options.body)) {\n			headers['Content-Type'] = 'application/json';\n		}\n	}\n\n	return new Headers(headers);\n};";
},"useData":true};

var fetchGetRequestBody = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getRequestBody = (options: ApiRequestOptions): any => {\n	if (options.body !== undefined) {\n		if (options.mediaType?.includes('/json')) {\n			return JSON.stringify(options.body)\n		} else if (isString(options.body) || isBlob(options.body) || isFormData(options.body)) {\n			return options.body;\n		} else {\n			return JSON.stringify(options.body);\n		}\n	}\n	return undefined;\n};";
},"useData":true};

var fetchGetResponseBody = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getResponseBody = async (response: Response): Promise<any> => {\n	if (response.status !== 204) {\n		try {\n			const contentType = response.headers.get('Content-Type');\n			if (contentType) {\n				const isJSON = contentType.toLowerCase().startsWith('application/json');\n				if (isJSON) {\n					return await response.json();\n				} else {\n					return await response.text();\n				}\n			}\n		} catch (error) {\n			console.error(error);\n		}\n	}\n	return undefined;\n};";
},"useData":true};

var fetchGetResponseHeader = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getResponseHeader = (response: Response, responseHeader?: string): string | undefined => {\n	if (responseHeader) {\n		const content = response.headers.get(responseHeader);\n		if (isString(content)) {\n			return content;\n		}\n	}\n	return undefined;\n};";
},"useData":true};

var fetchRequest = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport { ApiError } from './ApiError';\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { ApiResult } from './ApiResult';\nimport { CancelablePromise } from './CancelablePromise';\nimport type { OnCancel } from './CancelablePromise';\nimport type { OpenAPIConfig } from './OpenAPI';\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isDefined"),depth0,{"name":"functions/isDefined","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isString"),depth0,{"name":"functions/isString","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isStringWithValue"),depth0,{"name":"functions/isStringWithValue","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isBlob"),depth0,{"name":"functions/isBlob","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isFormData"),depth0,{"name":"functions/isFormData","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/base64"),depth0,{"name":"functions/base64","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getQueryString"),depth0,{"name":"functions/getQueryString","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getUrl"),depth0,{"name":"functions/getUrl","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getFormData"),depth0,{"name":"functions/getFormData","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/resolve"),depth0,{"name":"functions/resolve","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"fetch/getHeaders"),depth0,{"name":"fetch/getHeaders","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"fetch/getRequestBody"),depth0,{"name":"fetch/getRequestBody","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"fetch/sendRequest"),depth0,{"name":"fetch/sendRequest","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"fetch/getResponseHeader"),depth0,{"name":"fetch/getResponseHeader","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"fetch/getResponseBody"),depth0,{"name":"fetch/getResponseBody","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/catchErrorCodes"),depth0,{"name":"functions/catchErrorCodes","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n/**\n * Request method\n * @param config The OpenAPI configuration object\n * @param options The request options from the service\n * @returns CancelablePromise<T>\n * @throws ApiError\n */\nexport const request = <T>(config: OpenAPIConfig, options: ApiRequestOptions): CancelablePromise<T> => {\n	return new CancelablePromise(async (resolve, reject, onCancel) => {\n		try {\n			const url = getUrl(config, options);\n			const formData = getFormData(options);\n			const body = getRequestBody(options);\n			const headers = await getHeaders(config, options);\n\n			if (!onCancel.isCancelled) {\n				const response = await sendRequest(config, options, url, body, formData, headers, onCancel);\n				const responseBody = await getResponseBody(response);\n				const responseHeader = getResponseHeader(response, options.responseHeader);\n\n				const result: ApiResult = {\n					url,\n					ok: response.ok,\n					status: response.status,\n					statusText: response.statusText,\n					body: responseHeader ?? responseBody,\n				};\n\n				catchErrorCodes(options, result);\n\n				resolve(result.body);\n			}\n		} catch (error) {\n			reject(error);\n		}\n	});\n};";
},"usePartial":true,"useData":true};

var fetchSendRequest = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "export const sendRequest = async (\n	config: OpenAPIConfig,\n	options: ApiRequestOptions,\n	url: string,\n	body: any,\n	formData: FormData | undefined,\n	headers: Headers,\n	onCancel: OnCancel\n): Promise<Response> => {\n	const controller = new AbortController();\n\n	const request: RequestInit = {\n		headers,\n		body: body ?? formData,\n		method: options.method,\n		signal: controller.signal,\n	};\n\n	if (config.WITH_CREDENTIALS) {\n		request.credentials = config.CREDENTIALS;\n	}\n\n	onCancel(() => controller.abort());\n\n	return await fetch(url, request);\n};";
},"useData":true};

var functionBase64 = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const base64 = (str: string): string => {\n	try {\n		return btoa(str);\n	} catch (err) {\n		// @ts-ignore\n		return Buffer.from(str).toString('base64');\n	}\n};";
},"useData":true};

var functionCatchErrorCodes = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const catchErrorCodes = (options: ApiRequestOptions, result: ApiResult): void => {\n	const errors: Record<number, string> = {\n		400: 'Bad Request',\n		401: 'Unauthorized',\n		403: 'Forbidden',\n		404: 'Not Found',\n		500: 'Internal Server Error',\n		502: 'Bad Gateway',\n		503: 'Service Unavailable',\n		...options.errors,\n	}\n\n	const error = errors[result.status];\n	if (error) {\n		throw new ApiError(options, result, error);\n	}\n\n	if (!result.ok) {\n		throw new ApiError(options, result, 'Generic Error');\n	}\n};";
},"useData":true};

var functionGetFormData = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getFormData = (options: ApiRequestOptions): FormData | undefined => {\n	if (options.formData) {\n		const formData = new FormData();\n\n		const process = (key: string, value: any) => {\n			if (isString(value) || isBlob(value)) {\n				formData.append(key, value);\n			} else {\n				formData.append(key, JSON.stringify(value));\n			}\n		};\n\n		Object.entries(options.formData)\n			.filter(([_, value]) => isDefined(value))\n			.forEach(([key, value]) => {\n				if (Array.isArray(value)) {\n					value.forEach(v => process(key, v));\n				} else {\n					process(key, value);\n				}\n			});\n\n		return formData;\n	}\n	return undefined;\n};";
},"useData":true};

var functionGetQueryString = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getQueryString = (params: Record<string, any>): string => {\n	const qs: string[] = [];\n\n	const append = (key: string, value: any) => {\n		qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);\n	};\n\n	const process = (key: string, value: any) => {\n		if (isDefined(value)) {\n			if (Array.isArray(value)) {\n				value.forEach(v => {\n					process(key, v);\n				});\n			} else if (typeof value === 'object') {\n				Object.entries(value).forEach(([k, v]) => {\n					process(`${key}[${k}]`, v);\n				});\n			} else {\n				append(key, value);\n			}\n		}\n	};\n\n	Object.entries(params).forEach(([key, value]) => {\n		process(key, value);\n	});\n\n	if (qs.length > 0) {\n		return `?${qs.join('&')}`;\n	}\n\n	return '';\n};";
},"useData":true};

var functionGetUrl = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getUrl = (config: OpenAPIConfig, options: ApiRequestOptions): string => {\n	const encoder = config.ENCODE_PATH || encodeURI;\n\n	const path = options.url\n		.replace('{api-version}', config.VERSION)\n		.replace(/{(.*?)}/g, (substring: string, group: string) => {\n			if (options.path?.hasOwnProperty(group)) {\n				return encoder(String(options.path[group]));\n			}\n			return substring;\n		});\n\n	const url = `${config.BASE}${path}`;\n	if (options.query) {\n		return `${url}${getQueryString(options.query)}`;\n	}\n	return url;\n};";
},"useData":true};

var functionIsBlob = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const isBlob = (value: any): value is Blob => {\n	return (\n		typeof value === 'object' &&\n		typeof value.type === 'string' &&\n		typeof value.stream === 'function' &&\n		typeof value.arrayBuffer === 'function' &&\n		typeof value.constructor === 'function' &&\n		typeof value.constructor.name === 'string' &&\n		/^(Blob|File)$/.test(value.constructor.name) &&\n		/^(Blob|File)$/.test(value[Symbol.toStringTag])\n	);\n};";
},"useData":true};

var functionIsDefined = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const isDefined = <T>(value: T | null | undefined): value is Exclude<T, null | undefined> => {\n	return value !== undefined && value !== null;\n};";
},"useData":true};

var functionIsFormData = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const isFormData = (value: any): value is FormData => {\n	return value instanceof FormData;\n};";
},"useData":true};

var functionIsString = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const isString = (value: any): value is string => {\n	return typeof value === 'string';\n};";
},"useData":true};

var functionIsStringWithValue = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const isStringWithValue = (value: any): value is string => {\n	return isString(value) && value !== '';\n};";
},"useData":true};

var functionIsSuccess = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const isSuccess = (status: number): boolean => {\n	return status >= 200 && status < 300;\n};";
},"useData":true};

var functionResolve = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;\n\nconst resolve = async <T>(options: ApiRequestOptions, resolver?: T | Resolver<T>): Promise<T | undefined> => {\n	if (typeof resolver === 'function') {\n		return (resolver as Resolver<T>)(options);\n	}\n	return resolver;\n};";
},"useData":true};

var templateCoreHttpRequest = {"1":function(container,depth0,helpers,partials,data) {
    return "import { Inject, Injectable } from '@angular/core';\nimport { HttpClient } from '@angular/common/http';\nimport type { Observable } from 'rxjs';\n\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport { BaseHttpRequest } from './BaseHttpRequest';\nimport type { OpenAPIConfig } from './OpenAPI';\nimport { OpenAPI } from './OpenAPI';\nimport { request as __request } from './request';\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "import type { ApiRequestOptions } from './ApiRequestOptions';\nimport { BaseHttpRequest } from './BaseHttpRequest';\nimport type { CancelablePromise } from './CancelablePromise';\nimport type { OpenAPIConfig } from './OpenAPI';\nimport { request as __request } from './request';\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "@Injectable()\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "	constructor(\n		@Inject(OpenAPI)\n		config: OpenAPIConfig,\n		http: HttpClient,\n	) {\n		super(config, http);\n	}\n";
},"9":function(container,depth0,helpers,partials,data) {
    return "	constructor(config: OpenAPIConfig) {\n		super(config);\n	}\n";
},"11":function(container,depth0,helpers,partials,data) {
    return "	/**\n	 * Request method\n	 * @param options The request options from the service\n	 * @returns Observable<T>\n	 * @throws ApiError\n	 */\n	public override request<T>(options: ApiRequestOptions): Observable<T> {\n		return __request(this.config, this.http, options);\n	}\n";
},"13":function(container,depth0,helpers,partials,data) {
    return "	/**\n	 * Request method\n	 * @param options The request options from the service\n	 * @returns CancelablePromise<T>\n	 * @throws ApiError\n	 */\n	public override request<T>(options: ApiRequestOptions): CancelablePromise<T> {\n		return __request(this.config, options);\n	}\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"angular",{"name":"equals","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":19,"column":11}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"angular",{"name":"equals","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":21,"column":0},"end":{"line":23,"column":11}}})) != null ? stack1 : "")
    + "export class "
    + ((stack1 = container.lambda(container.strict(depth0, "httpRequest", {"start":{"line":24,"column":15},"end":{"line":24,"column":26}} ), depth0)) != null ? stack1 : "")
    + " extends BaseHttpRequest {\n\n"
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"angular",{"name":"equals","hash":{},"fn":container.program(7, data, 0),"inverse":container.program(9, data, 0),"data":data,"loc":{"start":{"line":26,"column":1},"end":{"line":38,"column":12}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"angular",{"name":"equals","hash":{},"fn":container.program(11, data, 0),"inverse":container.program(13, data, 0),"data":data,"loc":{"start":{"line":40,"column":1},"end":{"line":60,"column":12}}})) != null ? stack1 : "")
    + "}";
},"usePartial":true,"useData":true};

var nodeGetHeaders = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getHeaders = async (config: OpenAPIConfig, options: ApiRequestOptions): Promise<Headers> => {\n	const token = await resolve(options, config.TOKEN);\n	const username = await resolve(options, config.USERNAME);\n	const password = await resolve(options, config.PASSWORD);\n	const additionalHeaders = await resolve(options, config.HEADERS);\n\n	const headers = Object.entries({\n		Accept: 'application/json',\n		...additionalHeaders,\n		...options.headers,\n	})\n		.filter(([_, value]) => isDefined(value))\n		.reduce((headers, [key, value]) => ({\n			...headers,\n			[key]: String(value),\n		}), {} as Record<string, string>);\n\n	if (isStringWithValue(token)) {\n		headers['Authorization'] = `Bearer ${token}`;\n	}\n\n	if (isStringWithValue(username) && isStringWithValue(password)) {\n		const credentials = base64(`${username}:${password}`);\n		headers['Authorization'] = `Basic ${credentials}`;\n	}\n\n	if (options.body) {\n		if (options.mediaType) {\n			headers['Content-Type'] = options.mediaType;\n		} else if (isBlob(options.body)) {\n			headers['Content-Type'] = 'application/octet-stream';\n		} else if (isString(options.body)) {\n			headers['Content-Type'] = 'text/plain';\n		} else if (!isFormData(options.body)) {\n			headers['Content-Type'] = 'application/json';\n		}\n	}\n\n	return new Headers(headers);\n};";
},"useData":true};

var nodeGetRequestBody = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getRequestBody = (options: ApiRequestOptions): any => {\n	if (options.body !== undefined) {\n		if (options.mediaType?.includes('/json')) {\n			return JSON.stringify(options.body)\n		} else if (isString(options.body) || isBlob(options.body) || isFormData(options.body)) {\n			return options.body as any;\n		} else {\n			return JSON.stringify(options.body);\n		}\n	}\n	return undefined;\n};";
},"useData":true};

var nodeGetResponseBody = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getResponseBody = async (response: Response): Promise<any> => {\n	if (response.status !== 204) {\n		try {\n			const contentType = response.headers.get('Content-Type');\n			if (contentType) {\n				const isJSON = contentType.toLowerCase().startsWith('application/json');\n				if (isJSON) {\n					return await response.json();\n				} else {\n					return await response.text();\n				}\n			}\n		} catch (error) {\n			console.error(error);\n		}\n	}\n	return undefined;\n};";
},"useData":true};

var nodeGetResponseHeader = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getResponseHeader = (response: Response, responseHeader?: string): string | undefined => {\n	if (responseHeader) {\n		const content = response.headers.get(responseHeader);\n		if (isString(content)) {\n			return content;\n		}\n	}\n	return undefined;\n};";
},"useData":true};

var nodeRequest = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport FormData from 'form-data';\nimport fetch, { Headers } from 'node-fetch';\nimport type { RequestInit, Response } from 'node-fetch';\nimport type { AbortSignal } from 'node-fetch/externals';\n\nimport { ApiError } from './ApiError';\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { ApiResult } from './ApiResult';\nimport { CancelablePromise } from './CancelablePromise';\nimport type { OnCancel } from './CancelablePromise';\nimport type { OpenAPIConfig } from './OpenAPI';\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isDefined"),depth0,{"name":"functions/isDefined","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isString"),depth0,{"name":"functions/isString","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isStringWithValue"),depth0,{"name":"functions/isStringWithValue","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isBlob"),depth0,{"name":"functions/isBlob","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isFormData"),depth0,{"name":"functions/isFormData","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/base64"),depth0,{"name":"functions/base64","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getQueryString"),depth0,{"name":"functions/getQueryString","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getUrl"),depth0,{"name":"functions/getUrl","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getFormData"),depth0,{"name":"functions/getFormData","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/resolve"),depth0,{"name":"functions/resolve","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"node/getHeaders"),depth0,{"name":"node/getHeaders","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"node/getRequestBody"),depth0,{"name":"node/getRequestBody","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"node/sendRequest"),depth0,{"name":"node/sendRequest","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"node/getResponseHeader"),depth0,{"name":"node/getResponseHeader","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"node/getResponseBody"),depth0,{"name":"node/getResponseBody","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/catchErrorCodes"),depth0,{"name":"functions/catchErrorCodes","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n/**\n * Request method\n * @param config The OpenAPI configuration object\n * @param options The request options from the service\n * @returns CancelablePromise<T>\n * @throws ApiError\n */\nexport const request = <T>(config: OpenAPIConfig, options: ApiRequestOptions): CancelablePromise<T> => {\n	return new CancelablePromise(async (resolve, reject, onCancel) => {\n		try {\n			const url = getUrl(config, options);\n			const formData = getFormData(options);\n			const body = getRequestBody(options);\n			const headers = await getHeaders(config, options);\n\n			if (!onCancel.isCancelled) {\n				const response = await sendRequest(options, url, body, formData, headers, onCancel);\n				const responseBody = await getResponseBody(response);\n				const responseHeader = getResponseHeader(response, options.responseHeader);\n\n				const result: ApiResult = {\n					url,\n					ok: response.ok,\n					status: response.status,\n					statusText: response.statusText,\n					body: responseHeader ?? responseBody,\n				};\n\n				catchErrorCodes(options, result);\n\n				resolve(result.body);\n			}\n		} catch (error) {\n			reject(error);\n		}\n	});\n};";
},"usePartial":true,"useData":true};

var nodeSendRequest = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "export const sendRequest = async (\n	options: ApiRequestOptions,\n	url: string,\n	body: any,\n	formData: FormData | undefined,\n	headers: Headers,\n	onCancel: OnCancel\n): Promise<Response> => {\n	const controller = new AbortController();\n\n	const request: RequestInit = {\n		headers,\n		method: options.method,\n		body: body ?? formData,\n		signal: controller.signal as AbortSignal,\n	};\n\n	onCancel(() => controller.abort());\n\n	return await fetch(url, request);\n};";
},"useData":true};

var templateCoreSettings = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport type { ApiRequestOptions } from './ApiRequestOptions';\n\ntype Resolver<T> = (options: ApiRequestOptions) => Promise<T>;\ntype Headers = Record<string, string>;\n\nexport type OpenAPIConfig = {\n	BASE: string;\n	VERSION: string;\n	WITH_CREDENTIALS: boolean;\n	CREDENTIALS: 'include' | 'omit' | 'same-origin';\n	TOKEN?: string | Resolver<string>;\n	USERNAME?: string | Resolver<string>;\n	PASSWORD?: string | Resolver<string>;\n	HEADERS?: Headers | Resolver<Headers>;\n	ENCODE_PATH?: (path: string) => string;\n};\n\nexport const OpenAPI: OpenAPIConfig = {\n	BASE: '"
    + ((stack1 = alias2(alias1(depth0, "server", {"start":{"line":21,"column":11},"end":{"line":21,"column":17}} ), depth0)) != null ? stack1 : "")
    + "',\n	VERSION: '"
    + ((stack1 = alias2(alias1(depth0, "version", {"start":{"line":22,"column":14},"end":{"line":22,"column":21}} ), depth0)) != null ? stack1 : "")
    + "',\n	WITH_CREDENTIALS: false,\n	CREDENTIALS: 'include',\n	TOKEN: undefined,\n	USERNAME: undefined,\n	PASSWORD: undefined,\n	HEADERS: undefined,\n	ENCODE_PATH: undefined,\n};";
},"usePartial":true,"useData":true};

var templateCoreRequest = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"fetch/request"),depth0,{"name":"fetch/request","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"xhr/request"),depth0,{"name":"xhr/request","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"axios/request"),depth0,{"name":"axios/request","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"angular/request"),depth0,{"name":"angular/request","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"node/request"),depth0,{"name":"node/request","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"fetch",{"name":"equals","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":67}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"xhr",{"name":"equals","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":2,"column":63}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"axios",{"name":"equals","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":3,"column":67}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"angular",{"name":"equals","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":4,"column":71}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"node",{"name":"equals","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":5,"column":65}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true};

var xhrGetHeaders = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getHeaders = async (config: OpenAPIConfig, options: ApiRequestOptions): Promise<Headers> => {\n	const token = await resolve(options, config.TOKEN);\n	const username = await resolve(options, config.USERNAME);\n	const password = await resolve(options, config.PASSWORD);\n	const additionalHeaders = await resolve(options, config.HEADERS);\n\n	const headers = Object.entries({\n		Accept: 'application/json',\n		...additionalHeaders,\n		...options.headers,\n	})\n		.filter(([_, value]) => isDefined(value))\n		.reduce((headers, [key, value]) => ({\n			...headers,\n			[key]: String(value),\n		}), {} as Record<string, string>);\n\n	if (isStringWithValue(token)) {\n		headers['Authorization'] = `Bearer ${token}`;\n	}\n\n	if (isStringWithValue(username) && isStringWithValue(password)) {\n		const credentials = base64(`${username}:${password}`);\n		headers['Authorization'] = `Basic ${credentials}`;\n	}\n\n	if (options.body) {\n		if (options.mediaType) {\n			headers['Content-Type'] = options.mediaType;\n		} else if (isBlob(options.body)) {\n			headers['Content-Type'] = options.body.type || 'application/octet-stream';\n		} else if (isString(options.body)) {\n			headers['Content-Type'] = 'text/plain';\n		} else if (!isFormData(options.body)) {\n			headers['Content-Type'] = 'application/json';\n		}\n	}\n\n	return new Headers(headers);\n};";
},"useData":true};

var xhrGetRequestBody = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getRequestBody = (options: ApiRequestOptions): any => {\n	if (options.body !== undefined) {\n		if (options.mediaType?.includes('/json')) {\n			return JSON.stringify(options.body)\n		} else if (isString(options.body) || isBlob(options.body) || isFormData(options.body)) {\n			return options.body;\n		} else {\n			return JSON.stringify(options.body);\n		}\n	}\n	return undefined;\n};";
},"useData":true};

var xhrGetResponseBody = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getResponseBody = (xhr: XMLHttpRequest): any => {\n	if (xhr.status !== 204) {\n		try {\n			const contentType = xhr.getResponseHeader('Content-Type');\n			if (contentType) {\n				const isJSON = contentType.toLowerCase().startsWith('application/json');\n				if (isJSON) {\n					return JSON.parse(xhr.responseText);\n				} else {\n					return xhr.responseText;\n				}\n			}\n		} catch (error) {\n			console.error(error);\n		}\n	}\n	return undefined;\n};";
},"useData":true};

var xhrGetResponseHeader = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "const getResponseHeader = (xhr: XMLHttpRequest, responseHeader?: string): string | undefined => {\n	if (responseHeader) {\n		const content = xhr.getResponseHeader(responseHeader);\n		if (isString(content)) {\n			return content;\n		}\n	}\n	return undefined;\n};";
},"useData":true};

var xhrRequest = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport { ApiError } from './ApiError';\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { ApiResult } from './ApiResult';\nimport { CancelablePromise } from './CancelablePromise';\nimport type { OnCancel } from './CancelablePromise';\nimport type { OpenAPIConfig } from './OpenAPI';\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isDefined"),depth0,{"name":"functions/isDefined","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isString"),depth0,{"name":"functions/isString","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isStringWithValue"),depth0,{"name":"functions/isStringWithValue","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isBlob"),depth0,{"name":"functions/isBlob","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isFormData"),depth0,{"name":"functions/isFormData","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isSuccess"),depth0,{"name":"functions/isSuccess","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/base64"),depth0,{"name":"functions/base64","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getQueryString"),depth0,{"name":"functions/getQueryString","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getUrl"),depth0,{"name":"functions/getUrl","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getFormData"),depth0,{"name":"functions/getFormData","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/resolve"),depth0,{"name":"functions/resolve","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"fetch/getHeaders"),depth0,{"name":"fetch/getHeaders","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"xhr/getRequestBody"),depth0,{"name":"xhr/getRequestBody","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"xhr/sendRequest"),depth0,{"name":"xhr/sendRequest","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"xhr/getResponseHeader"),depth0,{"name":"xhr/getResponseHeader","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"xhr/getResponseBody"),depth0,{"name":"xhr/getResponseBody","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/catchErrorCodes"),depth0,{"name":"functions/catchErrorCodes","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n/**\n * Request method\n * @param config The OpenAPI configuration object\n * @param options The request options from the service\n * @returns CancelablePromise<T>\n * @throws ApiError\n */\nexport const request = <T>(config: OpenAPIConfig, options: ApiRequestOptions): CancelablePromise<T> => {\n	return new CancelablePromise(async (resolve, reject, onCancel) => {\n		try {\n			const url = getUrl(config, options);\n			const formData = getFormData(options);\n			const body = getRequestBody(options);\n			const headers = await getHeaders(config, options);\n\n			if (!onCancel.isCancelled) {\n				const response = await sendRequest(config, options, url, body, formData, headers, onCancel);\n				const responseBody = getResponseBody(response);\n				const responseHeader = getResponseHeader(response, options.responseHeader);\n\n				const result: ApiResult = {\n					url,\n					ok: isSuccess(response.status),\n					status: response.status,\n					statusText: response.statusText,\n					body: responseHeader ?? responseBody,\n				};\n\n				catchErrorCodes(options, result);\n\n				resolve(result.body);\n			}\n		} catch (error) {\n			reject(error);\n		}\n	});\n};";
},"usePartial":true,"useData":true};

var xhrSendRequest = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "export const sendRequest = async (\n	config: OpenAPIConfig,\n	options: ApiRequestOptions,\n	url: string,\n	body: any,\n	formData: FormData | undefined,\n	headers: Headers,\n	onCancel: OnCancel\n): Promise<XMLHttpRequest> => {\n	const xhr = new XMLHttpRequest();\n	xhr.open(options.method, url, true);\n	xhr.withCredentials = config.WITH_CREDENTIALS;\n\n	headers.forEach((value, key) => {\n		xhr.setRequestHeader(key, value);\n	});\n\n	return new Promise<XMLHttpRequest>((resolve, reject) => {\n		xhr.onload = () => resolve(xhr);\n		xhr.onabort = () => reject(new Error('Request aborted'));\n		xhr.onerror = () => reject(new Error('Network error'));\n		xhr.send(body ?? formData);\n\n		onCancel(() => xhr.abort());\n	});\n};";
},"useData":true};

var templateExportModel = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"imports"),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":7,"column":9}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda;

  return "import type { "
    + ((stack1 = alias1(depth0, depth0)) != null ? stack1 : "")
    + " } from './"
    + ((stack1 = alias1(depth0, depth0)) != null ? stack1 : "")
    + "';\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"exportInterface"),depth0,{"name":"exportInterface","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"one-of",{"name":"equals","hash":{},"fn":container.program(7, data, 0),"inverse":container.program(9, data, 0),"data":data,"loc":{"start":{"line":12,"column":0},"end":{"line":26,"column":0}}})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"exportComposition"),depth0,{"name":"exportComposition","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"any-of",{"name":"equals","hash":{},"fn":container.program(7, data, 0),"inverse":container.program(10, data, 0),"data":data,"loc":{"start":{"line":14,"column":0},"end":{"line":26,"column":0}}})) != null ? stack1 : "");
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"all-of",{"name":"equals","hash":{},"fn":container.program(7, data, 0),"inverse":container.program(11, data, 0),"data":data,"loc":{"start":{"line":16,"column":0},"end":{"line":26,"column":0}}})) != null ? stack1 : "");
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"enum",{"name":"equals","hash":{},"fn":container.program(12, data, 0),"inverse":container.program(13, data, 0),"data":data,"loc":{"start":{"line":18,"column":0},"end":{"line":26,"column":0}}})) != null ? stack1 : "");
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"useUnionTypes"),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(15, data, 0),"data":data,"loc":{"start":{"line":19,"column":0},"end":{"line":23,"column":7}}})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"exportType"),depth0,{"name":"exportType","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"15":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"exportEnum"),depth0,{"name":"exportEnum","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"imports"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":8,"column":7}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(depth0,"export"),"interface",{"name":"equals","hash":{},"fn":container.program(4, data, 0),"inverse":container.program(6, data, 0),"data":data,"loc":{"start":{"line":10,"column":0},"end":{"line":26,"column":11}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true};

var templateExportSchema = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nexport const $"
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":3,"column":17},"end":{"line":3,"column":21}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"schema"),depth0,{"name":"schema","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + " as const;";
},"usePartial":true,"useData":true};

var templateExportService = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"exportClient"),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(4, data, 0),"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":11,"column":7}}})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "import { Injectable } from '@angular/core';\nimport type { Observable } from 'rxjs';\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "import { Injectable } from '@angular/core';\nimport { HttpClient } from '@angular/common/http';\nimport type { Observable } from 'rxjs';\n";
},"6":function(container,depth0,helpers,partials,data) {
    return "import type { AxiosRequestConfig } from 'axios';\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"imports"),{"name":"each","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":20,"column":0},"end":{"line":22,"column":9}}})) != null ? stack1 : "")
    + "\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda;

  return "import type { "
    + ((stack1 = alias1(depth0, depth0)) != null ? stack1 : "")
    + " } from '../models/"
    + ((stack1 = alias1(depth0, depth0)) != null ? stack1 : "")
    + "';\n";
},"11":function(container,depth0,helpers,partials,data) {
    return "import type { CancelablePromise } from '../core/CancelablePromise';\n";
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"httpClient"),"angular",{"name":"equals","hash":{},"fn":container.program(14, data, 0),"inverse":container.program(16, data, 0),"data":data,"loc":{"start":{"line":29,"column":0},"end":{"line":33,"column":11}}})) != null ? stack1 : "");
},"14":function(container,depth0,helpers,partials,data) {
    return "import { BaseHttpRequest } from '../core/BaseHttpRequest';\n";
},"16":function(container,depth0,helpers,partials,data) {
    return "import type { BaseHttpRequest } from '../core/BaseHttpRequest';\n";
},"18":function(container,depth0,helpers,partials,data) {
    return "import { OpenAPI } from '../core/OpenAPI';\nimport { request as __request } from '../core/request';\n";
},"20":function(container,depth0,helpers,partials,data) {
    return "@Injectable()\n";
},"22":function(container,depth0,helpers,partials,data) {
    return "\n	constructor(public readonly httpRequest: BaseHttpRequest) {}\n";
},"24":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"httpClient"),"angular",{"name":"equals","hash":{},"fn":container.program(25, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":47,"column":1},"end":{"line":50,"column":12}}})) != null ? stack1 : "");
},"25":function(container,depth0,helpers,partials,data) {
    return "\n	constructor(public readonly http: HttpClient) {}\n";
},"27":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.strict, alias3=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	/**\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"deprecated"),{"name":"if","hash":{},"fn":container.program(28, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":55,"column":1},"end":{"line":57,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"summary"),{"name":"if","hash":{},"fn":container.program(30, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":58,"column":1},"end":{"line":60,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(32, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":61,"column":1},"end":{"line":63,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,lookupProperty(lookupProperty(data,"root"),"useOptions"),{"name":"unless","hash":{},"fn":container.program(34, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":64,"column":1},"end":{"line":70,"column":12}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"results"),{"name":"each","hash":{},"fn":container.program(39, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":71,"column":1},"end":{"line":73,"column":10}}})) != null ? stack1 : "")
    + "	 * @throws ApiError\n	 */\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"exportClient"),{"name":"if","hash":{},"fn":container.program(41, data, 0),"inverse":container.program(46, data, 0),"data":data,"loc":{"start":{"line":76,"column":1},"end":{"line":97,"column":8}}})) != null ? stack1 : "")
    + "			method: '"
    + ((stack1 = alias3(alias2(depth0, "method", {"start":{"line":98,"column":15},"end":{"line":98,"column":21}} ), depth0)) != null ? stack1 : "")
    + "',\n			url: '"
    + ((stack1 = alias3(alias2(depth0, "path", {"start":{"line":99,"column":12},"end":{"line":99,"column":16}} ), depth0)) != null ? stack1 : "")
    + "',\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"parametersPath"),{"name":"if","hash":{},"fn":container.program(54, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":100,"column":3},"end":{"line":106,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"parametersCookie"),{"name":"if","hash":{},"fn":container.program(57, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":107,"column":3},"end":{"line":113,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"parametersHeader"),{"name":"if","hash":{},"fn":container.program(59, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":114,"column":3},"end":{"line":120,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"parametersQuery"),{"name":"if","hash":{},"fn":container.program(61, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":121,"column":3},"end":{"line":127,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"parametersForm"),{"name":"if","hash":{},"fn":container.program(63, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":128,"column":3},"end":{"line":134,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"parametersBody"),{"name":"if","hash":{},"fn":container.program(65, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":135,"column":3},"end":{"line":145,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"responseHeader"),{"name":"if","hash":{},"fn":container.program(72, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":146,"column":3},"end":{"line":148,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"errors"),{"name":"if","hash":{},"fn":container.program(74, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":149,"column":3},"end":{"line":155,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"axios",{"name":"equals","hash":{},"fn":container.program(77, data, 0),"inverse":container.program(79, data, 0),"data":data,"loc":{"start":{"line":156,"column":2},"end":{"line":160,"column":13}}})) != null ? stack1 : "")
    + "	}\n\n";
},"28":function(container,depth0,helpers,partials,data) {
    return "	 * @deprecated\n";
},"30":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	 * "
    + ((stack1 = lookupProperty(helpers,"escapeComment").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"summary"),{"name":"escapeComment","hash":{},"data":data,"loc":{"start":{"line":59,"column":4},"end":{"line":59,"column":31}}})) != null ? stack1 : "")
    + "\n";
},"32":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	 * "
    + ((stack1 = lookupProperty(helpers,"escapeComment").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"escapeComment","hash":{},"data":data,"loc":{"start":{"line":62,"column":4},"end":{"line":62,"column":35}}})) != null ? stack1 : "")
    + "\n";
},"34":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parameters"),{"name":"if","hash":{},"fn":container.program(35, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":65,"column":1},"end":{"line":69,"column":8}}})) != null ? stack1 : "");
},"35":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parameters"),{"name":"each","hash":{},"fn":container.program(36, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":66,"column":1},"end":{"line":68,"column":10}}})) != null ? stack1 : "");
},"36":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	 * @param "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":67,"column":14},"end":{"line":67,"column":18}} ), depth0)) != null ? stack1 : "")
    + " "
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(37, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":67,"column":22},"end":{"line":67,"column":79}}})) != null ? stack1 : "")
    + "\n";
},"37":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"escapeComment").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"escapeComment","hash":{},"data":data,"loc":{"start":{"line":67,"column":41},"end":{"line":67,"column":72}}})) != null ? stack1 : "");
},"39":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	 * @returns "
    + ((stack1 = container.lambda(container.strict(depth0, "type", {"start":{"line":72,"column":16},"end":{"line":72,"column":20}} ), depth0)) != null ? stack1 : "")
    + " "
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(37, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":72,"column":24},"end":{"line":72,"column":81}}})) != null ? stack1 : "")
    + "\n";
},"41":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"httpClient"),"angular",{"name":"equals","hash":{},"fn":container.program(42, data, 0),"inverse":container.program(44, data, 0),"data":data,"loc":{"start":{"line":77,"column":1},"end":{"line":83,"column":12}}})) != null ? stack1 : "");
},"42":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	public "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":78,"column":11},"end":{"line":78,"column":15}} ), depth0)) != null ? stack1 : "")
    + "("
    + ((stack1 = container.invokePartial(lookupProperty(partials,"parameters"),depth0,{"name":"parameters","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "): Observable<"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"result"),depth0,{"name":"result","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "> {\n		return this.httpRequest.request({\n";
},"44":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	public "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":81,"column":11},"end":{"line":81,"column":15}} ), depth0)) != null ? stack1 : "")
    + "("
    + ((stack1 = container.invokePartial(lookupProperty(partials,"parameters"),depth0,{"name":"parameters","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "): CancelablePromise<"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"result"),depth0,{"name":"result","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "> {\n		return this.httpRequest.request({\n";
},"46":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"httpClient"),"angular",{"name":"equals","hash":{},"fn":container.program(47, data, 0),"inverse":container.program(49, data, 0),"data":data,"loc":{"start":{"line":85,"column":1},"end":{"line":96,"column":12}}})) != null ? stack1 : "");
},"47":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	public "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":86,"column":11},"end":{"line":86,"column":15}} ), depth0)) != null ? stack1 : "")
    + "("
    + ((stack1 = container.invokePartial(lookupProperty(partials,"parameters"),depth0,{"name":"parameters","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "): Observable<"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"result"),depth0,{"name":"result","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "> {\n		return __request(OpenAPI, this.http, {\n";
},"49":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"httpClient"),"axios",{"name":"equals","hash":{},"fn":container.program(50, data, 0),"inverse":container.program(52, data, 0),"data":data,"loc":{"start":{"line":89,"column":1},"end":{"line":95,"column":12}}})) != null ? stack1 : "");
},"50":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	public static "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":90,"column":18},"end":{"line":90,"column":22}} ), depth0)) != null ? stack1 : "")
    + "("
    + ((stack1 = container.invokePartial(lookupProperty(partials,"parameters"),depth0,{"name":"parameters","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ", additionalOptions: AxiosRequestConfig): CancelablePromise<"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"result"),depth0,{"name":"result","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "> {\n		return __request(OpenAPI, {\n";
},"52":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	public static "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":93,"column":18},"end":{"line":93,"column":22}} ), depth0)) != null ? stack1 : "")
    + "("
    + ((stack1 = container.invokePartial(lookupProperty(partials,"parameters"),depth0,{"name":"parameters","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "): CancelablePromise<"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"result"),depth0,{"name":"result","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "> {\n		return __request(OpenAPI, {\n";
},"54":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "			path: {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parametersPath"),{"name":"each","hash":{},"fn":container.program(55, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":102,"column":4},"end":{"line":104,"column":13}}})) != null ? stack1 : "")
    + "			},\n";
},"55":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "				'"
    + ((stack1 = alias2(alias1(depth0, "prop", {"start":{"line":103,"column":8},"end":{"line":103,"column":12}} ), depth0)) != null ? stack1 : "")
    + "': "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":103,"column":21},"end":{"line":103,"column":25}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"57":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "			cookies: {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parametersCookie"),{"name":"each","hash":{},"fn":container.program(55, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":109,"column":4},"end":{"line":111,"column":13}}})) != null ? stack1 : "")
    + "			},\n";
},"59":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "			headers: {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parametersHeader"),{"name":"each","hash":{},"fn":container.program(55, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":116,"column":4},"end":{"line":118,"column":13}}})) != null ? stack1 : "")
    + "			},\n";
},"61":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "			query: {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parametersQuery"),{"name":"each","hash":{},"fn":container.program(55, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":123,"column":4},"end":{"line":125,"column":13}}})) != null ? stack1 : "")
    + "			},\n";
},"63":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "			formData: {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parametersForm"),{"name":"each","hash":{},"fn":container.program(55, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":130,"column":4},"end":{"line":132,"column":13}}})) != null ? stack1 : "")
    + "			},\n";
},"65":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(depth0,"parametersBody"),"in"),"formData",{"name":"equals","hash":{},"fn":container.program(66, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":136,"column":3},"end":{"line":138,"column":14}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(depth0,"parametersBody"),"in"),"body",{"name":"equals","hash":{},"fn":container.program(68, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":139,"column":3},"end":{"line":141,"column":14}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(depth0,"parametersBody"),"mediaType"),{"name":"if","hash":{},"fn":container.program(70, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":142,"column":3},"end":{"line":144,"column":10}}})) != null ? stack1 : "");
},"66":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "			formData: "
    + ((stack1 = container.lambda(container.strict(lookupProperty(depth0,"parametersBody"), "name", {"start":{"line":137,"column":16},"end":{"line":137,"column":35}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"68":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "			body: "
    + ((stack1 = container.lambda(container.strict(lookupProperty(depth0,"parametersBody"), "name", {"start":{"line":140,"column":12},"end":{"line":140,"column":31}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"70":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "			mediaType: '"
    + ((stack1 = container.lambda(container.strict(lookupProperty(depth0,"parametersBody"), "mediaType", {"start":{"line":143,"column":18},"end":{"line":143,"column":42}} ), depth0)) != null ? stack1 : "")
    + "',\n";
},"72":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "			responseHeader: '"
    + ((stack1 = container.lambda(container.strict(depth0, "responseHeader", {"start":{"line":147,"column":23},"end":{"line":147,"column":37}} ), depth0)) != null ? stack1 : "")
    + "',\n";
},"74":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "			errors: {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"errors"),{"name":"each","hash":{},"fn":container.program(75, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":151,"column":4},"end":{"line":153,"column":13}}})) != null ? stack1 : "")
    + "			},\n";
},"75":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "				"
    + ((stack1 = container.lambda(container.strict(depth0, "code", {"start":{"line":152,"column":7},"end":{"line":152,"column":11}} ), depth0)) != null ? stack1 : "")
    + ": `"
    + ((stack1 = lookupProperty(helpers,"escapeDescription").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"escapeDescription","hash":{},"data":data,"loc":{"start":{"line":152,"column":17},"end":{"line":152,"column":52}}})) != null ? stack1 : "")
    + "`,\n";
},"77":function(container,depth0,helpers,partials,data) {
    return "		}, additionalOptions);\n";
},"79":function(container,depth0,helpers,partials,data) {
    return "		});\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.strict, alias3=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"angular",{"name":"equals","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":13,"column":11}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"axios",{"name":"equals","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":0},"end":{"line":17,"column":11}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"imports"),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":19,"column":0},"end":{"line":24,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"notEquals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"angular",{"name":"notEquals","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":25,"column":0},"end":{"line":27,"column":14}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"exportClient"),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(18, data, 0),"data":data,"loc":{"start":{"line":28,"column":0},"end":{"line":37,"column":7}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"angular",{"name":"equals","hash":{},"fn":container.program(20, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":39,"column":0},"end":{"line":41,"column":11}}})) != null ? stack1 : "")
    + "export class "
    + ((stack1 = alias3(alias2(depth0, "name", {"start":{"line":42,"column":16},"end":{"line":42,"column":20}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "postfix", {"start":{"line":42,"column":26},"end":{"line":42,"column":39}} ), depth0)) != null ? stack1 : "")
    + " {\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"exportClient"),{"name":"if","hash":{},"fn":container.program(22, data, 0),"inverse":container.program(24, data, 0),"data":data,"loc":{"start":{"line":43,"column":1},"end":{"line":51,"column":8}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"operations"),{"name":"each","hash":{},"fn":container.program(27, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":53,"column":1},"end":{"line":163,"column":10}}})) != null ? stack1 : "")
    + "}";
},"usePartial":true,"useData":true};

var templateIndex = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "export { "
    + ((stack1 = alias2(alias1(depth0, "clientName", {"start":{"line":4,"column":12},"end":{"line":4,"column":22}} ), depth0)) != null ? stack1 : "")
    + " } from './"
    + ((stack1 = alias2(alias1(depth0, "clientName", {"start":{"line":4,"column":39},"end":{"line":4,"column":49}} ), depth0)) != null ? stack1 : "")
    + "';\n\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "export { ApiError } from './core/ApiError';\n"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"exportClient"),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":9,"column":0},"end":{"line":11,"column":7}}})) != null ? stack1 : "")
    + "export { CancelablePromise, CancelError } from './core/CancelablePromise';\nexport { OpenAPI } from './core/OpenAPI';\nexport type { OpenAPIConfig } from './core/OpenAPI';\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "export { BaseHttpRequest } from './core/BaseHttpRequest';\n";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"models"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":17,"column":0},"end":{"line":30,"column":7}}})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"models"),{"name":"each","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":19,"column":0},"end":{"line":29,"column":9}}})) != null ? stack1 : "");
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"useUnionTypes"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.program(11, data, 0),"data":data,"loc":{"start":{"line":20,"column":0},"end":{"line":28,"column":7}}})) != null ? stack1 : "");
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "export type { "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":21,"column":17},"end":{"line":21,"column":21}} ), depth0)) != null ? stack1 : "")
    + " } from './models/"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":21,"column":45},"end":{"line":21,"column":49}} ), depth0)) != null ? stack1 : "")
    + "';\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"enum"),{"name":"if","hash":{},"fn":container.program(12, data, 0),"inverse":container.program(14, data, 0),"data":data,"loc":{"start":{"line":22,"column":0},"end":{"line":28,"column":0}}})) != null ? stack1 : "");
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "export { "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":23,"column":12},"end":{"line":23,"column":16}} ), depth0)) != null ? stack1 : "")
    + " } from './models/"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":23,"column":40},"end":{"line":23,"column":44}} ), depth0)) != null ? stack1 : "")
    + "';\n";
},"14":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"enums"),{"name":"if","hash":{},"fn":container.program(12, data, 0),"inverse":container.program(9, data, 0),"data":data,"loc":{"start":{"line":24,"column":0},"end":{"line":28,"column":0}}})) != null ? stack1 : "");
},"16":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"models"),{"name":"if","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":33,"column":0},"end":{"line":38,"column":7}}})) != null ? stack1 : "");
},"17":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"models"),{"name":"each","hash":{},"fn":container.program(18, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":35,"column":0},"end":{"line":37,"column":9}}})) != null ? stack1 : "");
},"18":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "export { $"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":36,"column":13},"end":{"line":36,"column":17}} ), depth0)) != null ? stack1 : "")
    + " } from './schemas/$"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":36,"column":43},"end":{"line":36,"column":47}} ), depth0)) != null ? stack1 : "")
    + "';\n";
},"20":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"services"),{"name":"if","hash":{},"fn":container.program(21, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":41,"column":0},"end":{"line":46,"column":7}}})) != null ? stack1 : "");
},"21":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"services"),{"name":"each","hash":{},"fn":container.program(22, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":43,"column":0},"end":{"line":45,"column":9}}})) != null ? stack1 : "");
},"22":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "export { "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":44,"column":12},"end":{"line":44,"column":16}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "postfix", {"start":{"line":44,"column":22},"end":{"line":44,"column":35}} ), depth0)) != null ? stack1 : "")
    + " } from './services/"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":44,"column":61},"end":{"line":44,"column":65}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "postfix", {"start":{"line":44,"column":71},"end":{"line":44,"column":84}} ), depth0)) != null ? stack1 : "")
    + "';\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"exportClient"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":6,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"exportCore"),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":0},"end":{"line":15,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"exportModels"),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":16,"column":0},"end":{"line":31,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"exportSchemas"),{"name":"if","hash":{},"fn":container.program(16, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":32,"column":0},"end":{"line":39,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"exportServices"),{"name":"if","hash":{},"fn":container.program(20, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":40,"column":0},"end":{"line":47,"column":7}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true};

var partialBase = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"fetch",{"name":"equals","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":2,"column":53}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"xhr",{"name":"equals","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":3,"column":51}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"axios",{"name":"equals","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":4,"column":53}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"angular",{"name":"equals","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":5,"column":55}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"node",{"name":"equals","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":0},"end":{"line":6,"column":52}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    return "Blob";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.lambda(container.strict(depth0, "base", {"start":{"line":8,"column":3},"end":{"line":8,"column":7}} ), depth0)) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"binary",{"name":"equals","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(4, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":9,"column":13}}})) != null ? stack1 : "");
},"useData":true};

var partialExportComposition = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "/**\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":5,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"deprecated"),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":0},"end":{"line":8,"column":7}}})) != null ? stack1 : "")
    + " */\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return " * "
    + ((stack1 = lookupProperty(helpers,"escapeComment").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"escapeComment","hash":{},"data":data,"loc":{"start":{"line":4,"column":3},"end":{"line":4,"column":34}}})) != null ? stack1 : "")
    + "\n";
},"4":function(container,depth0,helpers,partials,data) {
    return " * @deprecated\n";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"useUnionTypes"),{"name":"unless","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":0},"end":{"line":37,"column":11}}})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\nexport namespace "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":15,"column":20},"end":{"line":15,"column":24}} ), depth0)) != null ? stack1 : "")
    + " {\n\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"enums"),{"name":"each","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":17,"column":1},"end":{"line":34,"column":10}}})) != null ? stack1 : "")
    + "\n}\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"ifdef").call(alias1,lookupProperty(depth0,"description"),lookupProperty(depth0,"deprecated"),{"name":"ifdef","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":18,"column":1},"end":{"line":27,"column":11}}})) != null ? stack1 : "")
    + "	export enum "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":28,"column":16},"end":{"line":28,"column":20}} ), depth0)) != null ? stack1 : "")
    + " {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"enum"),{"name":"each","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":29,"column":2},"end":{"line":31,"column":11}}})) != null ? stack1 : "")
    + "	}\n\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	/**\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":20,"column":1},"end":{"line":22,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"deprecated"),{"name":"if","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":23,"column":1},"end":{"line":25,"column":8}}})) != null ? stack1 : "")
    + "	 */\n";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	 * "
    + ((stack1 = lookupProperty(helpers,"escapeComment").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"escapeComment","hash":{},"data":data,"loc":{"start":{"line":21,"column":4},"end":{"line":21,"column":35}}})) != null ? stack1 : "")
    + "\n";
},"12":function(container,depth0,helpers,partials,data) {
    return "	 * @deprecated\n";
},"14":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "		"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":30,"column":5},"end":{"line":30,"column":9}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = alias2(alias1(depth0, "value", {"start":{"line":30,"column":18},"end":{"line":30,"column":23}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"ifdef").call(alias1,lookupProperty(depth0,"description"),lookupProperty(depth0,"deprecated"),{"name":"ifdef","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":10,"column":10}}})) != null ? stack1 : "")
    + "export type "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":11,"column":15},"end":{"line":11,"column":19}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"type"),depth0,{"name":"type","hash":{"parent":lookupProperty(depth0,"name")},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ";\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"enums"),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":0},"end":{"line":38,"column":7}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true};

var partialExportEnum = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "/**\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":5,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"deprecated"),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":0},"end":{"line":8,"column":7}}})) != null ? stack1 : "")
    + " */\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return " * "
    + ((stack1 = lookupProperty(helpers,"escapeComment").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"escapeComment","hash":{},"data":data,"loc":{"start":{"line":4,"column":3},"end":{"line":4,"column":34}}})) != null ? stack1 : "")
    + "\n";
},"4":function(container,depth0,helpers,partials,data) {
    return " * @deprecated\n";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":1},"end":{"line":17,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"containsSpaces").call(alias1,lookupProperty(depth0,"name"),{"name":"containsSpaces","hash":{},"fn":container.program(9, data, 0),"inverse":container.program(11, data, 0),"data":data,"loc":{"start":{"line":18,"column":1},"end":{"line":22,"column":20}}})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	/**\n	 * "
    + ((stack1 = lookupProperty(helpers,"escapeComment").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"escapeComment","hash":{},"data":data,"loc":{"start":{"line":15,"column":4},"end":{"line":15,"column":35}}})) != null ? stack1 : "")
    + "\n	 */\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "	'"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":19,"column":5},"end":{"line":19,"column":9}} ), depth0)) != null ? stack1 : "")
    + "' = "
    + ((stack1 = alias2(alias1(depth0, "value", {"start":{"line":19,"column":19},"end":{"line":19,"column":24}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "	"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":21,"column":4},"end":{"line":21,"column":8}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = alias2(alias1(depth0, "value", {"start":{"line":21,"column":17},"end":{"line":21,"column":22}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"ifdef").call(alias1,lookupProperty(depth0,"description"),lookupProperty(depth0,"deprecated"),{"name":"ifdef","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":10,"column":10}}})) != null ? stack1 : "")
    + "export enum "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":11,"column":15},"end":{"line":11,"column":19}} ), depth0)) != null ? stack1 : "")
    + " {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"enum"),{"name":"each","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":1},"end":{"line":23,"column":10}}})) != null ? stack1 : "")
    + "}";
},"useData":true};

var partialExportInterface = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "/**\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":5,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"deprecated"),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":0},"end":{"line":8,"column":7}}})) != null ? stack1 : "")
    + " */\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return " * "
    + ((stack1 = lookupProperty(helpers,"escapeComment").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"escapeComment","hash":{},"data":data,"loc":{"start":{"line":4,"column":3},"end":{"line":4,"column":34}}})) != null ? stack1 : "")
    + "\n";
},"4":function(container,depth0,helpers,partials,data) {
    return " * @deprecated\n";
},"6":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"ifdef").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),lookupProperty(depth0,"deprecated"),{"name":"ifdef","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":1},"end":{"line":22,"column":11}}})) != null ? stack1 : "")
    + "	"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isReadOnly"),depth0,{"name":"isReadOnly","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":23,"column":19},"end":{"line":23,"column":23}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isRequired"),depth0,{"name":"isRequired","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ": "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"type"),depth0,{"name":"type","hash":{"parent":lookupProperty(depths[1],"name")},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ";\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	/**\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":1},"end":{"line":17,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"deprecated"),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":18,"column":1},"end":{"line":20,"column":8}}})) != null ? stack1 : "")
    + "	 */\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	 * "
    + ((stack1 = lookupProperty(helpers,"escapeComment").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"escapeComment","hash":{},"data":data,"loc":{"start":{"line":16,"column":4},"end":{"line":16,"column":35}}})) != null ? stack1 : "")
    + "\n";
},"10":function(container,depth0,helpers,partials,data) {
    return "	 * @deprecated\n";
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"useUnionTypes"),{"name":"unless","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":27,"column":0},"end":{"line":46,"column":11}}})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\nexport namespace "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":29,"column":20},"end":{"line":29,"column":24}} ), depth0)) != null ? stack1 : "")
    + " {\n\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"enums"),{"name":"each","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":31,"column":1},"end":{"line":43,"column":10}}})) != null ? stack1 : "")
    + "\n}\n";
},"14":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":32,"column":1},"end":{"line":36,"column":8}}})) != null ? stack1 : "")
    + "	export enum "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":37,"column":16},"end":{"line":37,"column":20}} ), depth0)) != null ? stack1 : "")
    + " {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"enum"),{"name":"each","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":38,"column":2},"end":{"line":40,"column":11}}})) != null ? stack1 : "")
    + "	}\n\n";
},"15":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	/**\n	 * "
    + ((stack1 = lookupProperty(helpers,"escapeComment").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"escapeComment","hash":{},"data":data,"loc":{"start":{"line":34,"column":4},"end":{"line":34,"column":35}}})) != null ? stack1 : "")
    + "\n	 */\n";
},"17":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "		"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":39,"column":5},"end":{"line":39,"column":9}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = alias2(alias1(depth0, "value", {"start":{"line":39,"column":18},"end":{"line":39,"column":23}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"ifdef").call(alias1,lookupProperty(depth0,"description"),lookupProperty(depth0,"deprecated"),{"name":"ifdef","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":10,"column":10}}})) != null ? stack1 : "")
    + "export type "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":11,"column":15},"end":{"line":11,"column":19}} ), depth0)) != null ? stack1 : "")
    + " = {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":1},"end":{"line":24,"column":10}}})) != null ? stack1 : "")
    + "};\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"enums"),{"name":"if","hash":{},"fn":container.program(12, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":26,"column":0},"end":{"line":47,"column":7}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true,"useDepths":true};

var partialExportType = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "/**\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":5,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"deprecated"),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":0},"end":{"line":8,"column":7}}})) != null ? stack1 : "")
    + " */\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return " * "
    + ((stack1 = lookupProperty(helpers,"escapeComment").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"escapeComment","hash":{},"data":data,"loc":{"start":{"line":4,"column":3},"end":{"line":4,"column":34}}})) != null ? stack1 : "")
    + "\n";
},"4":function(container,depth0,helpers,partials,data) {
    return " * @deprecated\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"ifdef").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),lookupProperty(depth0,"deprecated"),{"name":"ifdef","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":10,"column":10}}})) != null ? stack1 : "")
    + "export type "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":11,"column":15},"end":{"line":11,"column":19}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"type"),depth0,{"name":"type","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ";";
},"usePartial":true,"useData":true};

var partialHeader = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "/* istanbul ignore file */\n/* tslint:disable */\n/* eslint-disable */";
},"useData":true};

var partialIsNullable = {"1":function(container,depth0,helpers,partials,data) {
    return " | null";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":32}}})) != null ? stack1 : "");
},"useData":true};

var partialIsReadOnly = {"1":function(container,depth0,helpers,partials,data) {
    return "readonly ";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"isReadOnly"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":34}}})) != null ? stack1 : "");
},"useData":true};

var partialIsRequired = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"isRequired"),{"name":"unless","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(4, data, 0),"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":2,"column":54}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    return "?";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"default"),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":23},"end":{"line":2,"column":43}}})) != null ? stack1 : "");
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"isRequired"),{"name":"unless","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":4,"column":64}}})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"default"),{"name":"unless","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":22},"end":{"line":4,"column":53}}})) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"useOptions"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(6, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":5,"column":9}}})) != null ? stack1 : "");
},"useData":true};

var partialParameters = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"useOptions"),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(12, data, 0),"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":27,"column":7}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"parameters"),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":6,"column":9}}})) != null ? stack1 : "")
    + "}: {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"parameters"),{"name":"each","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":0},"end":{"line":20,"column":9}}})) != null ? stack1 : "")
    + "}";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":5,"column":3},"end":{"line":5,"column":7}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"default"),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":10},"end":{"line":5,"column":48}}})) != null ? stack1 : "")
    + ",\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " = "
    + ((stack1 = container.lambda(container.strict(depth0, "default", {"start":{"line":5,"column":31},"end":{"line":5,"column":38}} ), depth0)) != null ? stack1 : "");
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"ifdef").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),lookupProperty(depth0,"deprecated"),{"name":"ifdef","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":9,"column":0},"end":{"line":18,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":19,"column":3},"end":{"line":19,"column":7}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isRequired"),depth0,{"name":"isRequired","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ": "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"type"),depth0,{"name":"type","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ",\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "/**\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":11,"column":0},"end":{"line":13,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"deprecated"),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":0},"end":{"line":16,"column":7}}})) != null ? stack1 : "")
    + " */\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return " * "
    + ((stack1 = lookupProperty(helpers,"escapeComment").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"escapeComment","hash":{},"data":data,"loc":{"start":{"line":12,"column":3},"end":{"line":12,"column":34}}})) != null ? stack1 : "")
    + "\n";
},"10":function(container,depth0,helpers,partials,data) {
    return " * @deprecated\n";
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parameters"),{"name":"each","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":24,"column":0},"end":{"line":26,"column":9}}})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":25,"column":3},"end":{"line":25,"column":7}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isRequired"),depth0,{"name":"isRequired","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ": "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"type"),depth0,{"name":"type","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"default"),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":25,"column":36},"end":{"line":25,"column":74}}})) != null ? stack1 : "")
    + ",\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parameters"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":28,"column":7}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true};

var partialResult = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"results"),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":2,"column":66}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"type"),depth0,{"name":"type","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(data,"last"),{"name":"unless","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":26},"end":{"line":2,"column":57}}})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    return " | ";
},"5":function(container,depth0,helpers,partials,data) {
    return "void";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"results"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(5, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":5,"column":9}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true};

var partialSchema = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"schemaInterface"),depth0,{"name":"schemaInterface","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"enum",{"name":"equals","hash":{},"fn":container.program(4, data, 0),"inverse":container.program(6, data, 0),"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":17,"column":0}}})) != null ? stack1 : "");
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"schemaEnum"),depth0,{"name":"schemaEnum","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"array",{"name":"equals","hash":{},"fn":container.program(7, data, 0),"inverse":container.program(9, data, 0),"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":17,"column":0}}})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"schemaArray"),depth0,{"name":"schemaArray","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"dictionary",{"name":"equals","hash":{},"fn":container.program(10, data, 0),"inverse":container.program(12, data, 0),"data":data,"loc":{"start":{"line":7,"column":0},"end":{"line":17,"column":0}}})) != null ? stack1 : "");
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"schemaDictionary"),depth0,{"name":"schemaDictionary","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"any-of",{"name":"equals","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(15, data, 0),"data":data,"loc":{"start":{"line":9,"column":0},"end":{"line":17,"column":0}}})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"schemaComposition"),depth0,{"name":"schemaComposition","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"15":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"all-of",{"name":"equals","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(16, data, 0),"data":data,"loc":{"start":{"line":11,"column":0},"end":{"line":17,"column":0}}})) != null ? stack1 : "");
},"16":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"one-of",{"name":"equals","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(17, data, 0),"data":data,"loc":{"start":{"line":13,"column":0},"end":{"line":17,"column":0}}})) != null ? stack1 : "");
},"17":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"schemaGeneric"),depth0,{"name":"schemaGeneric","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"interface",{"name":"equals","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":17,"column":11}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true};

var partialSchemaArray = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	contains: "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"schema"),lookupProperty(depth0,"link"),{"name":"schema","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ",\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	contains: {\n		type: '"
    + ((stack1 = container.lambda(container.strict(depth0, "base", {"start":{"line":7,"column":12},"end":{"line":7,"column":16}} ), depth0)) != null ? stack1 : "")
    + "',\n	},\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	isReadOnly: "
    + ((stack1 = container.lambda(container.strict(depth0, "isReadOnly", {"start":{"line":11,"column":16},"end":{"line":11,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	isRequired: "
    + ((stack1 = container.lambda(container.strict(depth0, "isRequired", {"start":{"line":14,"column":16},"end":{"line":14,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	isNullable: "
    + ((stack1 = container.lambda(container.strict(depth0, "isNullable", {"start":{"line":17,"column":16},"end":{"line":17,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n	type: 'array',\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"link"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":9,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isReadOnly"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":0},"end":{"line":12,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isRequired"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":0},"end":{"line":15,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":16,"column":0},"end":{"line":18,"column":7}}})) != null ? stack1 : "")
    + "}";
},"usePartial":true,"useData":true};

var partialSchemaComposition = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	description: `"
    + ((stack1 = lookupProperty(helpers,"escapeDescription").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"escapeDescription","hash":{},"data":data,"loc":{"start":{"line":4,"column":15},"end":{"line":4,"column":50}}})) != null ? stack1 : "")
    + "`,\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"schema"),depth0,{"name":"schema","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(data,"last"),{"name":"unless","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":43},"end":{"line":6,"column":73}}})) != null ? stack1 : "");
},"4":function(container,depth0,helpers,partials,data) {
    return ", ";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	isReadOnly: "
    + ((stack1 = container.lambda(container.strict(depth0, "isReadOnly", {"start":{"line":8,"column":16},"end":{"line":8,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	isRequired: "
    + ((stack1 = container.lambda(container.strict(depth0, "isRequired", {"start":{"line":11,"column":16},"end":{"line":11,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	isNullable: "
    + ((stack1 = container.lambda(container.strict(depth0, "isNullable", {"start":{"line":14,"column":16},"end":{"line":14,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n	type: '"
    + ((stack1 = container.lambda(container.strict(depth0, "export", {"start":{"line":2,"column":10},"end":{"line":2,"column":16}} ), depth0)) != null ? stack1 : "")
    + "',\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":5,"column":7}}})) != null ? stack1 : "")
    + "	contains: ["
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":12},"end":{"line":6,"column":82}}})) != null ? stack1 : "")
    + "],\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isReadOnly"),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":0},"end":{"line":9,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isRequired"),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":0},"end":{"line":12,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":0},"end":{"line":15,"column":7}}})) != null ? stack1 : "")
    + "}";
},"usePartial":true,"useData":true};

var partialSchemaDictionary = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	contains: "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"schema"),lookupProperty(depth0,"link"),{"name":"schema","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ",\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	contains: {\n		type: '"
    + ((stack1 = container.lambda(container.strict(depth0, "base", {"start":{"line":7,"column":12},"end":{"line":7,"column":16}} ), depth0)) != null ? stack1 : "")
    + "',\n	},\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	isReadOnly: "
    + ((stack1 = container.lambda(container.strict(depth0, "isReadOnly", {"start":{"line":11,"column":16},"end":{"line":11,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	isRequired: "
    + ((stack1 = container.lambda(container.strict(depth0, "isRequired", {"start":{"line":14,"column":16},"end":{"line":14,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	isNullable: "
    + ((stack1 = container.lambda(container.strict(depth0, "isNullable", {"start":{"line":17,"column":16},"end":{"line":17,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n	type: 'dictionary',\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"link"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":9,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isReadOnly"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":0},"end":{"line":12,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isRequired"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":0},"end":{"line":15,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":16,"column":0},"end":{"line":18,"column":7}}})) != null ? stack1 : "")
    + "}";
},"usePartial":true,"useData":true};

var partialSchemaEnum = {"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	isReadOnly: "
    + ((stack1 = container.lambda(container.strict(depth0, "isReadOnly", {"start":{"line":4,"column":16},"end":{"line":4,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	isRequired: "
    + ((stack1 = container.lambda(container.strict(depth0, "isRequired", {"start":{"line":7,"column":16},"end":{"line":7,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	isNullable: "
    + ((stack1 = container.lambda(container.strict(depth0, "isNullable", {"start":{"line":10,"column":16},"end":{"line":10,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n	type: 'Enum',\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isReadOnly"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":5,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isRequired"),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":0},"end":{"line":8,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":9,"column":0},"end":{"line":11,"column":7}}})) != null ? stack1 : "")
    + "}";
},"useData":true};

var partialSchemaGeneric = {"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	type: '"
    + ((stack1 = container.lambda(container.strict(depth0, "type", {"start":{"line":3,"column":11},"end":{"line":3,"column":15}} ), depth0)) != null ? stack1 : "")
    + "',\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	description: `"
    + ((stack1 = lookupProperty(helpers,"escapeDescription").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"escapeDescription","hash":{},"data":data,"loc":{"start":{"line":6,"column":15},"end":{"line":6,"column":50}}})) != null ? stack1 : "")
    + "`,\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	isReadOnly: "
    + ((stack1 = container.lambda(container.strict(depth0, "isReadOnly", {"start":{"line":9,"column":16},"end":{"line":9,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	isRequired: "
    + ((stack1 = container.lambda(container.strict(depth0, "isRequired", {"start":{"line":12,"column":16},"end":{"line":12,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	isNullable: "
    + ((stack1 = container.lambda(container.strict(depth0, "isNullable", {"start":{"line":15,"column":16},"end":{"line":15,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	format: '"
    + ((stack1 = container.lambda(container.strict(depth0, "format", {"start":{"line":18,"column":13},"end":{"line":18,"column":19}} ), depth0)) != null ? stack1 : "")
    + "',\n";
},"13":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	maximum: "
    + ((stack1 = container.lambda(container.strict(depth0, "maximum", {"start":{"line":21,"column":13},"end":{"line":21,"column":20}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"15":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	exclusiveMaximum: "
    + ((stack1 = container.lambda(container.strict(depth0, "exclusiveMaximum", {"start":{"line":24,"column":22},"end":{"line":24,"column":38}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"17":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	minimum: "
    + ((stack1 = container.lambda(container.strict(depth0, "minimum", {"start":{"line":27,"column":13},"end":{"line":27,"column":20}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"19":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	exclusiveMinimum: "
    + ((stack1 = container.lambda(container.strict(depth0, "exclusiveMinimum", {"start":{"line":30,"column":22},"end":{"line":30,"column":38}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"21":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	multipleOf: "
    + ((stack1 = container.lambda(container.strict(depth0, "multipleOf", {"start":{"line":33,"column":16},"end":{"line":33,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"23":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	maxLength: "
    + ((stack1 = container.lambda(container.strict(depth0, "maxLength", {"start":{"line":36,"column":15},"end":{"line":36,"column":24}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"25":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	minLength: "
    + ((stack1 = container.lambda(container.strict(depth0, "minLength", {"start":{"line":39,"column":15},"end":{"line":39,"column":24}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"27":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	pattern: '"
    + ((stack1 = container.lambda(container.strict(depth0, "pattern", {"start":{"line":42,"column":14},"end":{"line":42,"column":21}} ), depth0)) != null ? stack1 : "")
    + "',\n";
},"29":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	maxItems: "
    + ((stack1 = container.lambda(container.strict(depth0, "maxItems", {"start":{"line":45,"column":14},"end":{"line":45,"column":22}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"31":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	minItems: "
    + ((stack1 = container.lambda(container.strict(depth0, "minItems", {"start":{"line":48,"column":14},"end":{"line":48,"column":22}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"33":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	uniqueItems: "
    + ((stack1 = container.lambda(container.strict(depth0, "uniqueItems", {"start":{"line":51,"column":17},"end":{"line":51,"column":28}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"35":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	maxProperties: "
    + ((stack1 = container.lambda(container.strict(depth0, "maxProperties", {"start":{"line":54,"column":19},"end":{"line":54,"column":32}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"37":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	minProperties: "
    + ((stack1 = container.lambda(container.strict(depth0, "minProperties", {"start":{"line":57,"column":19},"end":{"line":57,"column":32}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"type"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":4,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":7,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isReadOnly"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":0},"end":{"line":10,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isRequired"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":11,"column":0},"end":{"line":13,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":0},"end":{"line":16,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"format"),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":17,"column":0},"end":{"line":19,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maximum"),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":20,"column":0},"end":{"line":22,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"exclusiveMaximum"),{"name":"if","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":23,"column":0},"end":{"line":25,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minimum"),{"name":"if","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":26,"column":0},"end":{"line":28,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"exclusiveMinimum"),{"name":"if","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":29,"column":0},"end":{"line":31,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"multipleOf"),{"name":"if","hash":{},"fn":container.program(21, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":32,"column":0},"end":{"line":34,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maxLength"),{"name":"if","hash":{},"fn":container.program(23, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":35,"column":0},"end":{"line":37,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minLength"),{"name":"if","hash":{},"fn":container.program(25, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":38,"column":0},"end":{"line":40,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"pattern"),{"name":"if","hash":{},"fn":container.program(27, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":41,"column":0},"end":{"line":43,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maxItems"),{"name":"if","hash":{},"fn":container.program(29, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":44,"column":0},"end":{"line":46,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minItems"),{"name":"if","hash":{},"fn":container.program(31, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":47,"column":0},"end":{"line":49,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"uniqueItems"),{"name":"if","hash":{},"fn":container.program(33, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":50,"column":0},"end":{"line":52,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maxProperties"),{"name":"if","hash":{},"fn":container.program(35, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":53,"column":0},"end":{"line":55,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minProperties"),{"name":"if","hash":{},"fn":container.program(37, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":56,"column":0},"end":{"line":58,"column":7}}})) != null ? stack1 : "")
    + "}";
},"useData":true};

var partialSchemaInterface = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "	description: `"
    + ((stack1 = lookupProperty(helpers,"escapeDescription").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"escapeDescription","hash":{},"data":data,"loc":{"start":{"line":3,"column":15},"end":{"line":3,"column":50}}})) != null ? stack1 : "")
    + "`,\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":1},"end":{"line":9,"column":10}}})) != null ? stack1 : "");
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "		"
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":8,"column":5},"end":{"line":8,"column":9}} ), depth0)) != null ? stack1 : "")
    + ": "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"schema"),depth0,{"name":"schema","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ",\n";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	isReadOnly: "
    + ((stack1 = container.lambda(container.strict(depth0, "isReadOnly", {"start":{"line":13,"column":16},"end":{"line":13,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	isRequired: "
    + ((stack1 = container.lambda(container.strict(depth0, "isRequired", {"start":{"line":16,"column":16},"end":{"line":16,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	isNullable: "
    + ((stack1 = container.lambda(container.strict(depth0, "isNullable", {"start":{"line":19,"column":16},"end":{"line":19,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":4,"column":7}}})) != null ? stack1 : "")
    + "	properties: {\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"properties"),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":0},"end":{"line":10,"column":7}}})) != null ? stack1 : "")
    + "	},\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isReadOnly"),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":0},"end":{"line":14,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isRequired"),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":0},"end":{"line":17,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":18,"column":0},"end":{"line":20,"column":7}}})) != null ? stack1 : "")
    + "}";
},"usePartial":true,"useData":true};

var partialType = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"typeInterface"),depth0,{"name":"typeInterface","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"reference",{"name":"equals","hash":{},"fn":container.program(4, data, 0),"inverse":container.program(6, data, 0),"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":19,"column":0}}})) != null ? stack1 : "");
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"typeReference"),depth0,{"name":"typeReference","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"enum",{"name":"equals","hash":{},"fn":container.program(7, data, 0),"inverse":container.program(9, data, 0),"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":19,"column":0}}})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"typeEnum"),depth0,{"name":"typeEnum","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"array",{"name":"equals","hash":{},"fn":container.program(10, data, 0),"inverse":container.program(12, data, 0),"data":data,"loc":{"start":{"line":7,"column":0},"end":{"line":19,"column":0}}})) != null ? stack1 : "");
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"typeArray"),depth0,{"name":"typeArray","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"dictionary",{"name":"equals","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(15, data, 0),"data":data,"loc":{"start":{"line":9,"column":0},"end":{"line":19,"column":0}}})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"typeDictionary"),depth0,{"name":"typeDictionary","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"15":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"one-of",{"name":"equals","hash":{},"fn":container.program(16, data, 0),"inverse":container.program(18, data, 0),"data":data,"loc":{"start":{"line":11,"column":0},"end":{"line":19,"column":0}}})) != null ? stack1 : "");
},"16":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"typeUnion"),depth0,{"name":"typeUnion","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"18":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"any-of",{"name":"equals","hash":{},"fn":container.program(16, data, 0),"inverse":container.program(19, data, 0),"data":data,"loc":{"start":{"line":13,"column":0},"end":{"line":19,"column":0}}})) != null ? stack1 : "");
},"19":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"all-of",{"name":"equals","hash":{},"fn":container.program(20, data, 0),"inverse":container.program(22, data, 0),"data":data,"loc":{"start":{"line":15,"column":0},"end":{"line":19,"column":0}}})) != null ? stack1 : "");
},"20":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"typeIntersection"),depth0,{"name":"typeIntersection","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"22":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"typeGeneric"),depth0,{"name":"typeGeneric","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"interface",{"name":"equals","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":19,"column":11}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true};

var partialTypeArray = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Array<"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"type"),lookupProperty(depth0,"link"),{"name":"type","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ">"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isNullable"),depth0,{"name":"isNullable","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Array<"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"base"),depth0,{"name":"base","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ">"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isNullable"),depth0,{"name":"isNullable","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"link"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":5,"column":9}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true};

var partialTypeDictionary = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Record<string, "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"type"),lookupProperty(depth0,"link"),{"name":"type","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ">"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isNullable"),depth0,{"name":"isNullable","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Record<string, "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"base"),depth0,{"name":"base","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ">"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isNullable"),depth0,{"name":"isNullable","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"link"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":5,"column":9}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true};

var partialTypeEnum = {"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.lambda(depth0, depth0)) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"enumerator").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"enum"),lookupProperty(depth0,"parent"),lookupProperty(depth0,"name"),{"name":"enumerator","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":55}}})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isNullable"),depth0,{"name":"isNullable","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"usePartial":true,"useData":true};

var partialTypeGeneric = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"base"),depth0,{"name":"base","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isNullable"),depth0,{"name":"isNullable","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"usePartial":true,"useData":true};

var partialTypeInterface = {"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":19,"column":9}}})) != null ? stack1 : "")
    + "}"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isNullable"),depth0,{"name":"isNullable","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"ifdef").call(alias1,lookupProperty(depth0,"description"),lookupProperty(depth0,"deprecated"),{"name":"ifdef","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":13,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depths[1],"parent"),{"name":"if","hash":{},"fn":container.program(8, data, 0, blockParams, depths),"inverse":container.program(10, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":14,"column":0},"end":{"line":18,"column":7}}})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "/**\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":0},"end":{"line":8,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"deprecated"),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":9,"column":0},"end":{"line":11,"column":7}}})) != null ? stack1 : "")
    + " */\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return " * "
    + ((stack1 = lookupProperty(helpers,"escapeComment").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"escapeComment","hash":{},"data":data,"loc":{"start":{"line":7,"column":3},"end":{"line":7,"column":34}}})) != null ? stack1 : "")
    + "\n";
},"6":function(container,depth0,helpers,partials,data) {
    return " * @deprecated\n";
},"8":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"isReadOnly"),depth0,{"name":"isReadOnly","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":15,"column":18},"end":{"line":15,"column":22}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isRequired"),depth0,{"name":"isRequired","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ": "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"type"),depth0,{"name":"type","hash":{"parent":lookupProperty(depths[1],"parent")},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ";\n";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"isReadOnly"),depth0,{"name":"isReadOnly","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":17,"column":18},"end":{"line":17,"column":22}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isRequired"),depth0,{"name":"isRequired","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ": "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"type"),depth0,{"name":"type","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ";\n";
},"12":function(container,depth0,helpers,partials,data) {
    return "any";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"properties"),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.program(12, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":23,"column":9}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true,"useDepths":true};

var partialTypeIntersection = {"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.lambda(depth0, depth0)) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"intersection").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"properties"),lookupProperty(depth0,"parent"),{"name":"intersection","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":60}}})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isNullable"),depth0,{"name":"isNullable","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"usePartial":true,"useData":true};

var partialTypeReference = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"base"),depth0,{"name":"base","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isNullable"),depth0,{"name":"isNullable","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"usePartial":true,"useData":true};

var partialTypeUnion = {"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.lambda(depth0, depth0)) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"union").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"properties"),lookupProperty(depth0,"parent"),{"name":"union","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":46}}})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isNullable"),depth0,{"name":"isNullable","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"usePartial":true,"useData":true};

const registerHandlebarHelpers = (root) => {
    runtime.registerHelper('ifdef', function (...args) {
        const options = args.pop();
        if (!args.every(value => !value)) {
            return options.fn(this);
        }
        return options.inverse(this);
    });
    runtime.registerHelper('equals', function (a, b, options) {
        return a === b ? options.fn(this) : options.inverse(this);
    });
    runtime.registerHelper('notEquals', function (a, b, options) {
        return a !== b ? options.fn(this) : options.inverse(this);
    });
    runtime.registerHelper('containsSpaces', function (value, options) {
        return /\s+/.test(value) ? options.fn(this) : options.inverse(this);
    });
    runtime.registerHelper('union', function (properties, parent, options) {
        const type = runtime.partials['type'];
        const types = properties.map(property => type({ ...root, ...property, parent }));
        const uniqueTypes = types.filter(unique);
        let uniqueTypesString = uniqueTypes.join(' | ');
        if (uniqueTypes.length > 1) {
            uniqueTypesString = `(${uniqueTypesString})`;
        }
        return options.fn(uniqueTypesString);
    });
    runtime.registerHelper('intersection', function (properties, parent, options) {
        const type = runtime.partials['type'];
        const types = properties.map(property => type({ ...root, ...property, parent }));
        const uniqueTypes = types.filter(unique);
        let uniqueTypesString = uniqueTypes.join(' & ');
        if (uniqueTypes.length > 1) {
            uniqueTypesString = `(${uniqueTypesString})`;
        }
        return options.fn(uniqueTypesString);
    });
    runtime.registerHelper('enumerator', function (enumerators, parent, name, options) {
        if (!root.useUnionTypes && parent && name) {
            return `${parent}.${name}`;
        }
        return options.fn(enumerators
            .map(enumerator => enumerator.value)
            .filter(unique)
            .join(' | '));
    });
    runtime.registerHelper('escapeComment', function (value) {
        return value
            .replace(/\*\//g, '*')
            .replace(/\/\*/g, '*')
            .replace(/\r?\n(.*)/g, (_, w) => `${os.EOL} * ${w.trim()}`);
    });
    runtime.registerHelper('escapeDescription', function (value) {
        return value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
    });
    runtime.registerHelper('camelCase', function (value) {
        return camelCase__default["default"](value);
    });
};

/**
 * Read all the Handlebar templates that we need and return on wrapper object
 * so we can easily access the templates in out generator / write functions.
 */
const registerHandlebarTemplates = (root) => {
    registerHandlebarHelpers(root);
    // Main templates (entry points for the files we write to disk)
    const templates = {
        index: runtime.template(templateIndex),
        client: runtime.template(templateClient),
        exports: {
            model: runtime.template(templateExportModel),
            schema: runtime.template(templateExportSchema),
            service: runtime.template(templateExportService),
        },
        core: {
            settings: runtime.template(templateCoreSettings),
            apiError: runtime.template(templateCoreApiError),
            apiRequestOptions: runtime.template(templateCoreApiRequestOptions),
            apiResult: runtime.template(templateCoreApiResult),
            cancelablePromise: runtime.template(templateCancelablePromise),
            request: runtime.template(templateCoreRequest),
            baseHttpRequest: runtime.template(templateCoreBaseHttpRequest),
            httpRequest: runtime.template(templateCoreHttpRequest),
        },
    };
    // Partials for the generations of the models, services, etc.
    runtime.registerPartial('exportEnum', runtime.template(partialExportEnum));
    runtime.registerPartial('exportInterface', runtime.template(partialExportInterface));
    runtime.registerPartial('exportComposition', runtime.template(partialExportComposition));
    runtime.registerPartial('exportType', runtime.template(partialExportType));
    runtime.registerPartial('header', runtime.template(partialHeader));
    runtime.registerPartial('isNullable', runtime.template(partialIsNullable));
    runtime.registerPartial('isReadOnly', runtime.template(partialIsReadOnly));
    runtime.registerPartial('isRequired', runtime.template(partialIsRequired));
    runtime.registerPartial('parameters', runtime.template(partialParameters));
    runtime.registerPartial('result', runtime.template(partialResult));
    runtime.registerPartial('schema', runtime.template(partialSchema));
    runtime.registerPartial('schemaArray', runtime.template(partialSchemaArray));
    runtime.registerPartial('schemaDictionary', runtime.template(partialSchemaDictionary));
    runtime.registerPartial('schemaEnum', runtime.template(partialSchemaEnum));
    runtime.registerPartial('schemaGeneric', runtime.template(partialSchemaGeneric));
    runtime.registerPartial('schemaInterface', runtime.template(partialSchemaInterface));
    runtime.registerPartial('schemaComposition', runtime.template(partialSchemaComposition));
    runtime.registerPartial('type', runtime.template(partialType));
    runtime.registerPartial('typeArray', runtime.template(partialTypeArray));
    runtime.registerPartial('typeDictionary', runtime.template(partialTypeDictionary));
    runtime.registerPartial('typeEnum', runtime.template(partialTypeEnum));
    runtime.registerPartial('typeGeneric', runtime.template(partialTypeGeneric));
    runtime.registerPartial('typeInterface', runtime.template(partialTypeInterface));
    runtime.registerPartial('typeReference', runtime.template(partialTypeReference));
    runtime.registerPartial('typeUnion', runtime.template(partialTypeUnion));
    runtime.registerPartial('typeIntersection', runtime.template(partialTypeIntersection));
    runtime.registerPartial('base', runtime.template(partialBase));
    // Generic functions used in 'request' file @see src/templates/core/request.hbs for more info
    runtime.registerPartial('functions/catchErrorCodes', runtime.template(functionCatchErrorCodes));
    runtime.registerPartial('functions/getFormData', runtime.template(functionGetFormData));
    runtime.registerPartial('functions/getQueryString', runtime.template(functionGetQueryString));
    runtime.registerPartial('functions/getUrl', runtime.template(functionGetUrl));
    runtime.registerPartial('functions/isBlob', runtime.template(functionIsBlob));
    runtime.registerPartial('functions/isDefined', runtime.template(functionIsDefined));
    runtime.registerPartial('functions/isFormData', runtime.template(functionIsFormData));
    runtime.registerPartial('functions/isString', runtime.template(functionIsString));
    runtime.registerPartial('functions/isStringWithValue', runtime.template(functionIsStringWithValue));
    runtime.registerPartial('functions/isSuccess', runtime.template(functionIsSuccess));
    runtime.registerPartial('functions/base64', runtime.template(functionBase64));
    runtime.registerPartial('functions/resolve', runtime.template(functionResolve));
    // Specific files for the fetch client implementation
    runtime.registerPartial('fetch/getHeaders', runtime.template(fetchGetHeaders));
    runtime.registerPartial('fetch/getRequestBody', runtime.template(fetchGetRequestBody));
    runtime.registerPartial('fetch/getResponseBody', runtime.template(fetchGetResponseBody));
    runtime.registerPartial('fetch/getResponseHeader', runtime.template(fetchGetResponseHeader));
    runtime.registerPartial('fetch/sendRequest', runtime.template(fetchSendRequest));
    runtime.registerPartial('fetch/request', runtime.template(fetchRequest));
    // Specific files for the xhr client implementation
    runtime.registerPartial('xhr/getHeaders', runtime.template(xhrGetHeaders));
    runtime.registerPartial('xhr/getRequestBody', runtime.template(xhrGetRequestBody));
    runtime.registerPartial('xhr/getResponseBody', runtime.template(xhrGetResponseBody));
    runtime.registerPartial('xhr/getResponseHeader', runtime.template(xhrGetResponseHeader));
    runtime.registerPartial('xhr/sendRequest', runtime.template(xhrSendRequest));
    runtime.registerPartial('xhr/request', runtime.template(xhrRequest));
    // Specific files for the node client implementation
    runtime.registerPartial('node/getHeaders', runtime.template(nodeGetHeaders));
    runtime.registerPartial('node/getRequestBody', runtime.template(nodeGetRequestBody));
    runtime.registerPartial('node/getResponseBody', runtime.template(nodeGetResponseBody));
    runtime.registerPartial('node/getResponseHeader', runtime.template(nodeGetResponseHeader));
    runtime.registerPartial('node/sendRequest', runtime.template(nodeSendRequest));
    runtime.registerPartial('node/request', runtime.template(nodeRequest));
    // Specific files for the axios client implementation
    runtime.registerPartial('axios/getHeaders', runtime.template(axiosGetHeaders));
    runtime.registerPartial('axios/getRequestBody', runtime.template(axiosGetRequestBody));
    runtime.registerPartial('axios/getResponseBody', runtime.template(axiosGetResponseBody));
    runtime.registerPartial('axios/getResponseHeader', runtime.template(axiosGetResponseHeader));
    runtime.registerPartial('axios/sendRequest', runtime.template(axiosSendRequest));
    runtime.registerPartial('axios/request', runtime.template(axiosRequest));
    // Specific files for the angular client implementation
    runtime.registerPartial('angular/getHeaders', runtime.template(angularGetHeaders));
    runtime.registerPartial('angular/getRequestBody', runtime.template(angularGetRequestBody));
    runtime.registerPartial('angular/getResponseBody', runtime.template(angularGetResponseBody));
    runtime.registerPartial('angular/getResponseHeader', runtime.template(angularGetResponseHeader));
    runtime.registerPartial('angular/sendRequest', runtime.template(angularSendRequest));
    runtime.registerPartial('angular/request', runtime.template(angularRequest));
    return templates;
};

const writeFile = fsExtra.writeFile;
const copyFile = fsExtra.copyFile;
const exists = fsExtra.pathExists;
const mkdir = fsExtra.mkdirp;
const rmdir = fsExtra.remove;

const isSubDirectory = (parent, child) => {
    return path.relative(child, parent).startsWith('..');
};

const formatCode = (s) => {
    let indent = 0;
    let lines = s.split(os.EOL);
    lines = lines.map(line => {
        line = line.trim().replace(/^\*/g, ' *');
        let i = indent;
        if (line.endsWith('(') || line.endsWith('{') || line.endsWith('[')) {
            indent++;
        }
        if ((line.startsWith(')') || line.startsWith('}') || line.startsWith(']')) && i) {
            indent--;
            i--;
        }
        const result = `${'\t'.repeat(i)}${line}`;
        if (result.trim() === '') {
            return '';
        }
        return result;
    });
    return lines.join(os.EOL);
};

const formatIndentation = (s, indent) => {
    let lines = s.split(os.EOL);
    lines = lines.map(line => {
        switch (indent) {
            case exports.Indent.SPACE_4:
                return line.replace(/\t/g, '    ');
            case exports.Indent.SPACE_2:
                return line.replace(/\t/g, '  ');
            case exports.Indent.TAB:
                return line; // Default output is tab formatted
        }
    });
    // Make sure we have a blank line at the end
    const content = lines.join(os.EOL);
    return `${content}${os.EOL}`;
};

/**
 * Generate the HttpRequest filename based on the selected client
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 */
const getHttpRequestName = (httpClient) => {
    switch (httpClient) {
        case exports.HttpClient.FETCH:
            return 'FetchHttpRequest';
        case exports.HttpClient.XHR:
            return 'XHRHttpRequest';
        case exports.HttpClient.NODE:
            return 'NodeHttpRequest';
        case exports.HttpClient.AXIOS:
            return 'AxiosHttpRequest';
        case exports.HttpClient.ANGULAR:
            return 'AngularHttpRequest';
    }
};

const sortModelsByName = (models) => {
    return models.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB, 'en');
    });
};

const sortServicesByName = (services) => {
    return services.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB, 'en');
    });
};

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param clientName Custom client class name
 * @param indent Indentation options (4, 2 or tab)
 * @param postfix Service name postfix
 */
const writeClientClass = async (client, templates, outputPath, httpClient, clientName, indent, postfix) => {
    const templateResult = templates.client({
        clientName,
        httpClient,
        postfix,
        server: client.server,
        version: client.version,
        models: sortModelsByName(client.models),
        services: sortServicesByName(client.services),
        httpRequest: getHttpRequestName(httpClient),
    });
    await writeFile(path.resolve(outputPath, `${clientName}.ts`), formatIndentation(formatCode(templateResult), indent));
};

/**
 * Generate OpenAPI core files, this includes the basic boilerplate code to handle requests.
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param indent Indentation options (4, 2 or tab)
 * @param clientName Custom client class name
 * @param request Path to custom request file
 */
const writeClientCore = async (client, templates, outputPath, httpClient, indent, clientName, request) => {
    const httpRequest = getHttpRequestName(httpClient);
    const context = {
        httpClient,
        clientName,
        httpRequest,
        server: client.server,
        version: client.version,
    };
    await writeFile(path.resolve(outputPath, 'OpenAPI.ts'), formatIndentation(templates.core.settings(context), indent));
    await writeFile(path.resolve(outputPath, 'ApiError.ts'), formatIndentation(templates.core.apiError(context), indent));
    await writeFile(path.resolve(outputPath, 'ApiRequestOptions.ts'), formatIndentation(templates.core.apiRequestOptions(context), indent));
    await writeFile(path.resolve(outputPath, 'ApiResult.ts'), formatIndentation(templates.core.apiResult(context), indent));
    await writeFile(path.resolve(outputPath, 'CancelablePromise.ts'), formatIndentation(templates.core.cancelablePromise(context), indent));
    await writeFile(path.resolve(outputPath, 'request.ts'), formatIndentation(templates.core.request(context), indent));
    if (isDefined(clientName)) {
        await writeFile(path.resolve(outputPath, 'BaseHttpRequest.ts'), formatIndentation(templates.core.baseHttpRequest(context), indent));
        await writeFile(path.resolve(outputPath, `${httpRequest}.ts`), formatIndentation(templates.core.httpRequest(context), indent));
    }
    if (request) {
        const requestFile = path.resolve(process.cwd(), request);
        const requestFileExists = await exists(requestFile);
        if (!requestFileExists) {
            throw new Error(`Custom request file "${requestFile}" does not exists`);
        }
        await copyFile(requestFile, path.resolve(outputPath, 'request.ts'));
    }
};

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore Generate core
 * @param exportServices Generate services
 * @param exportModels Generate models
 * @param exportSchemas Generate schemas
 * @param postfix Service name postfix
 * @param clientName Custom client class name
 */
const writeClientIndex = async (client, templates, outputPath, useUnionTypes, exportCore, exportServices, exportModels, exportSchemas, postfix, clientName) => {
    const templateResult = templates.index({
        exportCore,
        exportServices,
        exportModels,
        exportSchemas,
        useUnionTypes,
        postfix,
        clientName,
        server: client.server,
        version: client.version,
        models: sortModelsByName(client.models),
        services: sortServicesByName(client.services),
        exportClient: isDefined(clientName),
    });
    await writeFile(path.resolve(outputPath, 'index.ts'), templateResult);
};

/**
 * Generate Models using the Handlebar template and write to disk.
 * @param models Array of Models to write
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param useUnionTypes Use union types instead of enums
 * @param indent Indentation options (4, 2 or tab)
 */
const writeClientModels = async (models, templates, outputPath, httpClient, useUnionTypes, indent) => {
    for (const model of models) {
        const file = path.resolve(outputPath, `${model.name}.ts`);
        const templateResult = templates.exports.model({
            ...model,
            httpClient,
            useUnionTypes,
        });
        await writeFile(file, formatIndentation(formatCode(templateResult), indent));
    }
};

/**
 * Generate Schemas using the Handlebar template and write to disk.
 * @param models Array of Models to write
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param useUnionTypes Use union types instead of enums
 * @param indent Indentation options (4, 2 or tab)
 */
const writeClientSchemas = async (models, templates, outputPath, httpClient, useUnionTypes, indent) => {
    for (const model of models) {
        const file = path.resolve(outputPath, `$${model.name}.ts`);
        const templateResult = templates.exports.schema({
            ...model,
            httpClient,
            useUnionTypes,
        });
        await writeFile(file, formatIndentation(formatCode(templateResult), indent));
    }
};

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param services Array of Services to write
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param useUnionTypes Use union types instead of enums
 * @param useOptions Use options or arguments functions
 * @param indent Indentation options (4, 2 or tab)
 * @param postfix Service name postfix
 * @param clientName Custom client class name
 */
const writeClientServices = async (services, templates, outputPath, httpClient, useUnionTypes, useOptions, indent, postfix, clientName) => {
    for (const service of services) {
        const file = path.resolve(outputPath, `${service.name}${postfix}.ts`);
        const templateResult = templates.exports.service({
            ...service,
            httpClient,
            useUnionTypes,
            useOptions,
            postfix,
            exportClient: isDefined(clientName),
        });
        await writeFile(file, formatIndentation(formatCode(templateResult), indent));
    }
};

/**
 * Write our OpenAPI client, using the given templates at the given output
 * @param client Client object with all the models, services, etc.
 * @param templates Templates wrapper with all loaded Handlebars templates
 * @param output The relative location of the output directory
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param useOptions Use options or arguments functions
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore Generate core client classes
 * @param exportServices Generate services
 * @param exportModels Generate models
 * @param exportSchemas Generate schemas
 * @param exportSchemas Generate schemas
 * @param indent Indentation options (4, 2 or tab)
 * @param postfix Service name postfix
 * @param clientName Custom client class name
 * @param request Path to custom request file
 */
const writeClient = async (client, templates, output, httpClient, useOptions, useUnionTypes, exportCore, exportServices, exportModels, exportSchemas, indent, postfix, clientName, request) => {
    const outputPath = path.resolve(process.cwd(), output);
    const outputPathCore = path.resolve(outputPath, 'core');
    const outputPathModels = path.resolve(outputPath, 'models');
    const outputPathSchemas = path.resolve(outputPath, 'schemas');
    const outputPathServices = path.resolve(outputPath, 'services');
    if (!isSubDirectory(process.cwd(), output)) {
        throw new Error(`Output folder is not a subdirectory of the current working directory`);
    }
    if (exportCore) {
        await rmdir(outputPathCore);
        await mkdir(outputPathCore);
        await writeClientCore(client, templates, outputPathCore, httpClient, indent, clientName, request);
    }
    if (exportServices) {
        await rmdir(outputPathServices);
        await mkdir(outputPathServices);
        await writeClientServices(client.services, templates, outputPathServices, httpClient, useUnionTypes, useOptions, indent, postfix, clientName);
    }
    if (exportSchemas) {
        await rmdir(outputPathSchemas);
        await mkdir(outputPathSchemas);
        await writeClientSchemas(client.models, templates, outputPathSchemas, httpClient, useUnionTypes, indent);
    }
    if (exportModels) {
        await rmdir(outputPathModels);
        await mkdir(outputPathModels);
        await writeClientModels(client.models, templates, outputPathModels, httpClient, useUnionTypes, indent);
    }
    if (isDefined(clientName)) {
        await mkdir(outputPath);
        await writeClientClass(client, templates, outputPath, httpClient, clientName, indent, postfix);
    }
    if (exportCore || exportServices || exportSchemas || exportModels) {
        await mkdir(outputPath);
        await writeClientIndex(client, templates, outputPath, useUnionTypes, exportCore, exportServices, exportModels, exportSchemas, postfix, clientName);
    }
};

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param input The relative location of the OpenAPI spec
 * @param output The relative location of the output directory
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param clientName Custom client class name
 * @param useOptions Use options or arguments functions
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore Generate core client classes
 * @param exportServices Generate services
 * @param exportModels Generate models
 * @param exportSchemas Generate schemas
 * @param indent Indentation options (4, 2 or tab)
 * @param postfix Service name postfix
 * @param request Path to custom request file
 * @param write Write the files to disk (true or false)
 */
const generate = async ({ input, output, httpClient = exports.HttpClient.FETCH, clientName, useOptions = false, useUnionTypes = false, exportCore = true, exportServices = true, exportModels = true, exportSchemas = false, indent = exports.Indent.SPACE_4, postfix = 'Service', request, write = true, }) => {
    const openApi = isString(input) ? await getOpenApiSpec(input) : input;
    const openApiVersion = getOpenApiVersion(openApi);
    const templates = registerHandlebarTemplates({
        httpClient,
        useUnionTypes,
        useOptions,
    });
    switch (openApiVersion) {
        case OpenApiVersion.V2: {
            const client = parse$1(openApi);
            const clientFinal = postProcessClient(client);
            if (!write)
                break;
            await writeClient(clientFinal, templates, output, httpClient, useOptions, useUnionTypes, exportCore, exportServices, exportModels, exportSchemas, indent, postfix, clientName, request);
            break;
        }
        case OpenApiVersion.V3: {
            const client = parse(openApi);
            const clientFinal = postProcessClient(client);
            if (!write)
                break;
            await writeClient(clientFinal, templates, output, httpClient, useOptions, useUnionTypes, exportCore, exportServices, exportModels, exportSchemas, indent, postfix, clientName, request);
            break;
        }
    }
};
var index = {
    HttpClient: exports.HttpClient,
    generate,
};

exports["default"] = index;
exports.generate = generate;
