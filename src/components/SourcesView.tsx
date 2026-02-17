import {Col} from "react-bootstrap";
import {connect} from "../api/xtreamCodesApi.ts";
import {useQuery} from "@tanstack/react-query";
import {LoadingSpinner} from "./common/LoadingSpinner.tsx";
import {ErrorAlert} from "./common/ErrorAlert.tsx";
import {useContext} from "react";
import {SourceContext} from "../context/SourceContext.ts";

function SourcesView () {
    const activeSource = useContext(SourceContext);

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
                    <Col><strong>Expires on: </strong>{formatDate(data?.userInfo.expDate)}</Col>
                </>
            }
        </>
        </>)
}
export default SourcesView;