export const performPathParameterAssertions = (result: { primitives: string; arrays: string; objects: string }) => {
    const sanitizePath = (inPath: string) => inPath.substring('/base/api/v1.0/parameters/'.length);
    const primitives = sanitizePath(result.primitives).split('/');
    const arrays = sanitizePath(result.arrays).split('/');
    const objects = sanitizePath(result.objects).split('/');

    /* Tests and expectations according to https://swagger.io/docs/specification/serialization/ */

    // primitives
    expect(primitives.length).toBe(7);
    expect(primitives[0]).toStrictEqual('5'); // unstyled
    expect(primitives[1]).toStrictEqual('5'); // simple
    expect(primitives[2]).toStrictEqual('5'); // simple exploded
    expect(primitives[3]).toStrictEqual('.5'); // label
    expect(primitives[4]).toStrictEqual('.5'); // label exploded
    expect(primitives[5]).toStrictEqual(';matrix=5'); // matrix
    expect(primitives[6]).toStrictEqual(';matrixExploded=5'); // matrix exploded

    // arrays
    expect(arrays.length).toBe(7);
    expect(arrays[0]).toStrictEqual('3,4,5'); // unstyled
    expect(arrays[1]).toStrictEqual('3,4,5'); // simple
    expect(arrays[2]).toStrictEqual('3,4,5'); // simple exploded
    expect(arrays[3]).toStrictEqual('.3,4,5'); // label
    expect(arrays[4]).toStrictEqual('.3.4.5'); // label exploded
    expect(arrays[5]).toStrictEqual(';matrix=3,4,5'); // matrix
    expect(arrays[6]).toStrictEqual(';matrixExploded=3;matrixExploded=4;matrixExploded=5'); // matrix exploded

    // objects
    expect(objects.length).toBe(7);
    expect(objects[0]).toStrictEqual('role,admin,firstName,Alex'); // unstyled
    expect(objects[1]).toStrictEqual('role,admin,firstName,Alex'); // simple
    expect(objects[2]).toStrictEqual('role=admin,firstName=Alex'); // simple exploded
    expect(objects[3]).toStrictEqual('.role,admin,firstName,Alex'); // label
    expect(objects[4]).toStrictEqual('.role=admin.firstName=Alex'); // label exploded
    expect(objects[5]).toStrictEqual(';matrix=role,admin,firstName,Alex'); // matrix
    expect(objects[6]).toStrictEqual(';role=admin;firstName=Alex'); // matrix exploded
};

export const performQueryParameterAssertions = (result: { primitives: string; arrays: string; objects: string[] }) => {
    const sanitize = (inUrl: string) => {
        expect(inUrl.startsWith('/base/api/v1.0/parameters/styledQuery?')).toBe(true);
        return inUrl.substring('/base/api/v1.0/parameters/styledQuery?'.length);
    };

    const groupByName = (queryString: string) => {
        const splitted = queryString.split('&');
        return splitted.reduce((prev, param) => {
            const key = param.split('=')[0];
            if (!(key in prev)) {
                prev[key] = [];
            }

            prev[key].push(decodeURIComponent(param));
            return prev;
        }, {});
    };

    const expectedGroups = [
        'unstyled',
        'form',
        'formExploded',
        'spaceDelimited',
        'spaceDelimitedExploded',
        'pipeDelimited',
        'pipeDelimitedExploded',
        'deepObject',
    ];

    const primitives = groupByName(sanitize(result.primitives));
    const arrays = groupByName(sanitize(result.arrays));
    const objects = result.objects.map(ro =>
        sanitize(ro)
            .split('&')
            .map(s => decodeURIComponent(s))
    );

    /* Tests and expectations according to https://swagger.io/docs/specification/serialization/ */

    // primitives
    expect(Object.keys(primitives)).toEqual(expect.arrayContaining(expectedGroups));
    expect(primitives['unstyled']).toEqual(['unstyled=5']);
    expect(primitives['formExploded']).toEqual(['formExploded=5']);
    expect(primitives['form']).toEqual(['form=5']);
    expect(primitives['spaceDelimitedExploded']).toEqual(['spaceDelimitedExploded=5']);
    expect(primitives['spaceDelimited']).toEqual(['spaceDelimited=5']);
    expect(primitives['pipeDelimitedExploded']).toEqual(['pipeDelimitedExploded=5']);
    expect(primitives['pipeDelimited']).toEqual(['pipeDelimited=5']);
    expect(primitives['deepObject']).toEqual(['deepObject=5']);

    // arrays
    expect(Object.keys(primitives)).toEqual(expect.arrayContaining(expectedGroups));
    expect(arrays['unstyled']).toEqual(['unstyled=3', 'unstyled=4', 'unstyled=5']);
    expect(arrays['formExploded']).toEqual(['formExploded=3', 'formExploded=4', 'formExploded=5']);
    expect(arrays['form']).toEqual(['form=3,4,5']);
    expect(arrays['spaceDelimitedExploded']).toEqual([
        'spaceDelimitedExploded=3',
        'spaceDelimitedExploded=4',
        'spaceDelimitedExploded=5',
    ]);
    expect(arrays['spaceDelimited']).toEqual(['spaceDelimited=3 4 5']);
    expect(arrays['pipeDelimitedExploded']).toEqual([
        'pipeDelimitedExploded=3',
        'pipeDelimitedExploded=4',
        'pipeDelimitedExploded=5',
    ]);
    expect(arrays['pipeDelimited']).toEqual(['pipeDelimited=3|4|5']);
    expect(arrays['deepObject']).toEqual(['deepObject=3', 'deepObject=4', 'deepObject=5']);

    // objects
    expect(objects.length).toBe(8);
    expect(objects[0]).toEqual(['role=admin', 'firstName=Alex']); // unstyled
    expect(objects[1]).toEqual(['form=role,admin,firstName,Alex']); // form
    expect(objects[2]).toEqual(['role=admin', 'firstName=Alex']); // form exploded
    expect(objects[3]).toEqual(['spaceDelimited[role]=admin', 'spaceDelimited[firstName]=Alex']); // spaceDelimited
    expect(objects[4]).toEqual(['spaceDelimitedExploded[role]=admin', 'spaceDelimitedExploded[firstName]=Alex']); // spaceDelimited exploded
    expect(objects[5]).toEqual(['pipeDelimited[role]=admin', 'pipeDelimited[firstName]=Alex']); // pipeDelimited
    expect(objects[6]).toEqual(['pipeDelimitedExploded[role]=admin', 'pipeDelimitedExploded[firstName]=Alex']); // pipeDelimited exploded
    expect(objects[7]).toEqual(['deepObject[role]=admin', 'deepObject[firstName]=Alex']); // deepObject
};

export const performHeaderParmeterAssertions = (result: {
    primitives: Record<string, string>;
    arrays: Record<string, string>;
    objects: Record<string, string>;
}) => {
    const { primitives, arrays, objects } = result;
    const expectedKeys = ['unstyled', 'simple', 'simpleexploded'];

    // primitives
    expect(Object.keys(primitives)).toEqual(expect.arrayContaining(expectedKeys));
    expect(primitives['unstyled']).toStrictEqual('5');
    expect(primitives['simple']).toStrictEqual('5');
    expect(primitives['simpleexploded']).toStrictEqual('5');

    // arrays
    expect(Object.keys(arrays)).toEqual(expect.arrayContaining(expectedKeys));
    expect(arrays['unstyled']).toStrictEqual('3,4,5');
    expect(arrays['simple']).toStrictEqual('3,4,5');
    expect(arrays['simpleexploded']).toStrictEqual('3,4,5');

    // objects
    expect(Object.keys(objects)).toEqual(expect.arrayContaining(expectedKeys));
    expect(objects['unstyled']).toStrictEqual('role,admin,firstName,Alex');
    expect(objects['simple']).toStrictEqual('role,admin,firstName,Alex');
    expect(objects['simpleexploded']).toStrictEqual('role=admin,firstName=Alex');
};
