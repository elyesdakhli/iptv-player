import {useCallback, useContext, useEffect, useState} from "react";
import {SourceContext} from "../context/SourceContext.ts";
import {getCategories} from "../api/xtreamCodesApi.ts";
import {storageApi} from "../api/storageApi.ts";
import {AppMode, Category} from "../types/Types.ts";
import {ModeContext} from "../context/ModeContext.ts";

export const useFetchCategories = (...staticCategories: Category[]) => {
    const source = useContext(SourceContext);
    const mode = useContext(ModeContext);
    console.log('useFetchCategories rendered for mode ' + mode);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState<Error|null>(Error);

    const appendCategories = (categories: Category[], append: Category[]): Category[] => {
        return [...categories, ...append];
    }

    const fetchFromApi = (fetchMode: AppMode) => {
        if(!source)
            return;
        setLoading(true);
        setApiError(null);
        getCategories(source, fetchMode)
            .then(categoriesData => {
                setCategories(appendCategories(staticCategories, categoriesData));
                storageApi.saveCategories(source.name, fetchMode, categoriesData);
                console.log("Categories loaded from api.");
            })
            .catch( (error) => setApiError(error))
            .finally( () => setLoading(false));
    }

    const fetchFromCache = (fetchMode: AppMode): Category[] => {
        if(!source)
            return [];
        const localStorageCategories = storageApi.getCategories(source.name, fetchMode);

        if(!localStorageCategories)
            return [];
        const result = appendCategories(staticCategories, localStorageCategories);
        setCategories(result);
        setApiError(null);
        setLoading(false);
        console.log("Categories loaded from cache for mode " + mode);
        return result;

    }

    const doFetch = useCallback( (fetchMode: AppMode) => {
        if(!source)
            return;
        //Getting categories from cache (localstorage)
        const cacheCategories = fetchFromCache(fetchMode);
        if(cacheCategories?.length > 0)
            return;
        //Getting categories from api
        fetchFromApi(fetchMode);
    }, []);

    useEffect(() => {
        console.log("useFetchCategories useEffect called for source " + source?.name + ' and mode ' + mode);
        doFetch(mode);
    }, [source, mode, doFetch]);

    return {categories, loading, apiError, reFetchCategories: doFetch};
}