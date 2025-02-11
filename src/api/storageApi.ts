import {AppMode, Category, Source} from "../types/Types.ts";

const STORAGE: Storage = localStorage;
const SOURCE_STORAGE_KEY = 'sources';
const CATEGORY_KEY_POSTFIX = '_cat';

export const save = (key: string, object: any):void => {
    STORAGE.setItem(key, typeof object === 'string' ? object : JSON.stringify(object));
}

export const get = <S>(key: string): S => {
    const itemStr = STORAGE.getItem(key);
    return itemStr ? JSON.parse(itemStr) : null;
}

export const clean = (key: string) => STORAGE.removeItem(key);

export const getCategories = (sourceName: string, mode: AppMode): Category[] =>
    get<Category[]>(`${sourceName}${CATEGORY_KEY_POSTFIX}_${mode}`);

export const saveCategories = (sourceName: string, mode: AppMode, categories: Category[]): void =>
    save(`${sourceName}${CATEGORY_KEY_POSTFIX}_${mode}`, categories);


export const saveSource = (source: Source) => {
    let sources = get<Source[]>(SOURCE_STORAGE_KEY) || [];
    if(source.active && sources.length>0){
        sources = sources.map((src) => {return {...src, active: false}});
    }
    if(sources.filter(src => src.active)?.length ===0){
        source.active = true;
    }
    save(SOURCE_STORAGE_KEY, [...sources, source]);
}

export const getActiveSource = (): Source | null => {
    const sources = get<Source[]>(SOURCE_STORAGE_KEY);
    if(!sources)
        return null;
    if(sources.length === 1)
        return sources[0];

    const activeSources = sources.filter((src: Source) => src.active);
    return (activeSources?.length > 0) ? activeSources[0] : null;
}

export const deleteSource = (sourceName: string): Source[] => {
    const sources = getSources() || [];
    const newSources = sources.filter(src => src.name !== sourceName);
    save(SOURCE_STORAGE_KEY, newSources);
    return newSources;
}

export const getSources = ():Source[] => get<Source[]>(SOURCE_STORAGE_KEY);

export const cleanCategories = (name: string, mode: AppMode) => clean(`${name}${CATEGORY_KEY_POSTFIX}_${mode}`);

export const storageApi = {
    get,
    save,
    clean,
    getCategories,
    saveCategories,
    getActiveSource,
    saveSource,
    getSources,
    cleanCategories,
    deleteSource
}