import {Button, Col} from "react-bootstrap";
import {connect} from "../api/xtreamCodesApi.ts";
import {SourcesManager} from "./SourcesManager.tsx";
import {useActiveSource} from "../hooks/useActiveSource.ts";
import {useQuery} from "@tanstack/react-query";
import {LoadingSpinner} from "./common/LoadingSpinner.tsx";
import {ErrorAlert} from "./common/ErrorAlert.tsx";

export type SourceViewProps = {
    onClearData: (() => void) | undefined;
    onSourcesChanged: (() => void) | undefined;
}

function SourcesView ({ onClearData, onSourcesChanged}: SourceViewProps) {
    const { activeSource } = useActiveSource();

    const {data, isPending, isError} = useQuery({
        queryKey: ['globalInfos', activeSource],
        queryFn: () => connect(activeSource),
        staleTime: Infinity
    });

    const formatDate = (expDate: number): string => {
        return new Date(expDate * 1_000).toLocaleDateString();
    }

    return (
        <>
            <LoadingSpinner visible={isPending}/>
            <ErrorAlert error={isError ? 'Error while connecting to source.':''}/>

            <>
            {activeSource && (
                <Col><strong>Source: </strong>{activeSource.name}</Col>

            )}
            {data &&
                <>
                    <Col><strong>Status: </strong><span className=
                                                         {data?.userInfo.status === 'Active' ?
                                                             "text-success" : 'text-warning'}>{data?.userInfo.status}</span></Col>
                    <Col><strong>Expires on: </strong>{formatDate(data?.userInfo.expDate) }</Col>
                </>
            }
            <Col>
                <span className="me-1">
                    <SourcesManager onSourcesChanged={onSourcesChanged}/>
                </span>
                {activeSource && (
                    <Button variant="secondary" onClick={onClearData} style={{ cursor: "pointer" }}>Clear & Reload</Button>
                )}
            </Col>

        </>
        </>)
}
export default SourcesView;