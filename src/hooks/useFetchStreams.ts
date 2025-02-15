import {AppMode, Category, Stream} from "../types/Types.ts";
import {useCallback, useContext, useEffect, useState} from "react";
import {getStreams} from "../api/xtreamCodesApi.ts";
import {SourceContext} from "../context/SourceContext.ts";
import {ModeContext} from "../context/ModeContext.ts";

export type FetchStreamsProps = {
    category: Category|null
}
export const useFetchStreams = ({ category}: FetchStreamsProps) => {

    const source = useContext(SourceContext);
    const mode = useContext(ModeContext);
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