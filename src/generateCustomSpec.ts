import { generate, Options } from './generate';

type Config = Options & {
    useSaddlebackServices?: boolean;
    additionalModelFileExtension?: boolean;
    additionalServiceFileExtension?: boolean;
};

export const generateCustomSpec = async (config: Config) => {
    await generate({ ...config, input: listWithRequiredPaths });
};

export default generateCustomSpec;
