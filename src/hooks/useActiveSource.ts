import {useCallback, useMemo} from "react";
import {storageApi} from "../api/storageApi.ts";
import {Source} from "../types/Types.ts";

export function useActiveSource() {

    const loadActiveSource = useCallback((): Source | null => {
        console.log("loaded active source.");
        return storageApi.getActiveSource();
    }, []);

    const activeSource = useMemo(() => {
        console.log("useActiveSource useMemo called");
        return loadActiveSource();
    }, [loadActiveSource]);

    return {activeSource, loadActiveSource};
}