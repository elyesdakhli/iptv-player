
import {GlobalInfos, Source} from "../types/Types.ts";
import {useEffect, useState} from "react";
import {connect} from "../api/xtreamCodesApi.ts";
import {Button} from "react-bootstrap";
import {SourcesManager} from "./SourcesManager.tsx";

export type SourceViewProps = {
    source: Source | null,
    onClearData: () => void,
    onSourcesChanged: () => void
}

function SourcesView ({source, onClearData, onSourcesChanged}: SourceViewProps) {
    const [globalInfos, setGlobalInfos] = useState<GlobalInfos | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [apiError, setApiError] = useState<Error|null>(null);

    useEffect(() => {
        if(!source){
            setGlobalInfos(null);
            return;
        }
        console.log("getting global information");
        setLoading(true);
        connect(source)
            .then(result => {
                setGlobalInfos(result);
                setApiError(null);
            })
            .catch((error) => setApiError(error))
            .finally(() => {
                setLoading(false);
            });
    }, [source]);

    const formatDate = (expDate: number): string => {
        return new Date(expDate * 1_000).toLocaleDateString();
    }

    return <>
        <h4>Sources</h4>
        {loading &&
            <>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </>}
        {apiError &&
            <>
                <div className="alert alert-danger" role="alert">
                    Error while getting user and server information.
                </div>
            </>}
        <div className="row">
            {source && (
                <>
                    <span className="col-md"><strong>Url: </strong>{source?.url}</span>
                    <span className="col-md"><strong>User: </strong>{source?.username}</span>
                </>
            )}
            {globalInfos &&
                <>
                    <span className={"col-md"}><strong>Status: </strong><span className=
                                                         {globalInfos?.userInfo.status === 'Active' ?
                                                             "text-success" : 'text-warning'}>{globalInfos?.userInfo.status}</span></span>
                    <span className="col-md"><strong>Expires on: </strong>{formatDate(globalInfos?.userInfo.expDate) }</span>
                </>
            }
            <div className="col-sm-1">
                <SourcesManager onSourcesChanged={onSourcesChanged}/>
            </div>
            {source && (
                <Button className="col-md-1" variant="danger" onClick={onClearData} size="sm" style={{ cursor: "pointer" }}>Clear & Reload</Button>
            )}
        </div>
    </>
}
export default SourcesView;