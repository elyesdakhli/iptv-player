import {Category, Source, Stream} from "../types/Types.ts";
import {useEffect, useState} from "react";
import {getStreams} from "../api/xtreamCodesApi.ts";
import {Button, Form} from "react-bootstrap";
import * as React from "react";
import {X} from "react-bootstrap-icons";

type StreamsViewProps = {
    source: Source | null;
    category: Category | null;
    onSelect: (stream : Stream) => void;
}

function StreamsView ({category, source, onSelect}: StreamsViewProps) {
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState<Error|null>(Error);
    const [streams, setStreams] = useState<Stream[]>()
    const [selectedStreamInd, setSelectedStreamInd] = useState(-1);
    const [filterValue, setFilterValue] = useState('');
    const [displayStreams, setDisplayStreams] = useState<Stream[]>();

    useEffect(() => {
        console.log("loading category streams...");
        if(!source || !category)
            return;
        setLoading(true);
        setApiError(null);
        getStreams(source, category)
            .then(result => {
                setStreams(result)
                setDisplayStreams(result);
            })
            .catch(error => setApiError(error))
            .finally(() => setLoading(false));
    }, [source, category]);

    useEffect(() => {
        setSelectedStreamInd(-1);
    }, [category]);

    function filterStreams(searchValue: string, streams: Stream[]) {
        return (!filterValue || filterValue === '') ?
            streams :
            streams
                .filter(stream =>
                    stream.name.toLowerCase().includes(searchValue.toLowerCase()));
    }

    function handleSearch(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        if(!streams)
            return;
        const searchValue = event.target.value;
        setFilterValue(searchValue);
        setDisplayStreams(filterStreams(searchValue, streams));
        setSelectedStreamInd(-1);
    }

    function handleClearFilter() {
        setFilterValue('');
        setDisplayStreams(streams);
    }

    if(!category)
        return <></>
    return <div className="container">
        <div className="row">
            {loading &&
                <>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </>}
            {apiError &&
                <>
                    <div className="alert alert-danger" role="alert">
                        Error while getting channels list.
                    </div>
                </>}
        </div>
        <div className="row p-10">
            <div className="col-11 p-10">
                <Form.Control type="text" placeholder="Search channel" value={filterValue}
                              onChange={(event) => handleSearch(event)}/>
            </div>
            {filterValue &&
                <div className="col-1  p-0">
                    <Button variant="link"
                            onClick={() => handleClearFilter()}
                            aria-label="Clear search"
                            className="p-0">
                        <X size={18} />
                    </Button>
                </div>
            }
        </div>
        <ul className="list-group p-3">
            {
                displayStreams?.map((stream, index) => (
                    <li key={stream.streamId}
                        className={selectedStreamInd === index ? "list-group-item active" : "list-group-item"}
                        onClick={() => {
                            setSelectedStreamInd(index);
                            onSelect(stream);
                        }
                        }><img src={stream.streamIcon} alt={''} height={25} width={25}/> {stream.name}</li>
                ))
            }
        </ul>
    </div>
}
export default StreamsView;