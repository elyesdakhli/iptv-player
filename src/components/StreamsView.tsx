import { Category, Stream} from "../types/Types.ts";
import {useContext, useEffect, useState} from "react";
import {Card, Col, Row} from "react-bootstrap";
import '../css/streams.css';
import {SourceContext} from "../context/SourceContext.ts";
import {ModeContext} from "../context/ModeContext.ts";
import {LoadingSpinner} from "./common/LoadingSpinner.tsx";
import {ErrorAlert} from "./common/ErrorAlert.tsx";
import {SearchBar} from "./common/SearchBar.tsx";
import {useFetchStreams} from "../hooks/useFetchStreams.ts";

type StreamsViewProps = {
    category: Category | null;
    onSelect: (stream : Stream) => void;
}

function StreamsView ({category, onSelect}: StreamsViewProps) {
    const source = useContext(SourceContext);
    const mode = useContext(ModeContext);
    const {loading, apiError, streams} = useFetchStreams({source, mode, category});
    const [displayStreams, setDisplayStreams] = useState<Stream[]>(streams);

    useEffect(() => {
        setDisplayStreams(streams);
    }, [streams]);

    function filterStreams(searchValue: string, streams: Stream[]) {
        return !searchValue ? streams :
            streams.filter(stream => stream.name.toLowerCase().includes(searchValue.toLowerCase()));
    }

    function handleSearch(searchValue: string) {
        if(!streams)
            return;
        setDisplayStreams(filterStreams(searchValue, streams));
    }

    if(!category)
        return <></>
    return <div className="container">
        <div className="row">
            <LoadingSpinner visible={loading}/>
            <ErrorAlert error={apiError}/>
        </div>
        <div className="row p-10 flex-box justify-content-center">
            <Col xs={2}><h4>Channels</h4></Col>
            <SearchBar searchFn={handleSearch} searchPlaceHolder="Search channel" />
        </div>
        <Row className="vh-100 g-4 mt-3 vertical-scroll">
            <StreamItems streams={displayStreams} onSelect={onSelect} />
        </Row>
    </div>
}

const StreamItems = ({streams, onSelect}: {streams: Stream[] | undefined, onSelect: (stream: Stream) => void}) => {
    return (
        <>
            {streams?.map((stream, index) => (
                <StreamCard stream={stream} index={index} key={index} onSelect={onSelect} />
            ))}
        </>
    );
}

type StreamCardProps = {
    stream: Stream;
    index: number;
    onSelect: (stream: Stream) => void;
}
const StreamCard = ({stream, index, onSelect}: StreamCardProps) => {
    const [selectedStreamInd, setSelectedStreamInd] = useState(-1);
    const [hoveredStreamInd, setHoveredStreamInd] = useState(-1);

    return (<Col xs={12} sm={6} md={4} lg={3}>
        <Card className={`h-100 ${(selectedStreamInd === index || hoveredStreamInd == index)? "border-primary shadow-lg" : "border-light"}`}
              onClick={() => {
                  setSelectedStreamInd(index);
                  onSelect(stream)
              }}
              onMouseEnter={() => setHoveredStreamInd(index)}
              onMouseLeave={() => setHoveredStreamInd(-1)}>
            <Card.Body>
                <Card.Body><img src={stream.streamIcon} alt={''} height={25} width={25}/> {stream.name}</Card.Body>
            </Card.Body>
        </Card>
    </Col>)
};

export default StreamsView;