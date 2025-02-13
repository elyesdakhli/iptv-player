import { Category, Stream } from "../types/Types.ts";
import { useContext, useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import "../css/streams.css";
import { SourceContext } from "../context/SourceContext.ts";
import { ModeContext } from "../context/ModeContext.ts";
import { LoadingSpinner } from "./common/LoadingSpinner.tsx";
import { ErrorAlert } from "./common/ErrorAlert.tsx";
import { SearchBar } from "./common/SearchBar.tsx";
import { useFetchStreams } from "../hooks/useFetchStreams.ts";
import fallbackFilmImage from "../assets/film-play-transparant.png";

type StreamsViewProps = {
  category: Category | null;
  onSelect: (stream: Stream) => void;
};

function StreamsView({ category, onSelect }: StreamsViewProps) {
  const source = useContext(SourceContext);
  const mode = useContext(ModeContext);
  const { loading, apiError, streams } = useFetchStreams({
    source,
    mode,
    category,
  });
  const [displayStreams, setDisplayStreams] = useState<Stream[]>(streams);

  useEffect(() => {
    setDisplayStreams(streams);
  }, [streams]);

  function filterStreams(searchValue: string, streams: Stream[]) {
    return !searchValue
      ? streams
      : streams.filter((stream) =>
          stream.name.toLowerCase().includes(searchValue.toLowerCase())
        );
  }

  function handleSearch(searchValue: string) {
    if (!streams) return;
    setDisplayStreams(filterStreams(searchValue, streams));
  }

  if (!category) return <></>;
  return (
    <div className="container">
      <div className="row">
        <LoadingSpinner visible={loading} />
        <ErrorAlert error={apiError} />
      </div>
      <div className="row p-10 flex-box">
        <Col xs={2}>
          <h4>Channels</h4>
        </Col>
        <SearchBar onSearch={handleSearch} searchPlaceHolder="Search channel" />
      </div>
      <Row className="vh-100 g-4 mt-3 vertical-scroll">
        <StreamItems streams={displayStreams} onSelect={onSelect} />
      </Row>
    </div>
  );
}

const StreamItems = ({
  streams,
  onSelect,
}: {
  streams: Stream[] | undefined;
  onSelect: (stream: Stream) => void;
}) => {
  const mode = useContext(ModeContext);
  return mode === "TV" ? (
    <>
      {streams?.map((stream, index) => (
        <TvStreamCard
          stream={stream}
          index={index}
          key={index}
          onSelect={onSelect}
        />
      ))}
    </>
  ) : (
    <>
      {streams?.map((stream, index) => (
        <FilmStreamCard stream={stream} key={index} onSelect={onSelect} />
      ))}
    </>
  );
};

type StreamCardProps = {
  stream: Stream;
  index: number;
  onSelect: (stream: Stream) => void;
};
const TvStreamCard = ({ stream, index, onSelect }: StreamCardProps) => {
  const [hoveredStreamInd, setHoveredStreamInd] = useState(-1);

  return (
    <Col xs={12} sm={6} md={4} lg={3}>
      <Card
        className={`${
          hoveredStreamInd == index
            ? "border-primary shadow-lg"
            : "border-light"
        }`}
        onClick={() => onSelect(stream)}
        onMouseEnter={() => setHoveredStreamInd(index)}
        onMouseLeave={() => setHoveredStreamInd(-1)}
      >
        <Card.Body>
          <Card.Body>
            <img src={stream.streamIcon} alt={""} height={25} width={25} />{" "}
            {stream.name}
          </Card.Body>
        </Card.Body>
      </Card>
    </Col>
  );
};

const FilmStreamCard = ({
  stream,
  onSelect,
}: {
  stream: Stream;
  onSelect: (stream: Stream) => void;
}) => {
  const [error, setError] = useState(false);

  return (
    <Col xs={12} sm={6} md={4} lg={2}>
      <Card style={{ cursor: "pointer" }} onClick={() => onSelect(stream)}>
        <Card.Img
          variant="top"
          src={error ? fallbackFilmImage : stream.streamIcon}
          onError={() => setError(true)}
        />
        <Card.Body>
          {stream.name}
          {/*<Card.Title>{stream.name}</Card.Title>*/}
        </Card.Body>
      </Card>
    </Col>
  );
};

export default StreamsView;
