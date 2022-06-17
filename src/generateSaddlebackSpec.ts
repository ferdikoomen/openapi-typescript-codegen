import { generate, Options } from './generate';

type Config = Options & {
    useSaddlebackServices?: boolean;
    additionalModelFileExtension?: boolean;
    additionalServiceFileExtension?: boolean;
};

export const generateSaddlebackSpec = async (config: Config) => {
    await generate({ ...config });
};

export default generateSaddlebackSpec;
