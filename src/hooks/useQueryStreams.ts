import {getStreams} from "../api/xtreamCodesApi.ts";
import {Category} from "../types/Types.ts";
import {useQuery} from "@tanstack/react-query";
import {useCallback, useContext} from "react";
import {SourceContext} from "../context/SourceContext.ts";
import {ModeContext} from "../context/ModeContext.ts";


export type UseQueryStreamsProps = {
    category: Category|null;
}

export const useQueryStreams = ({ category}: UseQueryStreamsProps) => {

    const source = useContext(SourceContext);
    const mode = useContext(ModeContext);

    const fetchStreams = useCallback(async () => {
        if (!source || !category) return [];
        return await getStreams(source, category, mode);
    }, [source, category, mode]);

    const {data, isPending, error, refetch} = useQuery({
        queryKey: ['streams', source, mode, category],
        queryFn: fetchStreams,
    });
    //console.log("useQueryStreams: mode: ", mode, " category: ", category?.categoryName, " source: ", source?.name);
    return {streams: data||[], loading: isPending, apiError: error, fetchStreams: refetch};
};