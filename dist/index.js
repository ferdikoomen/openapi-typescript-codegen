'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var os = require('os');
var camelCase = require('camelcase');
var yaml = require('js-yaml');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var util = require('util');
var http = require('http');
var https = require('https');
var Handlebars = require('handlebars/runtime');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var camelCase__default = /*#__PURE__*/_interopDefaultLegacy(camelCase);
var mkdirp__default = /*#__PURE__*/_interopDefaultLegacy(mkdirp);
var rimraf__default = /*#__PURE__*/_interopDefaultLegacy(rimraf);

var PrimaryType;
(function (PrimaryType) {
    PrimaryType["FILE"] = "File";
    PrimaryType["OBJECT"] = "any";
    PrimaryType["ARRAY"] = "any[]";
    PrimaryType["BOOLEAN"] = "boolean";
    PrimaryType["NUMBER"] = "number";
    PrimaryType["STRING"] = "string";
    PrimaryType["VOID"] = "void";
    PrimaryType["NULL"] = "null";
})(PrimaryType || (PrimaryType = {}));
const TYPE_MAPPINGS = new Map([
    ['file', PrimaryType.FILE],
    ['any', PrimaryType.OBJECT],
    ['object', PrimaryType.OBJECT],
    ['array', PrimaryType.ARRAY],
    ['boolean', PrimaryType.BOOLEAN],
    ['byte', PrimaryType.NUMBER],
    ['int', PrimaryType.NUMBER],
    ['int32', PrimaryType.NUMBER],
    ['int64', PrimaryType.NUMBER],
    ['integer', PrimaryType.NUMBER],
    ['float', PrimaryType.NUMBER],
    ['double', PrimaryType.NUMBER],
    ['short', PrimaryType.NUMBER],
    ['long', PrimaryType.NUMBER],
    ['number', PrimaryType.NUMBER],
    ['char', PrimaryType.STRING],
    ['date', PrimaryType.STRING],
    ['date-time', PrimaryType.STRING],
    ['password', PrimaryType.STRING],
    ['string', PrimaryType.STRING],
    ['void', PrimaryType.VOID],
    ['null', PrimaryType.NULL],
]);
var Method;
(function (Method) {
    Method["GET"] = "get";
    Method["PUT"] = "put";
    Method["POST"] = "post";
    Method["DELETE"] = "delete";
    Method["OPTIONS"] = "options";
    Method["HEAD"] = "head";
    Method["PATCH"] = "patch";
})(Method || (Method = {}));

/**
 * Extend the enum with the x-enum properties. This adds the capability
 * to use names and descriptions inside the generated enums.
 * @param enumerators
 * @param definition
 */
function extendEnum(enumerators, definition) {
    const names = definition['x-enum-varnames'];
    const descriptions = definition['x-enum-descriptions'];
    return enumerators.map((enumerator, index) => ({
        name: (names && names[index]) || enumerator.name,
        description: (descriptions && descriptions[index]) || enumerator.description,
        value: enumerator.value,
        type: enumerator.type,
    }));
}

/**
 * Cleanup comment and prefix multiline comments with "*",
 * so they look a bit nicer when used in the generated code.
 * @param comment
 */
function getComment(comment) {
    if (comment) {
        return comment.replace(/\r?\n(.*)/g, (_, w) => `${os.EOL} * ${w.trim()}`);
    }
    return null;
}

/**
 * Check if a value is defined
 * @param value
 */
function isDefined(value) {
    return value !== undefined && value !== null && value !== '';
}

function getEnum(values) {
    if (Array.isArray(values)) {
        return values
            .filter((value, index, arr) => {
            return arr.indexOf(value) === index;
        })
            .filter(isDefined)
            .map(value => {
            if (typeof value === 'number') {
                return {
                    name: `_${value}`,
                    value: String(value),
                    type: PrimaryType.NUMBER,
                    description: null,
                };
            }
            return {
                name: value
                    .replace(/\W+/g, '_')
                    .replace(/^(\d+)/g, '_$1')
                    .replace(/([a-z])([A-Z]+)/g, '$1_$2')
                    .toUpperCase(),
                value: `'${value}'`,
                type: PrimaryType.STRING,
                description: null,
            };
        });
    }
    return [];
}

function getEnumFromDescription(description) {
    // Check if we can find this special format string:
    // None=0,Something=1,AnotherThing=2
    if (/^(\w+=[0-9]+,?)+$/g.test(description)) {
        const matches = description.match(/(\w+=[0-9]+,?)/g);
        if (matches) {
            // Grab the values from the description
            const symbols = [];
            matches.forEach(match => {
                const name = match.split('=')[0];
                const value = parseInt(match.split('=')[1].replace(/[^0-9]/g, ''));
                if (name && Number.isInteger(value)) {
                    symbols.push({
                        name: name
                            .replace(/\W+/g, '_')
                            .replace(/^(\d+)/g, '_$1')
                            .replace(/([a-z])([A-Z]+)/g, '$1_$2')
                            .toUpperCase(),
                        value: String(value),
                        type: PrimaryType.NUMBER,
                        description: null,
                    });
                }
            });
            // Filter out any duplicate names
            return symbols.filter((symbol, index, arr) => {
                return arr.map(item => item.name).indexOf(symbol.name) === index;
            });
        }
    }
    return [];
}

function escapeName(value) {
    if (value) {
        const validName = /^[a-zA-Z_$][\w$]+$/g.test(value);
        if (!validName) {
            return `'${value}'`;
        }
    }
    return value;
}

/**
 * The spec generates a pattern like this '^\d{3}-\d{2}-\d{4}$'
 * However, to use it in HTML or inside new RegExp() we need to
 * escape the pattern to become: '^\\d{3}-\\d{2}-\\d{4}$' in order
 * to make it a valid regexp string.
 * @param pattern
 */
function getPattern(pattern) {
    return pattern === null || pattern === void 0 ? void 0 : pattern.replace(/\\/g, '\\\\');
}

/**
 * Get mapped type for given type to any basic Typescript/Javascript type.
 */
function getMappedType(type) {
    const mapped = TYPE_MAPPINGS.get(type.toLowerCase());
    if (mapped) {
        return mapped;
    }
    return type;
}
function hasMappedType(type) {
    return TYPE_MAPPINGS.has(type.toLowerCase());
}

/**
 * Strip (OpenAPI) namespaces fom values.
 * @param value
 */
function stripNamespace(value) {
    return (value
        .trim()
        .replace(/^#\/definitions\//, '')
        .replace(/^#\/parameters\//, '')
        .replace(/^#\/responses\//, '')
        .replace(/^#\/securityDefinitions\//, '')
        // First we remove the namespace from template notation:
        // Example: namespace.Template[namespace.Model] -> namespace.Template[Model]
        .replace(/(\[.*\]$)/, (s) => {
        const v = s.replace('[', '').replace(']', '').split('.').pop();
        return `[${v}]`;
    })
        // Then we remove the namespace from the complete result:
        // Example: namespace.Template[Model] -> Template[Model]
        .replace(/.*/, (s) => {
        return s.split('.').pop();
    }));
}

/**
 * Parse any string value into a type object.
 * @param value String value like "integer" or "Link[Model]".
 * @param template Optional template class from parent (needed to process generics)
 */
function getType(value, template) {
    const result = {
        type: PrimaryType.OBJECT,
        base: PrimaryType.OBJECT,
        template: null,
        imports: [],
    };
    const valueClean = stripNamespace(value || '');
    if (/\[.*\]$/g.test(valueClean)) {
        const matches = valueClean.match(/(.*?)\[(.*)\]$/);
        if (matches && matches.length) {
            const match1 = getType(matches[1]);
            const match2 = getType(matches[2]);
            if (match1.type === PrimaryType.ARRAY) {
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
        }
    }
    else if (hasMappedType(valueClean)) {
        const mapped = getMappedType(valueClean);
        result.type = mapped;
        result.base = mapped;
    }
    else if (valueClean) {
        result.type = valueClean;
        result.base = valueClean;
        result.imports.push(valueClean);
    }
    // If the property that we found matched the parent template class
    // Then ignore this whole property and return it as a "T" template property.
    if (result.type === template) {
        result.type = 'T'; // Template;
        result.base = 'T'; // Template;
        result.imports = [];
    }
    return result;
}

function getModelProperties(openApi, definition, getModel) {
    const models = [];
    for (const propertyName in definition.properties) {
        if (definition.properties.hasOwnProperty(propertyName)) {
            const property = definition.properties[propertyName];
            const propertyRequired = definition.required && definition.required.includes(propertyName);
            if (property.$ref) {
                const model = getType(property.$ref);
                models.push({
                    name: escapeName(propertyName),
                    export: 'reference',
                    type: model.type,
                    base: model.base,
                    template: model.template,
                    link: null,
                    description: getComment(property.description),
                    isDefinition: false,
                    isReadOnly: property.readOnly === true,
                    isRequired: propertyRequired === true,
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
                    extends: [],
                    enum: [],
                    enums: [],
                    properties: [],
                });
            }
            else {
                const model = getModel(openApi, property);
                models.push({
                    name: escapeName(propertyName),
                    export: model.export,
                    type: model.type,
                    base: model.base,
                    template: model.template,
                    link: model.link,
                    description: getComment(property.description),
                    isDefinition: false,
                    isReadOnly: property.readOnly === true,
                    isRequired: propertyRequired === true,
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
                    extends: model.extends,
                    enum: model.enum,
                    enums: model.enums,
                    properties: model.properties,
                });
            }
        }
    }
    return models;
}

function getModel(openApi, definition, isDefinition = false, name = '') {
    const model = {
        name: name,
        export: 'interface',
        type: PrimaryType.OBJECT,
        base: PrimaryType.OBJECT,
        template: null,
        link: null,
        description: getComment(definition.description),
        isDefinition: isDefinition,
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
        extends: [],
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
        return model;
    }
    if (definition.enum) {
        const enumerators = getEnum(definition.enum);
        const extendedEnumerators = extendEnum(enumerators, definition);
        if (extendedEnumerators.length) {
            model.export = 'enum';
            model.type = PrimaryType.STRING;
            model.base = PrimaryType.STRING;
            model.enum.push(...extendedEnumerators);
            return model;
        }
    }
    if ((definition.type === 'int' || definition.type === 'integer') && definition.description) {
        const enumerators = getEnumFromDescription(definition.description);
        if (enumerators.length) {
            model.export = 'enum';
            model.type = PrimaryType.NUMBER;
            model.base = PrimaryType.NUMBER;
            model.enum.push(...enumerators);
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
            return model;
        }
    }
    if (definition.type === 'object' && definition.additionalProperties && typeof definition.additionalProperties === 'object') {
        if (definition.additionalProperties.$ref) {
            const additionalProperties = getType(definition.additionalProperties.$ref);
            model.export = 'dictionary';
            model.type = additionalProperties.type;
            model.base = additionalProperties.base;
            model.template = additionalProperties.template;
            model.imports.push(...additionalProperties.imports);
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
            return model;
        }
    }
    if (definition.type === 'object' || definition.allOf) {
        model.export = 'interface';
        model.type = PrimaryType.OBJECT;
        model.base = PrimaryType.OBJECT;
        if (definition.allOf && definition.allOf.length) {
            definition.allOf.forEach(parent => {
                if (parent.$ref) {
                    const parentRef = getType(parent.$ref);
                    model.extends.push(parentRef.base);
                    model.imports.push(parentRef.base);
                }
                if (parent.type === 'object' && parent.properties) {
                    const properties = getModelProperties(openApi, parent, getModel);
                    properties.forEach(property => {
                        model.properties.push(property);
                        model.imports.push(...property.imports);
                        if (property.export === 'enum') {
                            model.enums.push(property);
                        }
                    });
                }
            });
        }
        if (definition.properties) {
            const properties = getModelProperties(openApi, definition, getModel);
            properties.forEach(property => {
                model.properties.push(property);
                model.imports.push(...property.imports);
                if (property.export === 'enum') {
                    model.enums.push(property);
                }
            });
        }
        return model;
    }
    // If the schema has a type than it can be a basic or generic type.
    if (definition.type) {
        const definitionType = getType(definition.type);
        model.export = 'generic';
        model.type = definitionType.type;
        model.base = definitionType.base;
        model.template = definitionType.template;
        model.imports.push(...definitionType.imports);
        return model;
    }
    return model;
}

function getModels(openApi) {
    const models = [];
    for (const definitionName in openApi.definitions) {
        if (openApi.definitions.hasOwnProperty(definitionName)) {
            const definition = openApi.definitions[definitionName];
            const definitionType = getType(definitionName);
            const model = getModel(openApi, definition, true, definitionType.base);
            models.push(model);
        }
    }
    return models;
}

/**
 * Get the base server url.
 * @param openApi
 */
function getServer(openApi) {
    const scheme = (openApi.schemes && openApi.schemes[0]) || 'http';
    const host = openApi.host;
    const basePath = openApi.basePath || '';
    return host ? `${scheme}://${host}${basePath}` : basePath;
}

function getOperationErrors(operationResponses) {
    return operationResponses
        .filter(operationResponse => {
        return operationResponse.code >= 300 && operationResponse.description;
    })
        .map(response => ({
        code: response.code,
        description: response.description,
    }));
}

/**
 * Convert the input value to a correct operation (method) classname.
 * This converts the input string to camelCase, so the method name follows
 * the most popular Javascript and Typescript writing style.
 */
function getOperationName(value) {
    const clean = value
        .replace(/^[^a-zA-Z]+/g, '')
        .replace(/[^\w\-]+/g, '-')
        .trim();
    return camelCase__default['default'](clean);
}

function getOperationParameterDefault(parameter, operationParameter) {
    if (parameter.default === undefined) {
        return;
    }
    if (parameter.default === null) {
        return 'null';
    }
    const type = parameter.type || typeof parameter.default;
    switch (type) {
        case 'int':
        case 'integer':
        case 'number':
            if (operationParameter.export == 'enum' && operationParameter.enum.length && operationParameter.enum[parameter.default]) {
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
    return;
}

/**
 * Replaces any invalid characters from a parameter name.
 * For example: 'filter.someProperty' becomes 'filterSomeProperty'.
 */
function getOperationParameterName(value) {
    const clean = value
        .replace(/^[^a-zA-Z]+/g, '')
        .replace(/[^\w\-]+/g, '-')
        .trim();
    return camelCase__default['default'](clean);
}

function getOperationParameter(openApi, parameter) {
    const operationParameter = {
        in: parameter.in,
        prop: parameter.name,
        export: 'interface',
        name: getOperationParameterName(parameter.name),
        type: PrimaryType.OBJECT,
        base: PrimaryType.OBJECT,
        template: null,
        link: null,
        description: getComment(parameter.description),
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
        extends: [],
        enum: [],
        enums: [],
        properties: [],
    };
    if (parameter.$ref) {
        const definitionRef = getType(parameter.$ref);
        operationParameter.export = 'reference';
        operationParameter.type = definitionRef.type;
        operationParameter.base = definitionRef.base;
        operationParameter.template = definitionRef.template;
        operationParameter.imports.push(...definitionRef.imports);
        operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
        return operationParameter;
    }
    if (parameter.enum) {
        const enumerators = getEnum(parameter.enum);
        const extendedEnumerators = extendEnum(enumerators, parameter);
        if (extendedEnumerators.length) {
            operationParameter.export = 'enum';
            operationParameter.type = PrimaryType.STRING;
            operationParameter.base = PrimaryType.STRING;
            operationParameter.enum.push(...extendedEnumerators);
            operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
            return operationParameter;
        }
    }
    if ((parameter.type === 'int' || parameter.type === 'integer') && parameter.description) {
        const enumerators = getEnumFromDescription(parameter.description);
        if (enumerators.length) {
            operationParameter.export = 'enum';
            operationParameter.type = PrimaryType.NUMBER;
            operationParameter.base = PrimaryType.NUMBER;
            operationParameter.enum.push(...enumerators);
            operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
            return operationParameter;
        }
    }
    if (parameter.type === 'array' && parameter.items) {
        const items = getType(parameter.items.type);
        operationParameter.export = 'array';
        operationParameter.type = items.type;
        operationParameter.base = items.base;
        operationParameter.template = items.template;
        operationParameter.imports.push(...items.imports);
        operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
        return operationParameter;
    }
    if (parameter.type === 'object' && parameter.items) {
        const items = getType(parameter.items.type);
        operationParameter.export = 'dictionary';
        operationParameter.type = items.type;
        operationParameter.base = items.base;
        operationParameter.template = items.template;
        operationParameter.imports.push(...items.imports);
        operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
        return operationParameter;
    }
    if (parameter.schema) {
        if (parameter.schema.$ref) {
            const model = getType(parameter.schema.$ref);
            operationParameter.export = 'reference';
            operationParameter.type = model.type;
            operationParameter.base = model.base;
            operationParameter.template = model.template;
            operationParameter.imports.push(...model.imports);
            operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
            return operationParameter;
        }
        else {
            const model = getModel(openApi, parameter.schema);
            operationParameter.export = model.export;
            operationParameter.type = model.type;
            operationParameter.base = model.base;
            operationParameter.template = model.template;
            operationParameter.link = model.link;
            operationParameter.imports.push(...model.imports);
            operationParameter.extends.push(...model.extends);
            operationParameter.enum.push(...model.enum);
            operationParameter.enums.push(...model.enums);
            operationParameter.properties.push(...model.properties);
            operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
            return operationParameter;
        }
    }
    // If the parameter has a type than it can be a basic or generic type.
    if (parameter.type) {
        const definitionType = getType(parameter.type);
        operationParameter.export = 'generic';
        operationParameter.type = definitionType.type;
        operationParameter.base = definitionType.base;
        operationParameter.template = definitionType.template;
        operationParameter.imports.push(...definitionType.imports);
        operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
        return operationParameter;
    }
    return operationParameter;
}

function getRef(openApi, item) {
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
        paths.forEach((path) => {
            if (result.hasOwnProperty(path)) {
                result = result[path];
            }
            else {
                throw new Error(`Could not find reference: "${item.$ref}"`);
            }
        });
        return result;
    }
    return item;
}

function sortByRequired(a, b) {
    const aNeedsValue = a.isRequired && a.default === undefined;
    const bNeedsValue = b.isRequired && b.default === undefined;
    if (aNeedsValue && !bNeedsValue)
        return -1;
    if (!aNeedsValue && bNeedsValue)
        return 1;
    return 0;
}

function getOperationParameters(openApi, parameters) {
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
        const parameterDef = getRef(openApi, parameterOrReference);
        const parameter = getOperationParameter(openApi, parameterDef);
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
    operationParameters.parameters = operationParameters.parameters.sort(sortByRequired);
    operationParameters.parametersPath = operationParameters.parametersPath.sort(sortByRequired);
    operationParameters.parametersQuery = operationParameters.parametersQuery.sort(sortByRequired);
    operationParameters.parametersForm = operationParameters.parametersForm.sort(sortByRequired);
    operationParameters.parametersCookie = operationParameters.parametersCookie.sort(sortByRequired);
    operationParameters.parametersHeader = operationParameters.parametersHeader.sort(sortByRequired);
    return operationParameters;
}

/**
 * Get the final service path, this replaces the "{api-version}" placeholder
 * with a new template string placeholder so we can dynamically inject the
 * OpenAPI version without the need to hardcode this in the URL.
 * Plus we return the correct parameter names to replace in the URL.
 * @param path
 */
function getOperationPath(path) {
    return path
        .replace(/\{(.*?)\}/g, (_, w) => {
        return `\${${getOperationParameterName(w)}}`;
    })
        .replace('${apiVersion}', '${OpenAPI.VERSION}');
}

function getOperationResponseHeader(operationResponses) {
    const header = operationResponses.find(operationResponses => {
        return operationResponses.in === 'header';
    });
    if (header) {
        return header.name;
    }
    return null;
}

function getOperationResponse(openApi, response, responseCode) {
    const operationResponse = {
        in: 'response',
        name: '',
        code: responseCode,
        description: getComment(response.description),
        export: 'generic',
        type: PrimaryType.OBJECT,
        base: PrimaryType.OBJECT,
        template: null,
        link: null,
        isDefinition: false,
        isReadOnly: false,
        isRequired: false,
        isNullable: false,
        imports: [],
        extends: [],
        enum: [],
        enums: [],
        properties: [],
    };
    // We support basic properties from response headers, since both
    // fetch and XHR client just support string types.
    if (response.headers) {
        for (const name in response.headers) {
            if (response.headers.hasOwnProperty(name)) {
                operationResponse.in = 'header';
                operationResponse.name = name;
                operationResponse.type = PrimaryType.STRING;
                operationResponse.base = PrimaryType.STRING;
                return operationResponse;
            }
        }
    }
    // If this response has a schema, then we need to check two things:
    // if this is a reference then the parameter is just the 'name' of
    // this reference type. Otherwise it might be a complex schema and
    // then we need to parse the schema!
    if (response.schema) {
        if (response.schema.$ref) {
            const model = getType(response.schema.$ref);
            operationResponse.export = 'reference';
            operationResponse.type = model.type;
            operationResponse.base = model.base;
            operationResponse.template = model.template;
            operationResponse.imports.push(...model.imports);
            return operationResponse;
        }
        else {
            const model = getModel(openApi, response.schema);
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
            operationResponse.extends.push(...model.extends);
            operationResponse.enum.push(...model.enum);
            operationResponse.enums.push(...model.enums);
            operationResponse.properties.push(...model.properties);
            return operationResponse;
        }
    }
    return operationResponse;
}

function getOperationResponseCode(value) {
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
}

function getOperationResponses(openApi, responses) {
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
}

function areEqual(a, b) {
    const equal = a.type === b.type && a.base === b.base && a.template === b.template;
    if (equal && a.link && b.link) {
        return areEqual(a.link, b.link);
    }
    return equal;
}
function getOperationResults(operationResponses) {
    const operationResults = [];
    operationResponses.forEach(operationResponse => {
        if (operationResponse.code && operationResponse.code >= 200 && operationResponse.code < 300) {
            operationResults.push(operationResponse);
        }
    });
    if (!operationResults.length) {
        operationResults.push({
            in: 'response',
            name: '',
            code: 200,
            description: '',
            export: 'interface',
            type: PrimaryType.OBJECT,
            base: PrimaryType.OBJECT,
            template: null,
            link: null,
            isDefinition: false,
            isReadOnly: false,
            isRequired: false,
            isNullable: false,
            imports: [],
            extends: [],
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
}

/**
 * Convert the input value to a correct service classname. This converts
 * the input string to PascalCase and appends the "Service" prefix if needed.
 */
function getServiceClassName(value) {
    const clean = value
        .replace(/^[^a-zA-Z]+/g, '')
        .replace(/[^\w\-]+/g, '-')
        .trim();
    const name = camelCase__default['default'](clean, { pascalCase: true });
    if (name && !name.endsWith('Service')) {
        return `${name}Service`;
    }
    return name;
}

function getOperation(openApi, url, method, op, pathParams) {
    const serviceName = (op.tags && op.tags[0]) || 'Service';
    const serviceClassName = getServiceClassName(serviceName);
    const operationNameFallback = `${method}${serviceClassName}`;
    const operationName = getOperationName(op.operationId || operationNameFallback);
    const operationPath = getOperationPath(url);
    // Create a new operation object for this method.
    const operation = {
        service: serviceClassName,
        name: operationName,
        summary: getComment(op.summary),
        description: getComment(op.description),
        deprecated: op.deprecated === true,
        method: method.toUpperCase(),
        path: operationPath,
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
    return operation;
}

/**
 * Get the OpenAPI services
 */
function getServices(openApi) {
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
                        case Method.GET:
                        case Method.PUT:
                        case Method.POST:
                        case Method.DELETE:
                        case Method.OPTIONS:
                        case Method.HEAD:
                        case Method.PATCH:
                            // Each method contains an OpenAPI operation, we parse the operation
                            const op = path[method];
                            const operation = getOperation(openApi, url, method, op, pathParams);
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
                            break;
                    }
                }
            }
        }
    }
    return Array.from(services.values());
}

/**
 * Convert the service version to 'normal' version.
 * This basically removes any "v" prefix from the version string.
 * @param version
 */
function getServiceVersion(version = '1.0') {
    return version.replace(/^v/gi, '');
}

/**
 * Parse the OpenAPI specification to a Client model that contains
 * all the models, services and schema's we should output.
 * @param openApi The OpenAPI spec  that we have loaded from disk.
 */
function parse(openApi) {
    const version = getServiceVersion(openApi.info.version);
    const server = getServer(openApi);
    const models = getModels(openApi);
    const services = getServices(openApi);
    return { version, server, models, services };
}

var PrimaryType$1;
(function (PrimaryType) {
    PrimaryType["FILE"] = "File";
    PrimaryType["OBJECT"] = "any";
    PrimaryType["ARRAY"] = "any[]";
    PrimaryType["BOOLEAN"] = "boolean";
    PrimaryType["NUMBER"] = "number";
    PrimaryType["STRING"] = "string";
    PrimaryType["VOID"] = "void";
    PrimaryType["NULL"] = "null";
})(PrimaryType$1 || (PrimaryType$1 = {}));
const TYPE_MAPPINGS$1 = new Map([
    ['file', PrimaryType$1.FILE],
    ['any', PrimaryType$1.OBJECT],
    ['object', PrimaryType$1.OBJECT],
    ['array', PrimaryType$1.ARRAY],
    ['boolean', PrimaryType$1.BOOLEAN],
    ['byte', PrimaryType$1.NUMBER],
    ['int', PrimaryType$1.NUMBER],
    ['int32', PrimaryType$1.NUMBER],
    ['int64', PrimaryType$1.NUMBER],
    ['integer', PrimaryType$1.NUMBER],
    ['float', PrimaryType$1.NUMBER],
    ['double', PrimaryType$1.NUMBER],
    ['short', PrimaryType$1.NUMBER],
    ['long', PrimaryType$1.NUMBER],
    ['number', PrimaryType$1.NUMBER],
    ['char', PrimaryType$1.STRING],
    ['date', PrimaryType$1.STRING],
    ['date-time', PrimaryType$1.STRING],
    ['password', PrimaryType$1.STRING],
    ['string', PrimaryType$1.STRING],
    ['void', PrimaryType$1.VOID],
    ['null', PrimaryType$1.NULL],
]);
var Method$1;
(function (Method) {
    Method["GET"] = "get";
    Method["PUT"] = "put";
    Method["POST"] = "post";
    Method["DELETE"] = "delete";
    Method["OPTIONS"] = "options";
    Method["HEAD"] = "head";
    Method["PATCH"] = "patch";
})(Method$1 || (Method$1 = {}));
var ContentType;
(function (ContentType) {
    ContentType["APPLICATION_JSON_PATCH"] = "application/json-patch+json";
    ContentType["APPLICATION_JSON"] = "application/json";
    ContentType["TEXT_JSON"] = "text/json";
    ContentType["TEXT_PAIN"] = "text/plain";
    ContentType["MULTIPART_MIXED"] = "multipart/mixed";
    ContentType["MULTIPART_RELATED"] = "multipart/related";
    ContentType["MULTIPART_BATCH"] = "multipart/batch";
})(ContentType || (ContentType = {}));

/**
 * Extend the enum with the x-enum properties. This adds the capability
 * to use names and descriptions inside the generated enums.
 * @param enumerators
 * @param definition
 */
function extendEnum$1(enumerators, definition) {
    const names = definition['x-enum-varnames'];
    const descriptions = definition['x-enum-descriptions'];
    return enumerators.map((enumerator, index) => ({
        name: (names && names[index]) || enumerator.name,
        description: (descriptions && descriptions[index]) || enumerator.description,
        value: enumerator.value,
        type: enumerator.type,
    }));
}

/**
 * Cleanup comment and prefix multiline comments with "*",
 * so they look a bit nicer when used in the generated code.
 * @param comment
 */
function getComment$1(comment) {
    if (comment) {
        return comment.replace(/\r?\n(.*)/g, (_, w) => `${os.EOL} * ${w.trim()}`);
    }
    return null;
}

/**
 * Check if a value is defined
 * @param value
 */
function isDefined$1(value) {
    return value !== undefined && value !== null && value !== '';
}

function getEnum$1(values) {
    if (Array.isArray(values)) {
        return values
            .filter((value, index, arr) => {
            return arr.indexOf(value) === index;
        })
            .filter(isDefined$1)
            .map(value => {
            if (typeof value === 'number') {
                return {
                    name: `_${value}`,
                    value: String(value),
                    type: PrimaryType$1.NUMBER,
                    description: null,
                };
            }
            return {
                name: value
                    .replace(/\W+/g, '_')
                    .replace(/^(\d+)/g, '_$1')
                    .replace(/([a-z])([A-Z]+)/g, '$1_$2')
                    .toUpperCase(),
                value: `'${value}'`,
                type: PrimaryType$1.STRING,
                description: null,
            };
        });
    }
    return [];
}

function getEnumFromDescription$1(description) {
    // Check if we can find this special format string:
    // None=0,Something=1,AnotherThing=2
    if (/^(\w+=[0-9]+,?)+$/g.test(description)) {
        const matches = description.match(/(\w+=[0-9]+,?)/g);
        if (matches) {
            // Grab the values from the description
            const symbols = [];
            matches.forEach(match => {
                const name = match.split('=')[0];
                const value = parseInt(match.split('=')[1].replace(/[^0-9]/g, ''));
                if (name && Number.isInteger(value)) {
                    symbols.push({
                        name: name
                            .replace(/\W+/g, '_')
                            .replace(/^(\d+)/g, '_$1')
                            .replace(/([a-z])([A-Z]+)/g, '$1_$2')
                            .toUpperCase(),
                        value: String(value),
                        type: PrimaryType$1.NUMBER,
                        description: null,
                    });
                }
            });
            // Filter out any duplicate names
            return symbols.filter((symbol, index, arr) => {
                return arr.map(item => item.name).indexOf(symbol.name) === index;
            });
        }
    }
    return [];
}

function getModelDefault(definition, model) {
    if (definition.default === undefined) {
        return;
    }
    if (definition.default === null) {
        return 'null';
    }
    const type = definition.type || typeof definition.default;
    switch (type) {
        case 'int':
        case 'integer':
        case 'number':
            if (model && model.export == 'enum' && model.enum.length && model.enum[definition.default]) {
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
    return;
}

function escapeName$1(value) {
    if (value) {
        const validName = /^[a-zA-Z_$][\w$]+$/g.test(value);
        if (!validName) {
            return `'${value}'`;
        }
    }
    return value;
}

/**
 * The spec generates a pattern like this '^\d{3}-\d{2}-\d{4}$'
 * However, to use it in HTML or inside new RegExp() we need to
 * escape the pattern to become: '^\\d{3}-\\d{2}-\\d{4}$' in order
 * to make it a valid regexp string.
 * @param pattern
 */
function getPattern$1(pattern) {
    return pattern === null || pattern === void 0 ? void 0 : pattern.replace(/\\/g, '\\\\');
}

/**
 * Get mapped type for given type to any basic Typescript/Javascript type.
 */
function getMappedType$1(type) {
    const mapped = TYPE_MAPPINGS$1.get(type.toLowerCase());
    if (mapped) {
        return mapped;
    }
    return type;
}
function hasMappedType$1(type) {
    return TYPE_MAPPINGS$1.has(type.toLowerCase());
}

/**
 * Strip (OpenAPI) namespaces fom values.
 * @param value
 */
function stripNamespace$1(value) {
    return (value
        .trim()
        .replace(/^#\/components\/schemas\//, '')
        .replace(/^#\/components\/responses\//, '')
        .replace(/^#\/components\/parameters\//, '')
        .replace(/^#\/components\/examples\//, '')
        .replace(/^#\/components\/requestBodies\//, '')
        .replace(/^#\/components\/headers\//, '')
        .replace(/^#\/components\/securitySchemes\//, '')
        .replace(/^#\/components\/links\//, '')
        .replace(/^#\/components\/callbacks\//, '')
        // First we remove the namespace from template notation:
        // Example: namespace.Template[namespace.Model] -> namespace.Template[Model]
        .replace(/(\[.*\]$)/, (s) => {
        const v = s.replace('[', '').replace(']', '').split('.').pop();
        return `[${v}]`;
    })
        // Then we remove the namespace from the complete result:
        // Example: namespace.Template[Model] -> Template[Model]
        .replace(/.*/, (s) => {
        return s.split('.').pop();
    }));
}

/**
 * Parse any string value into a type object.
 * @param value String value like "integer" or "Link[Model]".
 * @param template Optional template class from parent (needed to process generics)
 */
function getType$1(value, template) {
    const result = {
        type: PrimaryType$1.OBJECT,
        base: PrimaryType$1.OBJECT,
        template: null,
        imports: [],
    };
    const valueClean = stripNamespace$1(value || '');
    if (/\[.*\]$/g.test(valueClean)) {
        const matches = valueClean.match(/(.*?)\[(.*)\]$/);
        if (matches && matches.length) {
            const match1 = getType$1(matches[1]);
            const match2 = getType$1(matches[2]);
            if (match1.type === PrimaryType$1.ARRAY) {
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
        }
    }
    else if (hasMappedType$1(valueClean)) {
        const mapped = getMappedType$1(valueClean);
        result.type = mapped;
        result.base = mapped;
    }
    else if (valueClean) {
        result.type = valueClean;
        result.base = valueClean;
        result.imports.push(valueClean);
    }
    // If the property that we found matched the parent template class
    // Then ignore this whole property and return it as a "T" template property.
    if (result.type === template) {
        result.type = 'T'; // Template;
        result.base = 'T'; // Template;
        result.imports = [];
    }
    return result;
}

function getModelProperties$1(openApi, definition, getModel) {
    const models = [];
    for (const propertyName in definition.properties) {
        if (definition.properties.hasOwnProperty(propertyName)) {
            const property = definition.properties[propertyName];
            const propertyRequired = definition.required && definition.required.includes(propertyName);
            if (property.$ref) {
                const model = getType$1(property.$ref);
                models.push({
                    name: escapeName$1(propertyName),
                    export: 'reference',
                    type: model.type,
                    base: model.base,
                    template: model.template,
                    link: null,
                    description: getComment$1(property.description),
                    isDefinition: false,
                    isReadOnly: property.readOnly === true,
                    isRequired: propertyRequired === true,
                    isNullable: property.nullable === true,
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
                    pattern: getPattern$1(property.pattern),
                    imports: model.imports,
                    extends: [],
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
                    description: getComment$1(property.description),
                    isDefinition: false,
                    isReadOnly: property.readOnly === true,
                    isRequired: propertyRequired === true,
                    isNullable: property.nullable === true,
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
                    pattern: getPattern$1(property.pattern),
                    imports: model.imports,
                    extends: model.extends,
                    enum: model.enum,
                    enums: model.enums,
                    properties: model.properties,
                });
            }
        }
    }
    return models;
}

function getModel$1(openApi, definition, isDefinition = false, name = '') {
    const model = {
        name: name,
        export: 'interface',
        type: PrimaryType$1.OBJECT,
        base: PrimaryType$1.OBJECT,
        template: null,
        link: null,
        description: getComment$1(definition.description),
        isDefinition: isDefinition,
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
        pattern: getPattern$1(definition.pattern),
        imports: [],
        extends: [],
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
        model.default = getModelDefault(definition, model);
        return model;
    }
    if (definition.enum) {
        const enumerators = getEnum$1(definition.enum);
        const extendedEnumerators = extendEnum$1(enumerators, definition);
        if (extendedEnumerators.length) {
            model.export = 'enum';
            model.type = PrimaryType$1.STRING;
            model.base = PrimaryType$1.STRING;
            model.enum.push(...extendedEnumerators);
            model.default = getModelDefault(definition, model);
            return model;
        }
    }
    if ((definition.type === 'int' || definition.type === 'integer') && definition.description) {
        const enumerators = getEnumFromDescription$1(definition.description);
        if (enumerators.length) {
            model.export = 'enum';
            model.type = PrimaryType$1.NUMBER;
            model.base = PrimaryType$1.NUMBER;
            model.enum.push(...enumerators);
            model.default = getModelDefault(definition, model);
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
            model.default = getModelDefault(definition, model);
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
            model.default = getModelDefault(definition, model);
            return model;
        }
    }
    if (definition.type === 'object' && definition.additionalProperties && typeof definition.additionalProperties === 'object') {
        if (definition.additionalProperties.$ref) {
            const additionalProperties = getType$1(definition.additionalProperties.$ref);
            model.export = 'dictionary';
            model.type = additionalProperties.type;
            model.base = additionalProperties.base;
            model.template = additionalProperties.template;
            model.imports.push(...additionalProperties.imports);
            model.default = getModelDefault(definition, model);
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
            model.default = getModelDefault(definition, model);
            return model;
        }
    }
    if (definition.anyOf && definition.anyOf.length) {
        model.export = 'generic';
        const compositionItems = definition.anyOf
            .map(d => getModel$1(openApi, d));
        const composition = compositionItems
            .map(t => {
            if (t.enum.length > 0) {
                return t.enum.map(e => e.value).join(' | ');
            }
            if (t.properties.length > 0) {
                return t.properties.length === 1 ? t.properties.map(p => `{ ${p.name}: ${getType$1(p.type).type} }`) : `{ ${t.properties.map(p => `${p.name}: ${getType$1(p.type).type} `)} }`;
            }
            return t.type;
        })
            .sort()
            .join(' | ');
        model.type = composition;
        model.base = composition;
        const iter = compositionItems.reduce((prev, cur) => {
            return {
                imports: [...(prev.imports || []), ...cur.imports],
                extends: [...(prev.extends || []), ...cur.extends],
                enum: [...(prev.enum || []), ...cur.enum],
                enums: [...(prev.enums || []), ...cur.enums],
                properties: [...(prev.properties || []), ...cur.properties],
            };
        }, {});
        model.imports = iter.imports;
        model.extends = iter.extends;
        model.enum = iter.enum;
        model.enums = iter.enums;
        model.properties = iter.properties;
        return model;
    }
    if (definition.oneOf && definition.oneOf.length) {
        model.export = 'generic';
        const compositionItems = definition.oneOf
            .map(d => getModel$1(openApi, d));
        const composition = compositionItems
            .map(t => {
            if (t.enum.length > 0) {
                return t.enum.map(e => e.value).join(' | ');
            }
            if (t.properties.length > 0) {
                return t.properties.length === 1 ? t.properties.map(p => `{ ${p.name}: ${getType$1(p.type).type} }`) : `{ ${t.properties.map(p => `${p.name}: ${getType$1(p.type).type} `)} }`;
            }
            return t.type;
        })
            .sort()
            .join(' | ');
        model.type = composition;
        model.base = composition;
        const iter = compositionItems.reduce((prev, cur) => {
            return {
                imports: [...(prev.imports || []), ...cur.imports],
                extends: [...(prev.extends || []), ...cur.extends],
                enum: [...(prev.enum || []), ...cur.enum],
                enums: [...(prev.enums || []), ...cur.enums],
                properties: [...(prev.properties || []), ...cur.properties],
            };
        }, {});
        model.imports = iter.imports;
        model.extends = iter.extends;
        model.enum = iter.enum;
        model.enums = iter.enums;
        model.properties = iter.properties;
        return model;
    }
    if (definition.type === 'object' || definition.allOf) {
        model.export = 'interface';
        model.type = PrimaryType$1.OBJECT;
        model.base = PrimaryType$1.OBJECT;
        model.default = getModelDefault(definition, model);
        if (definition.allOf && definition.allOf.length) {
            definition.allOf.forEach(parent => {
                if (parent.$ref) {
                    const parentRef = getType$1(parent.$ref);
                    model.extends.push(parentRef.base);
                    model.imports.push(parentRef.base);
                }
                if (parent.type === 'object' && parent.properties) {
                    const properties = getModelProperties$1(openApi, parent, getModel$1);
                    properties.forEach(property => {
                        model.properties.push(property);
                        model.imports.push(...property.imports);
                        if (property.export === 'enum') {
                            model.enums.push(property);
                        }
                    });
                }
            });
        }
        if (definition.properties) {
            const properties = getModelProperties$1(openApi, definition, getModel$1);
            properties.forEach(property => {
                model.properties.push(property);
                model.imports.push(...property.imports);
                if (property.export === 'enum') {
                    model.enums.push(property);
                }
            });
        }
        return model;
    }
    // If the schema has a type than it can be a basic or generic type.
    if (definition.type) {
        const definitionType = getType$1(definition.type);
        model.export = 'generic';
        model.type = definitionType.type;
        model.base = definitionType.base;
        model.template = definitionType.template;
        model.imports.push(...definitionType.imports);
        model.default = getModelDefault(definition, model);
        return model;
    }
    return model;
}

function getModels$1(openApi) {
    const models = [];
    if (openApi.components) {
        for (const definitionName in openApi.components.schemas) {
            if (openApi.components.schemas.hasOwnProperty(definitionName)) {
                const definition = openApi.components.schemas[definitionName];
                const definitionType = getType$1(definitionName);
                const model = getModel$1(openApi, definition, true, definitionType.base);
                models.push(model);
            }
        }
    }
    return models;
}

function getServer$1(openApi) {
    const server = openApi.servers && openApi.servers[0];
    const variables = (server && server.variables) || {};
    let url = (server && server.url) || '';
    for (const variable in variables) {
        if (variables.hasOwnProperty(variable)) {
            url = url.replace(`{${variable}}`, variables[variable].default);
        }
    }
    return url;
}

function getOperationErrors$1(operationResponses) {
    return operationResponses
        .filter(operationResponse => {
        return operationResponse.code >= 300 && operationResponse.description;
    })
        .map(response => ({
        code: response.code,
        description: response.description,
    }));
}

/**
 * Convert the input value to a correct operation (method) classname.
 * This converts the input string to camelCase, so the method name follows
 * the most popular Javascript and Typescript writing style.
 */
function getOperationName$1(value) {
    const clean = value
        .replace(/^[^a-zA-Z]+/g, '')
        .replace(/[^\w\-]+/g, '-')
        .trim();
    return camelCase__default['default'](clean);
}

/**
 * Replaces any invalid characters from a parameter name.
 * For example: 'filter.someProperty' becomes 'filterSomeProperty'.
 */
function getOperationParameterName$1(value) {
    const clean = value
        .replace(/^[^a-zA-Z]+/g, '')
        .replace(/[^\w\-]+/g, '-')
        .trim();
    return camelCase__default['default'](clean);
}

function getOperationParameter$1(openApi, parameter) {
    const operationParameter = {
        in: parameter.in,
        prop: parameter.name,
        export: 'interface',
        name: getOperationParameterName$1(parameter.name),
        type: PrimaryType$1.OBJECT,
        base: PrimaryType$1.OBJECT,
        template: null,
        link: null,
        description: getComment$1(parameter.description),
        isDefinition: false,
        isReadOnly: false,
        isRequired: parameter.required === true,
        isNullable: parameter.nullable === true,
        imports: [],
        extends: [],
        enum: [],
        enums: [],
        properties: [],
    };
    if (parameter.$ref) {
        const definitionRef = getType$1(parameter.$ref);
        operationParameter.export = 'reference';
        operationParameter.type = definitionRef.type;
        operationParameter.base = definitionRef.base;
        operationParameter.template = definitionRef.template;
        operationParameter.imports.push(...definitionRef.imports);
        return operationParameter;
    }
    if (parameter.schema) {
        if (parameter.schema.$ref) {
            const model = getType$1(parameter.schema.$ref);
            operationParameter.export = 'reference';
            operationParameter.type = model.type;
            operationParameter.base = model.base;
            operationParameter.template = model.template;
            operationParameter.imports.push(...model.imports);
            operationParameter.default = getModelDefault(parameter.schema);
            return operationParameter;
        }
        else {
            const model = getModel$1(openApi, parameter.schema);
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
            operationParameter.pattern = getPattern$1(model.pattern);
            operationParameter.default = model.default;
            operationParameter.imports.push(...model.imports);
            operationParameter.extends.push(...model.extends);
            operationParameter.enum.push(...model.enum);
            operationParameter.enums.push(...model.enums);
            operationParameter.properties.push(...model.properties);
            return operationParameter;
        }
    }
    return operationParameter;
}

function getRef$1(openApi, item) {
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
        paths.forEach((path) => {
            if (result.hasOwnProperty(path)) {
                result = result[path];
            }
            else {
                throw new Error(`Could not find reference: "${item.$ref}"`);
            }
        });
        return result;
    }
    return item;
}

function sortByRequired$1(a, b) {
    const aNeedsValue = a.isRequired && a.default === undefined;
    const bNeedsValue = b.isRequired && b.default === undefined;
    if (aNeedsValue && !bNeedsValue)
        return -1;
    if (!aNeedsValue && bNeedsValue)
        return 1;
    return 0;
}

function getOperationParameters$1(openApi, parameters) {
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
    operationParameters.parameters = operationParameters.parameters.sort(sortByRequired$1);
    operationParameters.parametersPath = operationParameters.parametersPath.sort(sortByRequired$1);
    operationParameters.parametersQuery = operationParameters.parametersQuery.sort(sortByRequired$1);
    operationParameters.parametersForm = operationParameters.parametersForm.sort(sortByRequired$1);
    operationParameters.parametersCookie = operationParameters.parametersCookie.sort(sortByRequired$1);
    operationParameters.parametersHeader = operationParameters.parametersHeader.sort(sortByRequired$1);
    return operationParameters;
}

/**
 * Get the final service path, this replaces the "{api-version}" placeholder
 * with a new template string placeholder so we can dynamically inject the
 * OpenAPI version without the need to hardcode this in the URL.
 * Plus we return the correct parameter names to replace in the URL.
 * @param path
 */
function getOperationPath$1(path) {
    return path
        .replace(/\{(.*?)\}/g, (_, w) => {
        return `\${${getOperationParameterName$1(w)}}`;
    })
        .replace('${apiVersion}', '${OpenAPI.VERSION}');
}

function getContent(openApi, content) {
    /* prettier-ignore */
    return (content[ContentType.APPLICATION_JSON_PATCH] &&
        content[ContentType.APPLICATION_JSON_PATCH].schema) || (content[ContentType.APPLICATION_JSON] &&
        content[ContentType.APPLICATION_JSON].schema) || (content[ContentType.TEXT_JSON] &&
        content[ContentType.TEXT_JSON].schema) || (content[ContentType.TEXT_PAIN] &&
        content[ContentType.TEXT_PAIN].schema) || (content[ContentType.MULTIPART_MIXED] &&
        content[ContentType.MULTIPART_MIXED].schema) || (content[ContentType.MULTIPART_RELATED] &&
        content[ContentType.MULTIPART_RELATED].schema) || (content[ContentType.MULTIPART_BATCH] &&
        content[ContentType.MULTIPART_BATCH].schema) || null;
}

function getOperationRequestBody(openApi, parameter) {
    const requestBody = {
        in: 'body',
        prop: 'body',
        export: 'interface',
        name: 'requestBody',
        type: PrimaryType$1.OBJECT,
        base: PrimaryType$1.OBJECT,
        template: null,
        link: null,
        description: getComment$1(parameter.description),
        default: undefined,
        isDefinition: false,
        isReadOnly: false,
        isRequired: parameter.required === true,
        isNullable: parameter.nullable === true,
        imports: [],
        extends: [],
        enum: [],
        enums: [],
        properties: [],
    };
    if (parameter.content) {
        const schema = getContent(openApi, parameter.content);
        if (schema) {
            if (schema && schema.$ref) {
                const model = getType$1(schema.$ref);
                requestBody.export = 'reference';
                requestBody.type = model.type;
                requestBody.base = model.base;
                requestBody.template = model.template;
                requestBody.imports.push(...model.imports);
                return requestBody;
            }
            else {
                const model = getModel$1(openApi, schema);
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
                requestBody.pattern = getPattern$1(model.pattern);
                requestBody.imports.push(...model.imports);
                requestBody.extends.push(...model.extends);
                requestBody.enum.push(...model.enum);
                requestBody.enums.push(...model.enums);
                requestBody.properties.push(...model.properties);
                return requestBody;
            }
        }
    }
    return requestBody;
}

function getOperationResponseHeader$1(operationResponses) {
    const header = operationResponses.find(operationResponses => {
        return operationResponses.in === 'header';
    });
    if (header) {
        return header.name;
    }
    return null;
}

function getOperationResponse$1(openApi, response, responseCode) {
    const operationResponse = {
        in: 'response',
        name: '',
        code: responseCode,
        description: getComment$1(response.description),
        export: 'generic',
        type: PrimaryType$1.OBJECT,
        base: PrimaryType$1.OBJECT,
        template: null,
        link: null,
        isDefinition: false,
        isReadOnly: false,
        isRequired: false,
        isNullable: false,
        imports: [],
        extends: [],
        enum: [],
        enums: [],
        properties: [],
    };
    // We support basic properties from response headers, since both
    // fetch and XHR client just support string types.
    if (response.headers) {
        for (const name in response.headers) {
            if (response.headers.hasOwnProperty(name)) {
                operationResponse.in = 'header';
                operationResponse.name = name;
                operationResponse.type = PrimaryType$1.STRING;
                operationResponse.base = PrimaryType$1.STRING;
                return operationResponse;
            }
        }
    }
    if (response.content) {
        const schema = getContent(openApi, response.content);
        if (schema) {
            if (schema && schema.$ref) {
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
                operationResponse.pattern = getPattern$1(model.pattern);
                operationResponse.imports.push(...model.imports);
                operationResponse.extends.push(...model.extends);
                operationResponse.enum.push(...model.enum);
                operationResponse.enums.push(...model.enums);
                operationResponse.properties.push(...model.properties);
                return operationResponse;
            }
        }
    }
    return operationResponse;
}

function getOperationResponseCode$1(value) {
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
}

function getOperationResponses$1(openApi, responses) {
    const operationResponses = [];
    // Iterate over each response code and get the
    // status code and response message (if any).
    for (const code in responses) {
        if (responses.hasOwnProperty(code)) {
            const responseOrReference = responses[code];
            const response = getRef$1(openApi, responseOrReference);
            const responseCode = getOperationResponseCode$1(code);
            if (responseCode) {
                operationResponses.push(getOperationResponse$1(openApi, response, responseCode));
            }
        }
    }
    // Sort the responses to 2XX success codes come before 4XX and 5XX error codes.
    return operationResponses.sort((a, b) => {
        return a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
    });
}

function areEqual$1(a, b) {
    const equal = a.type === b.type && a.base === b.base && a.template === b.template;
    if (equal && a.link && b.link) {
        return areEqual$1(a.link, b.link);
    }
    return equal;
}
function getOperationResults$1(operationResponses) {
    const operationResults = [];
    operationResponses.forEach(operationResponse => {
        if (operationResponse.code && operationResponse.code >= 200 && operationResponse.code < 300) {
            operationResults.push(operationResponse);
        }
    });
    if (!operationResults.length) {
        operationResults.push({
            in: 'response',
            name: '',
            code: 200,
            description: '',
            export: 'interface',
            type: PrimaryType$1.OBJECT,
            base: PrimaryType$1.OBJECT,
            template: null,
            link: null,
            isDefinition: false,
            isReadOnly: false,
            isRequired: false,
            isNullable: false,
            imports: [],
            extends: [],
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
}

/**
 * Convert the input value to a correct service classname. This converts
 * the input string to PascalCase and appends the "Service" prefix if needed.
 */
function getServiceClassName$1(value) {
    const clean = value
        .replace(/^[^a-zA-Z]+/g, '')
        .replace(/[^\w\-]+/g, '-')
        .trim();
    const name = camelCase__default['default'](clean, { pascalCase: true });
    if (name && !name.endsWith('Service')) {
        return `${name}Service`;
    }
    return name;
}

function getOperation$1(openApi, url, method, op, pathParams) {
    const serviceName = (op.tags && op.tags[0]) || 'Service';
    const serviceClassName = getServiceClassName$1(serviceName);
    const operationNameFallback = `${method}${serviceClassName}`;
    const operationName = getOperationName$1(op.operationId || operationNameFallback);
    const operationPath = getOperationPath$1(url);
    // Create a new operation object for this method.
    const operation = {
        service: serviceClassName,
        name: operationName,
        summary: getComment$1(op.summary),
        description: getComment$1(op.description),
        deprecated: op.deprecated === true,
        method: method.toUpperCase(),
        path: operationPath,
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
    // TODO: form data goes wrong here: https://github.com/ferdikoomen/openapi-typescript-codegen/issues/257§
    if (op.requestBody) {
        const requestBodyDef = getRef$1(openApi, op.requestBody);
        const requestBody = getOperationRequestBody(openApi, requestBodyDef);
        operation.imports.push(...requestBody.imports);
        operation.parameters.push(requestBody);
        operation.parameters = operation.parameters.sort(sortByRequired$1);
        operation.parametersBody = requestBody;
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
    return operation;
}

/**
 * Get the OpenAPI services
 */
function getServices$1(openApi) {
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
                        case Method$1.GET:
                        case Method$1.PUT:
                        case Method$1.POST:
                        case Method$1.DELETE:
                        case Method$1.OPTIONS:
                        case Method$1.HEAD:
                        case Method$1.PATCH:
                            // Each method contains an OpenAPI operation, we parse the operation
                            const op = path[method];
                            const operation = getOperation$1(openApi, url, method, op, pathParams);
                            // If we have already declared a service, then we should fetch that and
                            // append the new method to it. Otherwise we should create a new service object.
                            const service = services.get(operation.service) ||
                                {
                                    name: operation.service,
                                    operations: [],
                                    imports: [],
                                };
                            // Push the operation in the service
                            service.operations.push(operation);
                            service.imports.push(...operation.imports);
                            services.set(operation.service, service);
                            break;
                    }
                }
            }
        }
    }
    return Array.from(services.values());
}

/**
 * Convert the service version to 'normal' version.
 * This basically removes any "v" prefix from the version string.
 * @param version
 */
function getServiceVersion$1(version = '1.0') {
    return version.replace(/^v/gi, '');
}

/**
 * Parse the OpenAPI specification to a Client model that contains
 * all the models, services and schema's we should output.
 * @param openApi The OpenAPI spec  that we have loaded from disk.
 */
function parse$1(openApi) {
    const version = getServiceVersion$1(openApi.info.version);
    const server = getServer$1(openApi);
    const models = getModels$1(openApi);
    const services = getServices$1(openApi);
    return { version, server, models, services };
}

// Wrapped file system calls
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const copyFile = util.promisify(fs.copyFile);
const exists = util.promisify(fs.exists);
// Re-export from mkdirp to make mocking easier
const mkdir = mkdirp__default['default'];
// Promisified version of rimraf
const rmdir = (path) => new Promise((resolve, reject) => {
    rimraf__default['default'](path, (error) => {
        if (error) {
            reject(error);
        }
        else {
            resolve();
        }
    });
});

/**
 * Check if given file exists and try to read the content as string.
 * @param input
 */
async function readSpecFromDisk(input) {
    const filePath = path.resolve(process.cwd(), input);
    const fileExists = await exists(filePath);
    if (fileExists) {
        try {
            const content = await readFile(filePath, 'utf8');
            return content.toString();
        }
        catch (e) {
            throw new Error(`Could not read OpenApi spec: "${filePath}"`);
        }
    }
    throw new Error(`Could not find OpenApi spec: "${filePath}"`);
}

/**
 * Download the spec file from a HTTP resource
 * @param url
 */
async function readSpecFromHttp(url) {
    return new Promise((resolve, reject) => {
        http.get(url, response => {
            let body = '';
            response.on('data', chunk => {
                body += chunk;
            });
            response.on('end', () => {
                resolve(body);
            });
            response.on('error', () => {
                reject(`Could not read OpenApi spec: "${url}"`);
            });
        });
    });
}

/**
 * Download the spec file from a HTTPS resource
 * @param url
 */
async function readSpecFromHttps(url) {
    return new Promise((resolve, reject) => {
        https.get(url, response => {
            let body = '';
            response.on('data', chunk => {
                body += chunk;
            });
            response.on('end', () => {
                resolve(body);
            });
            response.on('error', () => {
                reject(`Could not read OpenApi spec: "${url}"`);
            });
        });
    });
}

async function readSpec(input) {
    if (input.startsWith('https://')) {
        return await readSpecFromHttps(input);
    }
    if (input.startsWith('http://')) {
        return await readSpecFromHttp(input);
    }
    return await readSpecFromDisk(input);
}

/**
 * Load and parse te open api spec. If the file extension is ".yml" or ".yaml"
 * we will try to parse the file as a YAML spec, otherwise we will fallback
 * on parsing the file as JSON.
 * @param input
 */
async function getOpenApiSpec(input) {
    const extension = path.extname(input).toLowerCase();
    const content = await readSpec(input);
    switch (extension) {
        case '.yml':
        case '.yaml':
            try {
                return yaml.safeLoad(content);
            }
            catch (e) {
                throw new Error(`Could not parse OpenApi YAML: "${input}"`);
            }
        default:
            try {
                return JSON.parse(content);
            }
            catch (e) {
                throw new Error(`Could not parse OpenApi JSON: "${input}"`);
            }
    }
}

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
function getOpenApiVersion(openApi) {
    const info = openApi.swagger || openApi.openapi;
    if (info && typeof info === 'string') {
        const c = info.charAt(0);
        const v = Number.parseInt(c);
        if (v === OpenApiVersion.V2 || v === OpenApiVersion.V3) {
            return v;
        }
    }
    throw new Error(`Unsupported Open API version: "${String(info)}"`);
}

function isString(val) {
    return typeof val === 'string';
}

/**
 * Set unique enum values for the model
 * @param model
 */
function postProcessModelEnum(model) {
    return model.enum.filter((property, index, arr) => {
        return arr.findIndex(item => item.name === property.name) === index;
    });
}

/**
 * Set unique enum values for the model
 * @param model The model that is post-processed
 */
function postProcessModelEnums(model) {
    return model.enums.filter((property, index, arr) => {
        return arr.findIndex(item => item.name === property.name) === index;
    });
}

function sort(a, b) {
    const nameA = a.toLowerCase();
    const nameB = b.toLowerCase();
    return nameA.localeCompare(nameB, 'en');
}

function unique(val, index, arr) {
    return arr.indexOf(val) === index;
}

/**
 * Set unique imports, sorted by name
 * @param model The model that is post-processed
 */
function postProcessModelImports(model) {
    return model.imports
        .filter(unique)
        .sort(sort)
        .filter(name => model.name !== name);
}

/**
 * Post process the model.
 * This will cleanup any double imports or enum values.
 * @param model
 */
function postProcessModel(model) {
    return Object.assign(Object.assign({}, model), { imports: postProcessModelImports(model), enums: postProcessModelEnums(model), enum: postProcessModelEnum(model) });
}

/**
 * Set unique imports, sorted by name
 * @param service
 */
function postProcessServiceImports(service) {
    return service.imports
        .filter(unique)
        .sort(sort)
        .filter(name => service.name !== name);
}

/**
 * Calls a defined callback function on each element of an array.
 * Then, flattens the result into a new array.
 */
function flatMap(array, callback) {
    const result = [];
    array.map(callback).forEach(arr => {
        result.push(...arr);
    });
    return result;
}

function postProcessServiceOperations(service) {
    const names = new Map();
    return service.operations.map(operation => {
        const clone = Object.assign({}, operation);
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
}

function postProcessService(service) {
    const clone = Object.assign({}, service);
    clone.operations = postProcessServiceOperations(clone);
    clone.operations.forEach(operation => {
        clone.imports.push(...operation.imports);
    });
    clone.imports = postProcessServiceImports(clone);
    return clone;
}

/**
 * Post process client
 * @param client Client object with all the models, services, etc.
 */
function postProcessClient(client) {
    return Object.assign(Object.assign({}, client), { models: client.models.map(model => postProcessModel(model)), services: client.services.map(service => postProcessService(service)) });
}

var templateCoreApiError = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport type { ApiResult } from './ApiResult';\n\nexport class ApiError extends Error {\n    public readonly url: string;\n    public readonly status: number;\n    public readonly statusText: string;\n    public readonly body: any;\n\n    constructor(response: ApiResult, message: string) {\n        super(message);\n\n        this.url = response.url;\n        this.status = response.status;\n        this.statusText = response.statusText;\n        this.body = response.body;\n    }\n}";
},"usePartial":true,"useData":true};

var templateCoreApiRequestOptions = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nexport interface ApiRequestOptions {\n    readonly method: 'GET' | 'PUT' | 'POST' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PATCH';\n    readonly path: string;\n    readonly cookies?: Record<string, any>;\n    readonly headers?: Record<string, any>;\n    readonly query?: Record<string, any>;\n    readonly formData?: Record<string, any>;\n    readonly body?: any;\n    readonly responseHeader?: string;\n    readonly errors?: Record<number, string>;\n}";
},"usePartial":true,"useData":true};

var templateCoreApiResult = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nexport interface ApiResult {\n    readonly url: string;\n    readonly ok: boolean;\n    readonly status: number;\n    readonly statusText: string;\n    readonly body: any;\n}";
},"usePartial":true,"useData":true};

var fetchGetHeaders = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "async function getHeaders(options: ApiRequestOptions): Promise<Headers> {\n    const headers = new Headers({\n        Accept: 'application/json',\n        ...options.headers,\n    });\n\n    const token = await getToken();\n    if (isDefined(token) && token !== '') {\n        headers.append('Authorization', `Bearer ${token}`);\n    }\n\n    if (options.body) {\n        if (isBlob(options.body)) {\n            headers.append('Content-Type', options.body.type || 'application/octet-stream');\n        } else if (isString(options.body)) {\n            headers.append('Content-Type', 'text/plain');\n        } else {\n            headers.append('Content-Type', 'application/json');\n        }\n    }\n    return headers;\n}";
},"useData":true};

var fetchGetRequestBody = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function getRequestBody(options: ApiRequestOptions): BodyInit | undefined {\n    if (options.formData) {\n        return getFormData(options.formData);\n    }\n    if (options.body) {\n        if (isString(options.body) || isBlob(options.body)) {\n            return options.body;\n        } else {\n            return JSON.stringify(options.body);\n        }\n    }\n    return undefined;\n}";
},"useData":true};

var fetchGetResponseBody = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "async function getResponseBody(response: Response): Promise<any> {\n    try {\n        const contentType = response.headers.get('Content-Type');\n        if (contentType) {\n            const isJSON = contentType.toLowerCase().startsWith('application/json');\n            if (isJSON) {\n                return await response.json();\n            } else {\n                return await response.text();\n            }\n        }\n    } catch (error) {\n        console.error(error);\n    }\n    return null;\n}";
},"useData":true};

var fetchGetResponseHeader = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function getResponseHeader(response: Response, responseHeader?: string): string | null {\n    if (responseHeader) {\n        const content = response.headers.get(responseHeader);\n        if (isString(content)) {\n            return content;\n        }\n    }\n    return null;\n}";
},"useData":true};

var fetchRequest = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport { ApiError } from './ApiError';\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { ApiResult } from './ApiResult';\nimport { OpenAPI } from './OpenAPI';\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isDefined"),depth0,{"name":"functions/isDefined","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isString"),depth0,{"name":"functions/isString","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isBlob"),depth0,{"name":"functions/isBlob","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getQueryString"),depth0,{"name":"functions/getQueryString","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getUrl"),depth0,{"name":"functions/getUrl","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getFormData"),depth0,{"name":"functions/getFormData","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getToken"),depth0,{"name":"functions/getToken","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
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
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/catchErrors"),depth0,{"name":"functions/catchErrors","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n/**\n * Request using fetch client\n * @param options The request options from the the service\n * @result ApiResult\n * @throws ApiError\n */\nexport async function request(options: ApiRequestOptions): Promise<ApiResult> {\n    const url = getUrl(options);\n    const response = await sendRequest(options, url);\n    const responseBody = await getResponseBody(response);\n    const responseHeader = getResponseHeader(response, options.responseHeader);\n\n    const result: ApiResult = {\n        url,\n        ok: response.ok,\n        status: response.status,\n        statusText: response.statusText,\n        body: responseHeader || responseBody,\n    };\n\n    catchErrors(options, result);\n    return result;\n}";
},"usePartial":true,"useData":true};

var fetchSendRequest = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "async function sendRequest(options: ApiRequestOptions, url: string): Promise<Response> {\n    const request: RequestInit = {\n        method: options.method,\n        headers: await getHeaders(options),\n        body: getRequestBody(options),\n    };\n    return await fetch(url, request);\n}";
},"useData":true};

var functionCatchErrors = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function catchErrors(options: ApiRequestOptions, result: ApiResult): void {\n    const errors: Record<number, string> = {\n        400: 'Bad Request',\n        401: 'Unauthorized',\n        403: 'Forbidden',\n        404: 'Not Found',\n        500: 'Internal Server Error',\n        502: 'Bad Gateway',\n        503: 'Service Unavailable',\n        ...options.errors,\n    }\n\n    const error = errors[result.status];\n    if (error) {\n        throw new ApiError(result, error);\n    }\n\n    if (!result.ok) {\n        throw new ApiError(result, 'Generic Error');\n    }\n}";
},"useData":true};

var functionGetFormData = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function getFormData(params: Record<string, any>): FormData {\n    const formData = new FormData();\n    Object.keys(params).forEach(key => {\n        const value = params[key];\n        if (isDefined(value)) {\n            formData.append(key, value);\n        }\n    });\n    return formData;\n}";
},"useData":true};

var functionGetQueryString = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function getQueryString(params: Record<string, any>): string {\n    const qs: string[] = [];\n    Object.keys(params).forEach(key => {\n        const value = params[key];\n        if (isDefined(value)) {\n            if (Array.isArray(value)) {\n                value.forEach(value => {\n                    qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);\n                });\n            } else {\n                qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);\n            }\n        }\n    });\n    if (qs.length > 0) {\n        return `?${qs.join('&')}`;\n    }\n    return '';\n}";
},"useData":true};

var functionGetToken = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "async function getToken(): Promise<string> {\n    if (typeof OpenAPI.TOKEN === 'function') {\n        return OpenAPI.TOKEN();\n    }\n    return OpenAPI.TOKEN;\n}";
},"useData":true};

var functionGetUrl = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function getUrl(options: ApiRequestOptions): string {\n    const path = options.path.replace(/[:]/g, '_');\n    const url = `${OpenAPI.BASE}${path}`;\n\n    if (options.query) {\n        return `${url}${getQueryString(options.query)}`;\n    }\n    return url;\n}";
},"useData":true};

var functionIsBinary = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function isBinary(value: any): value is Buffer | ArrayBuffer | ArrayBufferView {\n    const isBuffer = Buffer.isBuffer(value);\n    const isArrayBuffer = types.isArrayBuffer(value);\n    const isArrayBufferView = types.isArrayBufferView(value);\n    return isBuffer || isArrayBuffer || isArrayBufferView;\n}";
},"useData":true};

var functionIsBlob = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function isBlob(value: any): value is Blob {\n    return value instanceof Blob;\n}";
},"useData":true};

var functionIsDefined = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function isDefined<T>(value: T | null | undefined): value is Exclude<T, null | undefined> {\n    return value !== undefined && value !== null;\n}";
},"useData":true};

var functionIsString = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function isString(value: any): value is string {\n    return typeof value === 'string';\n}";
},"useData":true};

var functionIsSuccess = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function isSuccess(status: number): boolean {\n    return status >= 200 && status < 300;\n}";
},"useData":true};

var nodeGetHeaders = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "async function getHeaders(options: ApiRequestOptions): Promise<Headers> {\n    const headers = new Headers({\n        Accept: 'application/json',\n        ...options.headers,\n    });\n\n    const token = await getToken();\n    if (isDefined(token) && token !== '') {\n        headers.append('Authorization', `Bearer ${token}`);\n    }\n\n    if (options.body) {\n        if (isBinary(options.body)) {\n            headers.append('Content-Type', 'application/octet-stream');\n        } else if (isString(options.body)) {\n            headers.append('Content-Type', 'text/plain');\n        } else {\n            headers.append('Content-Type', 'application/json');\n        }\n    }\n    return headers;\n}";
},"useData":true};

var nodeGetRequestBody = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function getRequestBody(options: ApiRequestOptions): BodyInit | undefined {\n    if (options.formData) {\n        return getFormData(options.formData);\n    }\n    if (options.body) {\n        if (isString(options.body) || isBinary(options.body)) {\n            return options.body;\n        } else {\n            return JSON.stringify(options.body);\n        }\n    }\n    return undefined;\n}";
},"useData":true};

var nodeGetResponseBody = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "async function getResponseBody(response: Response): Promise<any> {\n    try {\n        const contentType = response.headers.get('Content-Type');\n        if (contentType) {\n            const isJSON = contentType.toLowerCase().startsWith('application/json');\n            if (isJSON) {\n                return await response.json();\n            } else {\n                return await response.text();\n            }\n        }\n    } catch (error) {\n        console.error(error);\n    }\n    return null;\n}";
},"useData":true};

var nodeGetResponseHeader = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function getResponseHeader(response: Response, responseHeader?: string): string | null {\n    if (responseHeader) {\n        const content = response.headers.get(responseHeader);\n        if (isString(content)) {\n            return content;\n        }\n    }\n    return null;\n}";
},"useData":true};

var nodeRequest = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport * as FormData from 'form-data';\nimport fetch, { BodyInit, Headers, RequestInit, Response } from 'node-fetch';\nimport { types } from 'util';\n\nimport { ApiError } from './ApiError';\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { ApiResult } from './ApiResult';\nimport { OpenAPI } from './OpenAPI';\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isDefined"),depth0,{"name":"functions/isDefined","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isString"),depth0,{"name":"functions/isString","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isBinary"),depth0,{"name":"functions/isBinary","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getQueryString"),depth0,{"name":"functions/getQueryString","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getUrl"),depth0,{"name":"functions/getUrl","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getFormData"),depth0,{"name":"functions/getFormData","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getToken"),depth0,{"name":"functions/getToken","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
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
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/catchErrors"),depth0,{"name":"functions/catchErrors","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n/**\n* Request using node-fetch client\n* @param options The request options from the the service\n* @result ApiResult\n* @throws ApiError\n*/\nexport async function request(options: ApiRequestOptions): Promise<ApiResult> {\n    const url = getUrl(options);\n    const response = await sendRequest(options, url);\n    const responseBody = await getResponseBody(response);\n    const responseHeader = getResponseHeader(response, options.responseHeader);\n\n    const result: ApiResult = {\n        url,\n        ok: response.ok,\n        status: response.status,\n        statusText: response.statusText,\n        body: responseHeader || responseBody,\n    };\n\n    catchErrors(options, result);\n    return result;\n}";
},"usePartial":true,"useData":true};

var nodeSendRequest = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "async function sendRequest(options: ApiRequestOptions, url: string): Promise<Response> {\n    const request: RequestInit = {\n        method: options.method,\n        headers: await getHeaders(options),\n        body: getRequestBody(options),\n    };\n    return await fetch(url, request);\n}";
},"useData":true};

var templateCoreSettings = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\ninterface Config {\n    BASE: string;\n    VERSION: string;\n    WITH_CREDENTIALS: boolean;\n    TOKEN: string | (() => Promise<string>);\n}\n\nexport const OpenAPI: Config = {\n    BASE: '"
    + ((stack1 = alias2(alias1(depth0, "server", {"start":{"line":11,"column":14},"end":{"line":11,"column":20}} ), depth0)) != null ? stack1 : "")
    + "',\n    VERSION: '"
    + ((stack1 = alias2(alias1(depth0, "version", {"start":{"line":12,"column":17},"end":{"line":12,"column":24}} ), depth0)) != null ? stack1 : "")
    + "',\n    WITH_CREDENTIALS: false,\n    TOKEN: '',\n};";
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

  return ((stack1 = container.invokePartial(lookupProperty(partials,"node/request"),depth0,{"name":"node/request","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"fetch",{"name":"equals","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":65}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"xhr",{"name":"equals","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":2,"column":61}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"node",{"name":"equals","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":3,"column":63}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true};

var xhrGetHeaders = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "async function getHeaders(options: ApiRequestOptions): Promise<Headers> {\n    const headers = new Headers({\n        Accept: 'application/json',\n        ...options.headers,\n    });\n\n    const token = await getToken();\n    if (isDefined(token) && token !== '') {\n        headers.append('Authorization', `Bearer ${token}`);\n    }\n\n    if (options.body) {\n        if (isBlob(options.body)) {\n            headers.append('Content-Type', options.body.type || 'application/octet-stream');\n        } else if (isString(options.body)) {\n            headers.append('Content-Type', 'text/plain');\n        } else {\n            headers.append('Content-Type', 'application/json');\n        }\n    }\n    return headers;\n}";
},"useData":true};

var xhrGetRequestBody = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function getRequestBody(options: ApiRequestOptions): any {\n    if (options.formData) {\n        return getFormData(options.formData);\n    }\n    if (options.body) {\n        if (isString(options.body) || isBlob(options.body)) {\n            return options.body;\n        } else {\n            return JSON.stringify(options.body);\n        }\n    }\n    return undefined;\n}";
},"useData":true};

var xhrGetResponseBody = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function getResponseBody(xhr: XMLHttpRequest): any {\n    try {\n        const contentType = xhr.getResponseHeader('Content-Type');\n        if (contentType) {\n            const isJSON = contentType.toLowerCase().startsWith('application/json');\n            if (isJSON) {\n                return JSON.parse(xhr.responseText);\n            } else {\n                return xhr.responseText;\n            }\n        }\n    } catch (error) {\n        console.error(error);\n    }\n    return null;\n}";
},"useData":true};

var xhrGetResponseHeader = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function getResponseHeader(xhr: XMLHttpRequest, responseHeader?: string): string | null {\n    if (responseHeader) {\n        const content = xhr.getResponseHeader(responseHeader);\n        if (isString(content)) {\n            return content;\n        }\n    }\n    return null;\n}";
},"useData":true};

var xhrRequest = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport { ApiError } from './ApiError';\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { ApiResult } from './ApiResult';\nimport { OpenAPI } from './OpenAPI';\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isDefined"),depth0,{"name":"functions/isDefined","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isString"),depth0,{"name":"functions/isString","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isBlob"),depth0,{"name":"functions/isBlob","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isSuccess"),depth0,{"name":"functions/isSuccess","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getQueryString"),depth0,{"name":"functions/getQueryString","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getUrl"),depth0,{"name":"functions/getUrl","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getFormData"),depth0,{"name":"functions/getFormData","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getToken"),depth0,{"name":"functions/getToken","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
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
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/catchErrors"),depth0,{"name":"functions/catchErrors","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n/**\n * Request using XHR client\n * @param options The request options from the the service\n * @result ApiResult\n * @throws ApiError\n */\nexport async function request(options: ApiRequestOptions): Promise<ApiResult> {\n    const url = getUrl(options);\n    const response = await sendRequest(options, url);\n    const responseBody = getResponseBody(response);\n    const responseHeader = getResponseHeader(response, options.responseHeader);\n\n    const result: ApiResult = {\n        url,\n        ok: isSuccess(response.status),\n        status: response.status,\n        statusText: response.statusText,\n        body: responseHeader || responseBody,\n    };\n\n    catchErrors(options, result);\n    return result;\n}";
},"usePartial":true,"useData":true};

var xhrSendRequest = {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "async function sendRequest(options: ApiRequestOptions, url: string): Promise<XMLHttpRequest> {\n\n    const xhr = new XMLHttpRequest();\n    xhr.open(options.method, url, true);\n    xhr.withCredentials = OpenAPI.WITH_CREDENTIALS;\n\n    const headers = await getHeaders(options);\n    headers.forEach((value: string, key: string) => {\n        xhr.setRequestHeader(key, value);\n    });\n\n    return new Promise<XMLHttpRequest>(resolve => {\n        xhr.onreadystatechange = () => {\n            if (xhr.readyState === XMLHttpRequest.DONE) {\n                resolve(xhr);\n            }\n        };\n        xhr.send(getRequestBody(options));\n    });\n}";
},"useData":true};

var templateExportModel = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"imports"),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":6,"column":9}}})) != null ? stack1 : "");
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

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"enum",{"name":"equals","hash":{},"fn":container.program(7, data, 0),"inverse":container.program(9, data, 0),"data":data,"loc":{"start":{"line":11,"column":0},"end":{"line":15,"column":0}}})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"exportEnum"),depth0,{"name":"exportEnum","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"exportType"),depth0,{"name":"exportType","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"imports"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":7,"column":7}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(depth0,"export"),"interface",{"name":"equals","hash":{},"fn":container.program(4, data, 0),"inverse":container.program(6, data, 0),"data":data,"loc":{"start":{"line":9,"column":0},"end":{"line":15,"column":11}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true};

var templateExportSchema = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"extends"),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":6,"column":9}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda;

  return "import { $"
    + ((stack1 = alias1(depth0, depth0)) != null ? stack1 : "")
    + " } from './$"
    + ((stack1 = alias1(depth0, depth0)) != null ? stack1 : "")
    + "';\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"extends"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":7,"column":7}}})) != null ? stack1 : "")
    + "\nexport const $"
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":9,"column":17},"end":{"line":9,"column":21}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"schema"),depth0,{"name":"schema","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ";";
},"usePartial":true,"useData":true};

var templateExportService = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"imports"),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":6,"column":9}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda;

  return "import type { "
    + ((stack1 = alias1(depth0, depth0)) != null ? stack1 : "")
    + " } from '../models/"
    + ((stack1 = alias1(depth0, depth0)) != null ? stack1 : "")
    + "';\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "import { OpenAPI } from '../core/OpenAPI';\n";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.strict, alias3=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    /**\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"deprecated"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":17,"column":4},"end":{"line":19,"column":11}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"summary"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":20,"column":4},"end":{"line":22,"column":11}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":23,"column":4},"end":{"line":25,"column":11}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,lookupProperty(lookupProperty(data,"root"),"useOptions"),{"name":"unless","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":26,"column":4},"end":{"line":32,"column":15}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"results"),{"name":"each","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":33,"column":4},"end":{"line":35,"column":13}}})) != null ? stack1 : "")
    + "     * @throws ApiError\n     */\n    public static async "
    + ((stack1 = alias3(alias2(depth0, "name", {"start":{"line":38,"column":27},"end":{"line":38,"column":31}} ), depth0)) != null ? stack1 : "")
    + "("
    + ((stack1 = container.invokePartial(lookupProperty(partials,"parameters"),depth0,{"name":"parameters","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "): Promise<"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"result"),depth0,{"name":"result","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "> {\n        const result = await __request({\n            method: '"
    + ((stack1 = alias3(alias2(depth0, "method", {"start":{"line":40,"column":24},"end":{"line":40,"column":30}} ), depth0)) != null ? stack1 : "")
    + "',\n            path: `"
    + ((stack1 = alias3(alias2(depth0, "path", {"start":{"line":41,"column":22},"end":{"line":41,"column":26}} ), depth0)) != null ? stack1 : "")
    + "`,\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"parametersCookie"),{"name":"if","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":42,"column":12},"end":{"line":48,"column":19}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"parametersHeader"),{"name":"if","hash":{},"fn":container.program(22, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":49,"column":12},"end":{"line":55,"column":19}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"parametersQuery"),{"name":"if","hash":{},"fn":container.program(24, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":56,"column":12},"end":{"line":62,"column":19}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"parametersForm"),{"name":"if","hash":{},"fn":container.program(26, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":63,"column":12},"end":{"line":69,"column":19}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"parametersBody"),{"name":"if","hash":{},"fn":container.program(28, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":70,"column":12},"end":{"line":72,"column":19}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"responseHeader"),{"name":"if","hash":{},"fn":container.program(30, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":73,"column":12},"end":{"line":75,"column":19}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"errors"),{"name":"if","hash":{},"fn":container.program(32, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":76,"column":12},"end":{"line":82,"column":19}}})) != null ? stack1 : "")
    + "        });\n        return result.body;\n    }\n\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "     * @deprecated\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "     * "
    + ((stack1 = container.lambda(container.strict(depth0, "summary", {"start":{"line":21,"column":10},"end":{"line":21,"column":17}} ), depth0)) != null ? stack1 : "")
    + "\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "     * "
    + ((stack1 = container.lambda(container.strict(depth0, "description", {"start":{"line":24,"column":10},"end":{"line":24,"column":21}} ), depth0)) != null ? stack1 : "")
    + "\n";
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parameters"),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":27,"column":6},"end":{"line":31,"column":13}}})) != null ? stack1 : "");
},"14":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parameters"),{"name":"each","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":28,"column":8},"end":{"line":30,"column":17}}})) != null ? stack1 : "");
},"15":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "          * @param "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":29,"column":22},"end":{"line":29,"column":26}} ), depth0)) != null ? stack1 : "")
    + " "
    + ((stack1 = alias2(alias1(depth0, "description", {"start":{"line":29,"column":33},"end":{"line":29,"column":44}} ), depth0)) != null ? stack1 : "")
    + "\n";
},"17":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "     * @result "
    + ((stack1 = alias2(alias1(depth0, "type", {"start":{"line":34,"column":18},"end":{"line":34,"column":22}} ), depth0)) != null ? stack1 : "")
    + " "
    + ((stack1 = alias2(alias1(depth0, "description", {"start":{"line":34,"column":29},"end":{"line":34,"column":40}} ), depth0)) != null ? stack1 : "")
    + "\n";
},"19":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            cookies: {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parametersCookie"),{"name":"each","hash":{},"fn":container.program(20, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":44,"column":16},"end":{"line":46,"column":25}}})) != null ? stack1 : "")
    + "            },\n";
},"20":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "                '"
    + ((stack1 = alias2(alias1(depth0, "prop", {"start":{"line":45,"column":20},"end":{"line":45,"column":24}} ), depth0)) != null ? stack1 : "")
    + "': "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":45,"column":33},"end":{"line":45,"column":37}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"22":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            headers: {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parametersHeader"),{"name":"each","hash":{},"fn":container.program(20, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":51,"column":16},"end":{"line":53,"column":25}}})) != null ? stack1 : "")
    + "            },\n";
},"24":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            query: {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parametersQuery"),{"name":"each","hash":{},"fn":container.program(20, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":58,"column":16},"end":{"line":60,"column":25}}})) != null ? stack1 : "")
    + "            },\n";
},"26":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            formData: {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parametersForm"),{"name":"each","hash":{},"fn":container.program(20, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":65,"column":16},"end":{"line":67,"column":25}}})) != null ? stack1 : "")
    + "            },\n";
},"28":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            body: "
    + ((stack1 = container.lambda(container.strict(lookupProperty(depth0,"parametersBody"), "name", {"start":{"line":71,"column":21},"end":{"line":71,"column":40}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"30":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "            responseHeader: '"
    + ((stack1 = container.lambda(container.strict(depth0, "responseHeader", {"start":{"line":74,"column":32},"end":{"line":74,"column":46}} ), depth0)) != null ? stack1 : "")
    + "',\n";
},"32":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            errors: {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"errors"),{"name":"each","hash":{},"fn":container.program(33, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":78,"column":16},"end":{"line":80,"column":25}}})) != null ? stack1 : "")
    + "            },\n";
},"33":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "                "
    + ((stack1 = alias2(alias1(depth0, "code", {"start":{"line":79,"column":19},"end":{"line":79,"column":23}} ), depth0)) != null ? stack1 : "")
    + ": `"
    + ((stack1 = alias2(alias1(depth0, "description", {"start":{"line":79,"column":32},"end":{"line":79,"column":43}} ), depth0)) != null ? stack1 : "")
    + "`,\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"imports"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":7,"column":7}}})) != null ? stack1 : "")
    + "import { request as __request } from '../core/request';\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useVersion"),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":9,"column":0},"end":{"line":11,"column":7}}})) != null ? stack1 : "")
    + "\nexport class "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":13,"column":16},"end":{"line":13,"column":20}} ), depth0)) != null ? stack1 : "")
    + " {\n\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"operations"),{"name":"each","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":4},"end":{"line":87,"column":13}}})) != null ? stack1 : "")
    + "}";
},"usePartial":true,"useData":true};

var templateIndex = {"1":function(container,depth0,helpers,partials,data) {
    return "\nexport { ApiError } from './core/ApiError';\nexport { OpenAPI } from './core/OpenAPI';\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"models"),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":0},"end":{"line":21,"column":7}}})) != null ? stack1 : "");
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"models"),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":0},"end":{"line":20,"column":9}}})) != null ? stack1 : "");
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"enum"),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.program(8, data, 0),"data":data,"loc":{"start":{"line":11,"column":0},"end":{"line":19,"column":7}}})) != null ? stack1 : "");
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "export { "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":12,"column":12},"end":{"line":12,"column":16}} ), depth0)) != null ? stack1 : "")
    + " } from './models/"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":12,"column":40},"end":{"line":12,"column":44}} ), depth0)) != null ? stack1 : "")
    + "';\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"useUnionTypes"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.program(11, data, 0),"data":data,"loc":{"start":{"line":13,"column":0},"end":{"line":19,"column":0}}})) != null ? stack1 : "");
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "export type { "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":14,"column":17},"end":{"line":14,"column":21}} ), depth0)) != null ? stack1 : "")
    + " } from './models/"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":14,"column":45},"end":{"line":14,"column":49}} ), depth0)) != null ? stack1 : "")
    + "';\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"enums"),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.program(9, data, 0),"data":data,"loc":{"start":{"line":15,"column":0},"end":{"line":19,"column":0}}})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"models"),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":24,"column":0},"end":{"line":29,"column":7}}})) != null ? stack1 : "");
},"14":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"models"),{"name":"each","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":26,"column":0},"end":{"line":28,"column":9}}})) != null ? stack1 : "");
},"15":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "export { $"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":27,"column":13},"end":{"line":27,"column":17}} ), depth0)) != null ? stack1 : "")
    + " } from './schemas/$"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":27,"column":43},"end":{"line":27,"column":47}} ), depth0)) != null ? stack1 : "")
    + "';\n";
},"17":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"services"),{"name":"if","hash":{},"fn":container.program(18, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":32,"column":0},"end":{"line":37,"column":7}}})) != null ? stack1 : "");
},"18":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"services"),{"name":"each","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":34,"column":0},"end":{"line":36,"column":9}}})) != null ? stack1 : "");
},"19":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "export { "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":35,"column":12},"end":{"line":35,"column":16}} ), depth0)) != null ? stack1 : "")
    + " } from './services/"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":35,"column":42},"end":{"line":35,"column":46}} ), depth0)) != null ? stack1 : "")
    + "';\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"exportCore"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":6,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"exportModels"),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":0},"end":{"line":22,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"exportSchemas"),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":23,"column":0},"end":{"line":30,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"exportServices"),{"name":"if","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":31,"column":0},"end":{"line":38,"column":7}}})) != null ? stack1 : "");
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
    + ((stack1 = lookupProperty(helpers,"equals").call(alias1,lookupProperty(lookupProperty(data,"root"),"httpClient"),"node",{"name":"equals","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":4,"column":86}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    return "Blob";
},"4":function(container,depth0,helpers,partials,data) {
    return "Buffer | ArrayBuffer | ArrayBufferView";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.lambda(container.strict(depth0, "base", {"start":{"line":6,"column":3},"end":{"line":6,"column":7}} ), depth0)) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"File",{"name":"equals","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(6, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":7,"column":13}}})) != null ? stack1 : "");
},"useData":true};

var partialExportEnum = {"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "/**\n * "
    + ((stack1 = container.lambda(container.strict(depth0, "description", {"start":{"line":3,"column":6},"end":{"line":3,"column":17}} ), depth0)) != null ? stack1 : "")
    + "\n */\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":4},"end":{"line":12,"column":11}}})) != null ? stack1 : "")
    + "    "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":13,"column":7},"end":{"line":13,"column":11}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = alias2(alias1(depth0, "value", {"start":{"line":13,"column":20},"end":{"line":13,"column":25}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    /**\n     * "
    + ((stack1 = container.lambda(container.strict(depth0, "description", {"start":{"line":10,"column":10},"end":{"line":10,"column":21}} ), depth0)) != null ? stack1 : "")
    + "\n     */\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":5,"column":7}}})) != null ? stack1 : "")
    + "export enum "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":6,"column":15},"end":{"line":6,"column":19}} ), depth0)) != null ? stack1 : "")
    + " {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"enum"),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":4},"end":{"line":14,"column":13}}})) != null ? stack1 : "")
    + "}";
},"useData":true};

var partialExportInterface = {"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "/**\n * "
    + ((stack1 = container.lambda(container.strict(depth0, "description", {"start":{"line":3,"column":6},"end":{"line":3,"column":17}} ), depth0)) != null ? stack1 : "")
    + "\n */\n";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":4},"end":{"line":12,"column":11}}})) != null ? stack1 : "")
    + "    "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isReadOnly"),depth0,{"name":"isReadOnly","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":13,"column":22},"end":{"line":13,"column":26}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isRequired"),depth0,{"name":"isRequired","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ": "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"type"),depth0,{"name":"type","hash":{"parent":lookupProperty(depths[1],"name")},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ";\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    /**\n     * "
    + ((stack1 = container.lambda(container.strict(depth0, "description", {"start":{"line":10,"column":10},"end":{"line":10,"column":21}} ), depth0)) != null ? stack1 : "")
    + "\n     */\n";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"useUnionTypes"),{"name":"unless","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":17,"column":0},"end":{"line":36,"column":11}}})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\nexport namespace "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":19,"column":20},"end":{"line":19,"column":24}} ), depth0)) != null ? stack1 : "")
    + " {\n\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"enums"),{"name":"each","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":21,"column":4},"end":{"line":33,"column":13}}})) != null ? stack1 : "")
    + "\n}\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":22,"column":4},"end":{"line":26,"column":11}}})) != null ? stack1 : "")
    + "    export enum "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":27,"column":19},"end":{"line":27,"column":23}} ), depth0)) != null ? stack1 : "")
    + " {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"enum"),{"name":"each","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":28,"column":8},"end":{"line":30,"column":17}}})) != null ? stack1 : "")
    + "    }\n\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "        "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":29,"column":11},"end":{"line":29,"column":15}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = alias2(alias1(depth0, "value", {"start":{"line":29,"column":24},"end":{"line":29,"column":29}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":5,"column":7}}})) != null ? stack1 : "")
    + "export interface "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":6,"column":20},"end":{"line":6,"column":24}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"extends"),depth0,{"name":"extends","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + " {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":4},"end":{"line":14,"column":13}}})) != null ? stack1 : "")
    + "}\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"enums"),{"name":"if","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":16,"column":0},"end":{"line":37,"column":7}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true,"useDepths":true};

var partialExportType = {"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "/**\n * "
    + ((stack1 = container.lambda(container.strict(depth0, "description", {"start":{"line":3,"column":6},"end":{"line":3,"column":17}} ), depth0)) != null ? stack1 : "")
    + "\n */\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":5,"column":7}}})) != null ? stack1 : "")
    + "export type "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":6,"column":15},"end":{"line":6,"column":19}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"type"),depth0,{"name":"type","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ";";
},"usePartial":true,"useData":true};

var partialExtends = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return " extends "
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"extends"),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":24},"end":{"line":1,"column":90}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.lambda(depth0, depth0)) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(data,"last"),{"name":"unless","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":51},"end":{"line":1,"column":81}}})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    return ", ";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"extends"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":97}}})) != null ? stack1 : "");
},"useData":true};

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

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"useOptions"),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(8, data, 0),"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":18,"column":7}}})) != null ? stack1 : "");
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
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"parameters"),{"name":"each","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":0},"end":{"line":11,"column":9}}})) != null ? stack1 : "")
    + "}\n";
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
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "/** "
    + ((stack1 = alias2(alias1(depth0, "description", {"start":{"line":9,"column":7},"end":{"line":9,"column":18}} ), depth0)) != null ? stack1 : "")
    + " */\n"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":10,"column":3},"end":{"line":10,"column":7}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isRequired"),depth0,{"name":"isRequired","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ": "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"type"),depth0,{"name":"type","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ",\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parameters"),{"name":"each","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":0},"end":{"line":17,"column":9}}})) != null ? stack1 : "");
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":16,"column":3},"end":{"line":16,"column":7}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isRequired"),depth0,{"name":"isRequired","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ": "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"type"),depth0,{"name":"type","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"default"),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":16,"column":36},"end":{"line":16,"column":74}}})) != null ? stack1 : "")
    + ",\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parameters"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":19,"column":7}}})) != null ? stack1 : "");
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

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"enum",{"name":"equals","hash":{},"fn":container.program(4, data, 0),"inverse":container.program(6, data, 0),"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":11,"column":0}}})) != null ? stack1 : "");
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

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"array",{"name":"equals","hash":{},"fn":container.program(7, data, 0),"inverse":container.program(9, data, 0),"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":11,"column":0}}})) != null ? stack1 : "");
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

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"dictionary",{"name":"equals","hash":{},"fn":container.program(10, data, 0),"inverse":container.program(12, data, 0),"data":data,"loc":{"start":{"line":7,"column":0},"end":{"line":11,"column":0}}})) != null ? stack1 : "");
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

  return ((stack1 = container.invokePartial(lookupProperty(partials,"schemaGeneric"),depth0,{"name":"schemaGeneric","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"interface",{"name":"equals","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":11,"column":11}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true};

var partialSchemaArray = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    contains: "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"schema"),lookupProperty(depth0,"link"),{"name":"schema","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ",\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    contains: {\n        type: '"
    + ((stack1 = container.lambda(container.strict(depth0, "base", {"start":{"line":7,"column":18},"end":{"line":7,"column":22}} ), depth0)) != null ? stack1 : "")
    + "',\n    },\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    isReadOnly: "
    + ((stack1 = container.lambda(container.strict(depth0, "isReadOnly", {"start":{"line":11,"column":19},"end":{"line":11,"column":29}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    isRequired: "
    + ((stack1 = container.lambda(container.strict(depth0, "isRequired", {"start":{"line":14,"column":19},"end":{"line":14,"column":29}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    isNullable: "
    + ((stack1 = container.lambda(container.strict(depth0, "isNullable", {"start":{"line":17,"column":19},"end":{"line":17,"column":29}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n    type: 'array',\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"link"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":9,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isReadOnly"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":0},"end":{"line":12,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isRequired"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":0},"end":{"line":15,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":16,"column":0},"end":{"line":18,"column":7}}})) != null ? stack1 : "")
    + "}";
},"usePartial":true,"useData":true};

var partialSchemaDictionary = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    contains: "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"schema"),lookupProperty(depth0,"link"),{"name":"schema","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ",\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    contains: {\n        type: '"
    + ((stack1 = container.lambda(container.strict(depth0, "base", {"start":{"line":7,"column":18},"end":{"line":7,"column":22}} ), depth0)) != null ? stack1 : "")
    + "',\n    },\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    isReadOnly: "
    + ((stack1 = container.lambda(container.strict(depth0, "isReadOnly", {"start":{"line":11,"column":19},"end":{"line":11,"column":29}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    isRequired: "
    + ((stack1 = container.lambda(container.strict(depth0, "isRequired", {"start":{"line":14,"column":19},"end":{"line":14,"column":29}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    isNullable: "
    + ((stack1 = container.lambda(container.strict(depth0, "isNullable", {"start":{"line":17,"column":19},"end":{"line":17,"column":29}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n    type: 'dictionary',\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"link"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":9,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isReadOnly"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":0},"end":{"line":12,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isRequired"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":0},"end":{"line":15,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":16,"column":0},"end":{"line":18,"column":7}}})) != null ? stack1 : "")
    + "}";
},"usePartial":true,"useData":true};

var partialSchemaEnum = {"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    isReadOnly: "
    + ((stack1 = container.lambda(container.strict(depth0, "isReadOnly", {"start":{"line":4,"column":19},"end":{"line":4,"column":29}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    isRequired: "
    + ((stack1 = container.lambda(container.strict(depth0, "isRequired", {"start":{"line":7,"column":19},"end":{"line":7,"column":29}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    isNullable: "
    + ((stack1 = container.lambda(container.strict(depth0, "isNullable", {"start":{"line":10,"column":19},"end":{"line":10,"column":29}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n    type: 'Enum',\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isReadOnly"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":5,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isRequired"),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":0},"end":{"line":8,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":9,"column":0},"end":{"line":11,"column":7}}})) != null ? stack1 : "")
    + "}";
},"useData":true};

var partialSchemaGeneric = {"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    type: '"
    + ((stack1 = container.lambda(container.strict(depth0, "base", {"start":{"line":3,"column":14},"end":{"line":3,"column":18}} ), depth0)) != null ? stack1 : "")
    + "',\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    isReadOnly: "
    + ((stack1 = container.lambda(container.strict(depth0, "isReadOnly", {"start":{"line":6,"column":19},"end":{"line":6,"column":29}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    isRequired: "
    + ((stack1 = container.lambda(container.strict(depth0, "isRequired", {"start":{"line":9,"column":19},"end":{"line":9,"column":29}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    isNullable: "
    + ((stack1 = container.lambda(container.strict(depth0, "isNullable", {"start":{"line":12,"column":19},"end":{"line":12,"column":29}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    format: '"
    + ((stack1 = container.lambda(container.strict(depth0, "format", {"start":{"line":15,"column":16},"end":{"line":15,"column":22}} ), depth0)) != null ? stack1 : "")
    + "',\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    maximum: "
    + ((stack1 = container.lambda(container.strict(depth0, "maximum", {"start":{"line":18,"column":16},"end":{"line":18,"column":23}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"13":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    exclusiveMaximum: "
    + ((stack1 = container.lambda(container.strict(depth0, "exclusiveMaximum", {"start":{"line":21,"column":25},"end":{"line":21,"column":41}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"15":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    minimum: "
    + ((stack1 = container.lambda(container.strict(depth0, "minimum", {"start":{"line":24,"column":16},"end":{"line":24,"column":23}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"17":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    exclusiveMinimum: "
    + ((stack1 = container.lambda(container.strict(depth0, "exclusiveMinimum", {"start":{"line":27,"column":25},"end":{"line":27,"column":41}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"19":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    multipleOf: "
    + ((stack1 = container.lambda(container.strict(depth0, "multipleOf", {"start":{"line":30,"column":19},"end":{"line":30,"column":29}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"21":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    maxLength: "
    + ((stack1 = container.lambda(container.strict(depth0, "maxLength", {"start":{"line":33,"column":18},"end":{"line":33,"column":27}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"23":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    minLength: "
    + ((stack1 = container.lambda(container.strict(depth0, "minLength", {"start":{"line":36,"column":18},"end":{"line":36,"column":27}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"25":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    pattern: '"
    + ((stack1 = container.lambda(container.strict(depth0, "pattern", {"start":{"line":39,"column":17},"end":{"line":39,"column":24}} ), depth0)) != null ? stack1 : "")
    + "',\n";
},"27":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    maxItems: "
    + ((stack1 = container.lambda(container.strict(depth0, "maxItems", {"start":{"line":42,"column":17},"end":{"line":42,"column":25}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"29":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    minItems: "
    + ((stack1 = container.lambda(container.strict(depth0, "minItems", {"start":{"line":45,"column":17},"end":{"line":45,"column":25}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"31":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    uniqueItems: "
    + ((stack1 = container.lambda(container.strict(depth0, "uniqueItems", {"start":{"line":48,"column":20},"end":{"line":48,"column":31}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"33":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    maxProperties: "
    + ((stack1 = container.lambda(container.strict(depth0, "maxProperties", {"start":{"line":51,"column":22},"end":{"line":51,"column":35}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"35":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    minProperties: "
    + ((stack1 = container.lambda(container.strict(depth0, "minProperties", {"start":{"line":54,"column":22},"end":{"line":54,"column":35}} ), depth0)) != null ? stack1 : "")
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
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isReadOnly"),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":7,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isRequired"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":0},"end":{"line":10,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":11,"column":0},"end":{"line":13,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"format"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":0},"end":{"line":16,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maximum"),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":17,"column":0},"end":{"line":19,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"exclusiveMaximum"),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":20,"column":0},"end":{"line":22,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minimum"),{"name":"if","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":23,"column":0},"end":{"line":25,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"exclusiveMinimum"),{"name":"if","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":26,"column":0},"end":{"line":28,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"multipleOf"),{"name":"if","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":29,"column":0},"end":{"line":31,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maxLength"),{"name":"if","hash":{},"fn":container.program(21, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":32,"column":0},"end":{"line":34,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minLength"),{"name":"if","hash":{},"fn":container.program(23, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":35,"column":0},"end":{"line":37,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"pattern"),{"name":"if","hash":{},"fn":container.program(25, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":38,"column":0},"end":{"line":40,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maxItems"),{"name":"if","hash":{},"fn":container.program(27, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":41,"column":0},"end":{"line":43,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minItems"),{"name":"if","hash":{},"fn":container.program(29, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":44,"column":0},"end":{"line":46,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"uniqueItems"),{"name":"if","hash":{},"fn":container.program(31, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":47,"column":0},"end":{"line":49,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maxProperties"),{"name":"if","hash":{},"fn":container.program(33, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":50,"column":0},"end":{"line":52,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minProperties"),{"name":"if","hash":{},"fn":container.program(35, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":53,"column":0},"end":{"line":55,"column":7}}})) != null ? stack1 : "")
    + "}";
},"useData":true};

var partialSchemaInterface = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"extends"),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":4},"end":{"line":6,"column":13}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "        ...$"
    + ((stack1 = container.lambda(depth0, depth0)) != null ? stack1 : "")
    + ".properties,\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":9,"column":4},"end":{"line":11,"column":13}}})) != null ? stack1 : "");
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":10,"column":11},"end":{"line":10,"column":15}} ), depth0)) != null ? stack1 : "")
    + ": "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"schema"),depth0,{"name":"schema","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ",\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    isReadOnly: "
    + ((stack1 = container.lambda(container.strict(depth0, "isReadOnly", {"start":{"line":15,"column":19},"end":{"line":15,"column":29}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    isRequired: "
    + ((stack1 = container.lambda(container.strict(depth0, "isRequired", {"start":{"line":18,"column":19},"end":{"line":18,"column":29}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    isNullable: "
    + ((stack1 = container.lambda(container.strict(depth0, "isNullable", {"start":{"line":21,"column":19},"end":{"line":21,"column":29}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n    properties: {\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"extends"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":7,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"properties"),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":0},"end":{"line":12,"column":7}}})) != null ? stack1 : "")
    + "    },\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isReadOnly"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":0},"end":{"line":16,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isRequired"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":17,"column":0},"end":{"line":19,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":20,"column":0},"end":{"line":22,"column":7}}})) != null ? stack1 : "")
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

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"reference",{"name":"equals","hash":{},"fn":container.program(4, data, 0),"inverse":container.program(6, data, 0),"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":13,"column":0}}})) != null ? stack1 : "");
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

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"enum",{"name":"equals","hash":{},"fn":container.program(7, data, 0),"inverse":container.program(9, data, 0),"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":13,"column":0}}})) != null ? stack1 : "");
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

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"array",{"name":"equals","hash":{},"fn":container.program(10, data, 0),"inverse":container.program(12, data, 0),"data":data,"loc":{"start":{"line":7,"column":0},"end":{"line":13,"column":0}}})) != null ? stack1 : "");
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

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"dictionary",{"name":"equals","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(15, data, 0),"data":data,"loc":{"start":{"line":9,"column":0},"end":{"line":13,"column":0}}})) != null ? stack1 : "");
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

  return ((stack1 = container.invokePartial(lookupProperty(partials,"typeGeneric"),depth0,{"name":"typeGeneric","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"interface",{"name":"equals","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":13,"column":11}}})) != null ? stack1 : "");
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
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"enum"),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":2,"column":65}}})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isNullable"),depth0,{"name":"isNullable","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.lambda(container.strict(depth0, "value", {"start":{"line":2,"column":17},"end":{"line":2,"column":22}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(data,"last"),{"name":"unless","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":25},"end":{"line":2,"column":56}}})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    return " | ";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parent"),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.program(1, data, 0),"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":7,"column":0}}})) != null ? stack1 : "");
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = alias2(alias1(depth0, "parent", {"start":{"line":4,"column":3},"end":{"line":4,"column":9}} ), depth0)) != null ? stack1 : "")
    + "."
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":4,"column":16},"end":{"line":4,"column":20}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isNullable"),depth0,{"name":"isNullable","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"useUnionTypes"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(5, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":7,"column":9}}})) != null ? stack1 : "");
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

var partialTypeInterface = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":10,"column":9}}})) != null ? stack1 : "")
    + "}"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isNullable"),depth0,{"name":"isNullable","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":8,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isReadOnly"),depth0,{"name":"isReadOnly","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":9,"column":18},"end":{"line":9,"column":22}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isRequired"),depth0,{"name":"isRequired","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ": "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"type"),depth0,{"name":"type","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ",\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "/**\n * "
    + ((stack1 = container.lambda(container.strict(depth0, "description", {"start":{"line":6,"column":6},"end":{"line":6,"column":17}} ), depth0)) != null ? stack1 : "")
    + "\n */\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "any";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"properties"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(5, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":14,"column":9}}})) != null ? stack1 : "");
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

// @ts-nocheck
function registerHandlebarHelpers() {
    Handlebars.registerHelper('equals', function (a, b, options) {
        return a === b ? options.fn(this) : options.inverse(this);
    });
    Handlebars.registerHelper('notEquals', function (a, b, options) {
        return a !== b ? options.fn(this) : options.inverse(this);
    });
}

/**
 * Read all the Handlebar templates that we need and return on wrapper object
 * so we can easily access the templates in out generator / write functions.
 */
function registerHandlebarTemplates() {
    registerHandlebarHelpers();
    // Main templates (entry points for the files we write to disk)
    const templates = {
        index: Handlebars.template(templateIndex),
        exports: {
            model: Handlebars.template(templateExportModel),
            schema: Handlebars.template(templateExportSchema),
            service: Handlebars.template(templateExportService),
        },
        core: {
            settings: Handlebars.template(templateCoreSettings),
            apiError: Handlebars.template(templateCoreApiError),
            apiRequestOptions: Handlebars.template(templateCoreApiRequestOptions),
            apiResult: Handlebars.template(templateCoreApiResult),
            request: Handlebars.template(templateCoreRequest),
        },
    };
    // Partials for the generations of the models, services, etc.
    Handlebars.registerPartial('exportEnum', Handlebars.template(partialExportEnum));
    Handlebars.registerPartial('exportInterface', Handlebars.template(partialExportInterface));
    Handlebars.registerPartial('exportType', Handlebars.template(partialExportType));
    Handlebars.registerPartial('extends', Handlebars.template(partialExtends));
    Handlebars.registerPartial('header', Handlebars.template(partialHeader));
    Handlebars.registerPartial('isNullable', Handlebars.template(partialIsNullable));
    Handlebars.registerPartial('isReadOnly', Handlebars.template(partialIsReadOnly));
    Handlebars.registerPartial('isRequired', Handlebars.template(partialIsRequired));
    Handlebars.registerPartial('parameters', Handlebars.template(partialParameters));
    Handlebars.registerPartial('result', Handlebars.template(partialResult));
    Handlebars.registerPartial('schema', Handlebars.template(partialSchema));
    Handlebars.registerPartial('schemaArray', Handlebars.template(partialSchemaArray));
    Handlebars.registerPartial('schemaDictionary', Handlebars.template(partialSchemaDictionary));
    Handlebars.registerPartial('schemaEnum', Handlebars.template(partialSchemaEnum));
    Handlebars.registerPartial('schemaGeneric', Handlebars.template(partialSchemaGeneric));
    Handlebars.registerPartial('schemaInterface', Handlebars.template(partialSchemaInterface));
    Handlebars.registerPartial('type', Handlebars.template(partialType));
    Handlebars.registerPartial('typeArray', Handlebars.template(partialTypeArray));
    Handlebars.registerPartial('typeDictionary', Handlebars.template(partialTypeDictionary));
    Handlebars.registerPartial('typeEnum', Handlebars.template(partialTypeEnum));
    Handlebars.registerPartial('typeGeneric', Handlebars.template(partialTypeGeneric));
    Handlebars.registerPartial('typeInterface', Handlebars.template(partialTypeInterface));
    Handlebars.registerPartial('typeReference', Handlebars.template(partialTypeReference));
    Handlebars.registerPartial('base', Handlebars.template(partialBase));
    // Generic functions used in 'request' file @see src/templates/core/request.hbs for more info
    Handlebars.registerPartial('functions/catchErrors', Handlebars.template(functionCatchErrors));
    Handlebars.registerPartial('functions/getFormData', Handlebars.template(functionGetFormData));
    Handlebars.registerPartial('functions/getToken', Handlebars.template(functionGetToken));
    Handlebars.registerPartial('functions/getQueryString', Handlebars.template(functionGetQueryString));
    Handlebars.registerPartial('functions/getUrl', Handlebars.template(functionGetUrl));
    Handlebars.registerPartial('functions/isBinary', Handlebars.template(functionIsBinary));
    Handlebars.registerPartial('functions/isBlob', Handlebars.template(functionIsBlob));
    Handlebars.registerPartial('functions/isDefined', Handlebars.template(functionIsDefined));
    Handlebars.registerPartial('functions/isString', Handlebars.template(functionIsString));
    Handlebars.registerPartial('functions/isSuccess', Handlebars.template(functionIsSuccess));
    // Specific files for the fetch client implementation
    Handlebars.registerPartial('fetch/getHeaders', Handlebars.template(fetchGetHeaders));
    Handlebars.registerPartial('fetch/getRequestBody', Handlebars.template(fetchGetRequestBody));
    Handlebars.registerPartial('fetch/getResponseBody', Handlebars.template(fetchGetResponseBody));
    Handlebars.registerPartial('fetch/getResponseHeader', Handlebars.template(fetchGetResponseHeader));
    Handlebars.registerPartial('fetch/sendRequest', Handlebars.template(fetchSendRequest));
    Handlebars.registerPartial('fetch/request', Handlebars.template(fetchRequest));
    // Specific files for the xhr client implementation
    Handlebars.registerPartial('xhr/getHeaders', Handlebars.template(xhrGetHeaders));
    Handlebars.registerPartial('xhr/getRequestBody', Handlebars.template(xhrGetRequestBody));
    Handlebars.registerPartial('xhr/getResponseBody', Handlebars.template(xhrGetResponseBody));
    Handlebars.registerPartial('xhr/getResponseHeader', Handlebars.template(xhrGetResponseHeader));
    Handlebars.registerPartial('xhr/sendRequest', Handlebars.template(xhrSendRequest));
    Handlebars.registerPartial('xhr/request', Handlebars.template(xhrRequest));
    // Specific files for the node client implementation
    Handlebars.registerPartial('node/getHeaders', Handlebars.template(nodeGetHeaders));
    Handlebars.registerPartial('node/getRequestBody', Handlebars.template(nodeGetRequestBody));
    Handlebars.registerPartial('node/getResponseBody', Handlebars.template(nodeGetResponseBody));
    Handlebars.registerPartial('node/getResponseHeader', Handlebars.template(nodeGetResponseHeader));
    Handlebars.registerPartial('node/sendRequest', Handlebars.template(nodeSendRequest));
    Handlebars.registerPartial('node/request', Handlebars.template(nodeRequest));
    return templates;
}

function isSubDirectory(parent, child) {
    return path.relative(child, parent).startsWith('..');
}

/**
 * Generate OpenAPI core files, this includes the basic boilerplate code to handle requests.
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr or node)
 */
async function writeClientCore(client, templates, outputPath, httpClient) {
    const context = {
        httpClient,
        server: client.server,
        version: client.version,
    };
    await writeFile(path.resolve(outputPath, 'OpenAPI.ts'), templates.core.settings(context));
    await writeFile(path.resolve(outputPath, 'ApiError.ts'), templates.core.apiError({}));
    await writeFile(path.resolve(outputPath, 'ApiRequestOptions.ts'), templates.core.apiRequestOptions({}));
    await writeFile(path.resolve(outputPath, 'ApiResult.ts'), templates.core.apiResult({}));
    await writeFile(path.resolve(outputPath, 'request.ts'), templates.core.request(context));
}

function sortModelsByName(models) {
    return models.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB, 'en');
    });
}

function sortServicesByName(services) {
    return services.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB, 'en');
    });
}

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore: Generate core
 * @param exportServices: Generate services
 * @param exportModels: Generate models
 * @param exportSchemas: Generate schemas
 */
async function writeClientIndex(client, templates, outputPath, useUnionTypes, exportCore, exportServices, exportModels, exportSchemas) {
    await writeFile(path.resolve(outputPath, 'index.ts'), templates.index({
        exportCore,
        exportServices,
        exportModels,
        exportSchemas,
        useUnionTypes,
        server: client.server,
        version: client.version,
        models: sortModelsByName(client.models),
        services: sortServicesByName(client.services),
    }));
}

function format(s) {
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
        const result = `${'    '.repeat(i)}${line}`;
        if (result.trim() === '') {
            return '';
        }
        return result;
    });
    return lines.join(os.EOL);
}

/**
 * Generate Models using the Handlebar template and write to disk.
 * @param models Array of Models to write
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param useUnionTypes Use union types instead of enums
 */
async function writeClientModels(models, templates, outputPath, httpClient, useUnionTypes) {
    for (const model of models) {
        const file = path.resolve(outputPath, `${model.name}.ts`);
        const templateResult = templates.exports.model(Object.assign(Object.assign({}, model), { httpClient,
            useUnionTypes }));
        await writeFile(file, format(templateResult));
    }
}

/**
 * Generate Schemas using the Handlebar template and write to disk.
 * @param models Array of Models to write
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param useUnionTypes Use union types instead of enums
 */
async function writeClientSchemas(models, templates, outputPath, httpClient, useUnionTypes) {
    for (const model of models) {
        const file = path.resolve(outputPath, `$${model.name}.ts`);
        const templateResult = templates.exports.schema(Object.assign(Object.assign({}, model), { httpClient,
            useUnionTypes }));
        await writeFile(file, format(templateResult));
    }
}

const VERSION_TEMPLATE_STRING = 'OpenAPI.VERSION';
/**
 * Generate Services using the Handlebar template and write to disk.
 * @param services Array of Services to write
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param useUnionTypes Use union types instead of enums
 * @param useOptions Use options or arguments functions
 */
async function writeClientServices(services, templates, outputPath, httpClient, useUnionTypes, useOptions) {
    for (const service of services) {
        const file = path.resolve(outputPath, `${service.name}.ts`);
        const useVersion = service.operations.some(operation => operation.path.includes(VERSION_TEMPLATE_STRING));
        const templateResult = templates.exports.service(Object.assign(Object.assign({}, service), { httpClient,
            useUnionTypes,
            useVersion,
            useOptions }));
        await writeFile(file, format(templateResult));
    }
}

/**
 * Write our OpenAPI client, using the given templates at the given output path.
 * @param client Client object with all the models, services, etc.
 * @param templates Templates wrapper with all loaded Handlebars templates
 * @param output The relative location of the output directory
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param useOptions Use options or arguments functions
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore: Generate core client classes
 * @param exportServices: Generate services
 * @param exportModels: Generate models
 * @param exportSchemas: Generate schemas
 */
async function writeClient(client, templates, output, httpClient, useOptions, useUnionTypes, exportCore, exportServices, exportModels, exportSchemas) {
    const outputPath = path.resolve(process.cwd(), output);
    const outputPathCore = path.resolve(outputPath, 'core');
    const outputPathModels = path.resolve(outputPath, 'models');
    const outputPathSchemas = path.resolve(outputPath, 'schemas');
    const outputPathServices = path.resolve(outputPath, 'services');
    if (!isSubDirectory(process.cwd(), output)) {
        throw new Error(`Output folder is not a subdirectory of the current working directory`);
    }
    await rmdir(outputPath);
    await mkdir(outputPath);
    if (exportCore) {
        await mkdir(outputPathCore);
        await writeClientCore(client, templates, outputPathCore, httpClient);
    }
    if (exportServices) {
        await mkdir(outputPathServices);
        await writeClientServices(client.services, templates, outputPathServices, httpClient, useUnionTypes, useOptions);
    }
    if (exportSchemas) {
        await mkdir(outputPathSchemas);
        await writeClientSchemas(client.models, templates, outputPathSchemas, httpClient, useUnionTypes);
    }
    if (exportModels) {
        await mkdir(outputPathModels);
        await writeClientModels(client.models, templates, outputPathModels, httpClient, useUnionTypes);
    }
    await writeClientIndex(client, templates, outputPath, useUnionTypes, exportCore, exportServices, exportModels, exportSchemas);
}

(function (HttpClient) {
    HttpClient["FETCH"] = "fetch";
    HttpClient["XHR"] = "xhr";
    HttpClient["NODE"] = "node";
})(exports.HttpClient || (exports.HttpClient = {}));
/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param input The relative location of the OpenAPI spec
 * @param output The relative location of the output directory
 * @param httpClient The selected httpClient (fetch or XHR)
 * @param useOptions Use options or arguments functions
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore: Generate core client classes
 * @param exportServices: Generate services
 * @param exportModels: Generate models
 * @param exportSchemas: Generate schemas
 * @param write Write the files to disk (true or false)
 */
async function generate({ input, output, httpClient = exports.HttpClient.FETCH, useOptions = false, useUnionTypes = false, exportCore = true, exportServices = true, exportModels = true, exportSchemas = false, write = true, }) {
    const openApi = isString(input) ? await getOpenApiSpec(input) : input;
    const openApiVersion = getOpenApiVersion(openApi);
    const templates = registerHandlebarTemplates();
    switch (openApiVersion) {
        case OpenApiVersion.V2: {
            const client = parse(openApi);
            const clientFinal = postProcessClient(client);
            if (!write)
                break;
            await writeClient(clientFinal, templates, output, httpClient, useOptions, useUnionTypes, exportCore, exportServices, exportModels, exportSchemas);
            break;
        }
        case OpenApiVersion.V3: {
            const client = parse$1(openApi);
            const clientFinal = postProcessClient(client);
            if (!write)
                break;
            await writeClient(clientFinal, templates, output, httpClient, useOptions, useUnionTypes, exportCore, exportServices, exportModels, exportSchemas);
            break;
        }
    }
}

exports.generate = generate;
