import {useEffect, useState} from "react";
import {Button, Col} from "react-bootstrap";
import {GlobalInfos} from "../types/Types.ts";
import {connect} from "../api/xtreamCodesApi.ts";
import {SourcesManager} from "./SourcesManager.tsx";
import {useActiveSource} from "../hooks/useActiveSource.ts";

export type SourceViewProps = {
    onClearData: (() => void) | undefined;
    onSourcesChanged: (() => void) | undefined;
}

function SourcesView ({ onClearData, onSourcesChanged}: SourceViewProps) {
    const { activeSource } = useActiveSource();
    const [globalInfos, setGlobalInfos] = useState<GlobalInfos | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [apiError, setApiError] = useState<Error|null>(null);

    useEffect(() => {
        if(!activeSource){
            setGlobalInfos(null);
            return;
        }
        console.log("getting global information");
        setLoading(true);
        connect(activeSource)
            .then(result => {
                setGlobalInfos(result);
                setApiError(null);
            })
            .catch((error) => setApiError(error))
            .finally(() => {
                setLoading(false);
            });
    }, [activeSource]);

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
            {activeSource && (
                <Col><strong>Source: </strong>{activeSource.name}</Col>

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
                {activeSource && (
                    <Button variant="danger" onClick={onClearData} style={{ cursor: "pointer" }}>Clear & Reload</Button>
                )}
            </Col>

        </>
    </>
}
export default SourcesView;