import {Category, Stream} from "../types/Types.ts";
import {useContext, useEffect, useState} from "react";
import {getStreams} from "../api/xtreamCodesApi.ts";
import {Button, Card, Col, Form, Row} from "react-bootstrap";
import * as React from "react";
import {Search, X} from "react-bootstrap-icons";
import '../css/streams.css';
import {SourceContext} from "../context/SourceContext.ts";

type StreamsViewProps = {
    category: Category | null;
    onSelect: (stream : Stream) => void;
}

function StreamsView ({category, onSelect}: StreamsViewProps) {
    const source = useContext(SourceContext);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState<Error|null>(Error);
    const [streams, setStreams] = useState<Stream[]>()
    const [selectedStreamInd, setSelectedStreamInd] = useState(-1);
    const [filterValue, setFilterValue] = useState('');
    const [displayStreams, setDisplayStreams] = useState<Stream[]>();
    const [hoveredStreamInd, setHoveredStreamInd] = useState(-1);

    useEffect(() => {
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
        <div className="row p-10 flex-box justify-content-center">
            <Col xs={2}><h4>Channels</h4></Col>
            <Col xs={2} className="p-10">
                <Form.Control type="text" placeholder="Search channel" value={filterValue}
                              onChange={(event) => handleSearch(event)}/>
            </Col>
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
            <Col xs={1}><Search /></Col>
        </div>
        <Row className="vh-100 g-4 mt-3 vertical-scroll"> {/* g-4 adds spacing between grid items */}
            {displayStreams?.map((stream, index) => (
                <Col key={stream.streamId} xs={12} sm={6} md={4} lg={3}>
                    <Card className={`h-100 ${(selectedStreamInd === index || hoveredStreamInd == index)? "border-primary shadow-lg" : "border-light"}`}
                          onClick={() => {
                             onSelect(stream);
                          }}
                            onMouseEnter={() => {setHoveredStreamInd(index)}}
                            onMouseLeave={() => {setHoveredStreamInd(-1)}}
                          >
                        <Card.Body>
                            <Card.Body><img src={stream.streamIcon} alt={''} height={25} width={25}/> {stream.name}</Card.Body>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    </div>
}
export default StreamsView;