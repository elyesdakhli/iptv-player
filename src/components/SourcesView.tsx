import {useContext, useEffect, useState} from "react";
import {Button, Col} from "react-bootstrap";
import {GlobalInfos} from "../types/Types.ts";
import {connect} from "../api/xtreamCodesApi.ts";
import {SourcesManager} from "./SourcesManager.tsx";
import {SourceContext} from "../context/SourceContext.ts";

export type SourceViewProps = {
    onClearData: () => void,
    onSourcesChanged: () => void
}

function SourcesView ({ onClearData, onSourcesChanged}: SourceViewProps) {
    const source = useContext(SourceContext);
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
        <>
            {source && (
                <Col><strong>Source: </strong>{source.name}</Col>

            )}
            {globalInfos &&
                <>
                    <Col><strong>Status: </strong><span className=
                                                         {globalInfos?.userInfo.status === 'Active' ?
                                                             "text-success" : 'text-warning'}>{globalInfos?.userInfo.status}</span></Col>
                    <Col><strong>Expires on: </strong>{formatDate(globalInfos?.userInfo.expDate) }</Col>
                </>
            }
            <Col>
                <span className="me-1">
                    <SourcesManager onSourcesChanged={onSourcesChanged}/>
                </span>
                {source && (
                    <Button variant="danger" onClick={onClearData} style={{ cursor: "pointer" }}>Clear & Reload</Button>
                )}
            </Col>

        </>
    </>
}
export default SourcesView;