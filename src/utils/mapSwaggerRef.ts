export const mapSwaggerRef = (obj: Record<string, any>, mapFunction: Function): void => {
    const searchRef = (obj: Record<string, any>) => {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (key === '$ref') {
                    obj[key] = mapFunction(obj[key]);
                } else if (typeof obj[key] === 'object') searchRef(obj[key]);
            }
        }
    }

    searchRef(obj);
};
