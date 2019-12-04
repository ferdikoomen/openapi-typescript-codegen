import { Language } from '../index';
import { Model } from '../client/interfaces/Model';

export function getFilteredModels(models: Model[], language: Language): Model[] {
    return models.filter(model => {
        if (language === Language.JAVASCRIPT) {
            const hasEnum = model.enum.length > 0;
            const hasEnums = model.enums.length > 0;
            return hasEnum || hasEnums;
        }
        return true;
    });
}
