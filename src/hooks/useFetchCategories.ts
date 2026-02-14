import {useCallback, useContext, useEffect, useState} from "react";
import {SourceContext} from "../context/SourceContext.ts";
import {getCategories} from "../api/xtreamCodesApi.ts";
import {storageApi} from "../api/storageApi.ts";
import {Category} from "../types/Types.ts";
import {ModeContext} from "../context/ModeContext.ts";

export const useFetchCategories = (...staticCategories: Category[]) => {
    const source = useContext(SourceContext);
    const mode = useContext(ModeContext);

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState<Error|null>(null);

    const appendCategories = (categories: Category[], append: Category[]): Category[] => {
        return [...categories, ...append];
    }

    const fetchFromApi = () => {
        if(!source)
            return;
        setLoading(true);
        setApiError(null);
        getCategories(source, mode)
            .then(categoriesData => {
                setCategories(appendCategories(staticCategories, categoriesData));
                storageApi.saveCategories(source.name, mode, categoriesData);
            })
            .catch( (error) => setApiError(error))
            .finally( () => setLoading(false));
    }

    const fetchFromCache = (): Category[] => {
        if(!source)
            return [];
        const localStorageCategories = storageApi.getCategories(source.name, mode);

        if(!localStorageCategories)
            return [];
        const result = appendCategories(staticCategories, localStorageCategories);
        setCategories(result);
        setApiError(null);
        setLoading(false);
        return result;

    }

    const doFetch = useCallback( () => {
        if(!source)
            return;
        //Getting categories from cache (localstorage)
        const cacheCategories = fetchFromCache();
        if(cacheCategories?.length > 0)
            return;
        //Getting categories from api
        fetchFromApi();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, source]);

    useEffect(() => {
        doFetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source, mode]);

    return {categories, loading, apiError, reFetchCategories: doFetch};
}