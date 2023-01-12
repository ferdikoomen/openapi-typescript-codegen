export const generateCoreLocationSameLevelFromOutput = (coreLocation: string, output: string): string => {
    //This brings the core location back up to the top level before going elsewhere

    let outputTmp = output;
    if (outputTmp.startsWith('./')) {
        outputTmp = outputTmp.slice(2);
    }
    if (outputTmp.endsWith('/')) {
        outputTmp = outputTmp.slice(0, outputTmp.length - 1);
    }
    var count = (outputTmp.match(/\//g) || []).length;

    let location = '../';
    for (let i = 0; i < count; ++i) {
        location += '../';
    }

    if (coreLocation.startsWith('./')) {
        coreLocation = coreLocation.slice(2);
    }
    if (coreLocation.endsWith('/')) {
        coreLocation = coreLocation.slice(0, coreLocation.length - 1);
    }
    return (location += coreLocation);
};

export const generateCoreLocationUpLevelFromOutput = (coreLocation: string, output: string): string => {
    //This brings the core location back up to the top level before going elsewhere

    let outputTmp = output;
    if (outputTmp.startsWith('./')) {
        outputTmp = outputTmp.slice(2);
    }
    if (outputTmp.endsWith('/')) {
        outputTmp = outputTmp.slice(0, outputTmp.length - 1);
    }
    var count = (outputTmp.match(/\//g) || []).length;

    let location = '../../';
    for (let i = 0; i < count; ++i) {
        location += '../';
    }

    if (coreLocation.startsWith('./')) {
        coreLocation = coreLocation.slice(2);
    }
    if (coreLocation.endsWith('/')) {
        coreLocation = coreLocation.slice(0, coreLocation.length - 1);
    }
    return (location += coreLocation);
};
