import {useCallback, useContext, useEffect, useState} from "react";
import {SourceContext} from "../context/SourceContext.ts";
import {getCategories} from "../api/xtreamCodesApi.ts";
import {storageApi} from "../api/storageApi.ts";
import {Category} from "../types/Types.ts";

export const useFetchCategories = (onFetchComplete: (categories: Category[]) => void) => {
    const source = useContext(SourceContext);

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState<Error|null>(Error);


    const fetchFromApi = () => {
        if(!source)
            return;
        setLoading(true);
        setApiError(null);
        getCategories(source)
            .then(categoriesData => {
                setCategories(categoriesData);
                storageApi.saveCategories(source.name, categoriesData);
                console.log("Categories loaded from api.");
                onFetchComplete(categories);
            })
            .catch( (error) => setApiError(error))
            .finally( () => setLoading(false));
    }

    const fetchFromCache = (): Category[] => {
        if(!source)
            return [];
        const localStorageCategories = storageApi.getCategories(source.name)

        if(!localStorageCategories)
            return [];
        setCategories(localStorageCategories);
        setApiError(null);
        setLoading(false);
        console.log("Categories loaded from cache.");
        return localStorageCategories;

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
    }, []);

    useEffect(() => {
        console.log("useFetchCategories useEffect called for source " + source?.name);
        doFetch();
    }, [source, doFetch]);

    return {categories, loading, apiError, refetchCategories: doFetch};
}