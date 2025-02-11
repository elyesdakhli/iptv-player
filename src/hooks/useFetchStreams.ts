import {AppMode, Category, Source, Stream} from "../types/Types.ts";
import {useCallback, useEffect, useState} from "react";
import {getStreams} from "../api/xtreamCodesApi.ts";

export type FetchStreamsProps = {
    source: Source|null;
    mode: AppMode;
    category: Category|null
}
export const useFetchStreams = ({source, mode, category}: FetchStreamsProps) => {

    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState<Error|null>(null);
    const [streams, setStreams] = useState<Stream[]>([]);

    const fetchStreams = useCallback((fetchCat: Category|null, fetchMode: AppMode) => {
        if(!source || !fetchCat)
            return;
        setLoading(true);
        setApiError(null);
        getStreams(source, fetchCat, fetchMode)
            .then(result => {
                setStreams(result);
            })
            .catch(error => setApiError(error))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchStreams(category, mode);
    }, [source, category, mode, fetchStreams]);
    return {loading, apiError, streams, fetchStreams};
}