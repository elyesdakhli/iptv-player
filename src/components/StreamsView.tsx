import {Category, Stream} from "../types/Types.ts";
import {memo, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {Card, Col, Row} from "react-bootstrap";

import {ModeContext} from "../context/ModeContext.ts";
import {LoadingSpinner} from "./common/LoadingSpinner.tsx";
import {ErrorAlert} from "./common/ErrorAlert.tsx";
import {SearchBar} from "./common/SearchBar.tsx";
import fallbackFilmImage from "../assets/film-play-transparant.png";
import {MyImage} from "./common/MyImage.tsx";
import {Tv} from "react-bootstrap-icons";
import {useQueryStreams} from "../hooks/useQueryStreams.ts";

type StreamsViewProps = {
  category: Category | null;
  onSelect: (stream: Stream) => void;
};

export const StreamsView = memo(({ category, onSelect }: StreamsViewProps) => {
  const { loading, apiError, streams } = useQueryStreams({ category});
  const [searchValue, setSearchValue] = useState("");

  const filteredStreams = useMemo(() => {
    if (!searchValue) return streams;
    return streams.filter((stream) =>
      stream.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [streams, searchValue]);

  useEffect(() => {
    setSearchValue("");
  }, [category]);

  if (!category) return <></>;
  return (
    <div className="container">
      <div className="row">
        <LoadingSpinner visible={loading} />
        <ErrorAlert error={apiError} />
      </div>
      <div className="row mb-2">
        <SearchBar onSearch={setSearchValue} searchPlaceHolder="Search channel" />
      </div>
      <Row className="g-4 mt-3 vertical-scroll">
        <StreamItems streams={filteredStreams} onSelect={onSelect} />
      </Row>
    </div>
  );
});

const StreamItems = memo(({
  streams,
  onSelect,
}: {
  streams: Stream[] | undefined;
  onSelect: (stream: Stream) => void;
}) => {
  const mode = useContext(ModeContext);
  const [displayedStreams, setDisplayedStreams] = useState<Stream[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (streams) {
      setDisplayedStreams(streams.slice(0, 50)); // Initial load
    }
  }, [streams]);

  const loadMore = useCallback(() => {
    if (streams && displayedStreams.length < streams.length) {
      setDisplayedStreams((prev) => [
        ...prev,
        ...streams.slice(prev.length, prev.length + 50),
      ]);
    }
  }, [streams, displayedStreams]);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });
    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current);
    }
  }, [loadMore]);

  return mode === "TV" ? (
    <>
      {displayedStreams?.map((stream, index) => (
        <TvStreamCard
          stream={stream}
          index={index}
          key={index}
          onSelect={onSelect}
        />
      ))}
      <div style={{width: '500px', height: '5px'}} ref={loadMoreRef} />
    </>
  ) : (
    <>
      {displayedStreams?.map((stream, index) => (
        <FilmStreamCard stream={stream} key={index} onSelect={onSelect} />
      ))}
      <div style={{width: '500px', height: '5px'}} ref={loadMoreRef} />
    </>
  );
});

type StreamCardProps = {
  stream: Stream;
  index: number;
  onSelect: (stream: Stream) => void;
};
const TvStreamCard = memo(({ stream, index, onSelect }: StreamCardProps) => {
  const [hoveredStreamInd, setHoveredStreamInd] = useState(-1);

  return (
    <Col xs={6} sm={4} md={3} lg={3}>
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
        <Card.Body className="d-flex align-items-center gap-2 py-2">
          <MyImage url={stream.streamIcon} height={25} width={25}>
            <Tv />
          </MyImage>
          <span className="text-truncate small">{stream.name}</span>
        </Card.Body>
      </Card>
    </Col>
  );
});

const FilmStreamCard = memo(({
  stream,
  onSelect,
}: {
  stream: Stream;
  onSelect: (stream: Stream) => void;
}) => {

  return (
    <Col xs={6} sm={4} md={3} lg={2}>
      <Card style={{ cursor: "pointer" }} onClick={() => onSelect(stream)}>
        <MyImage url={stream.streamIcon} fallbackImage={fallbackFilmImage} className="card-img-top"/>
        <Card.Body className="py-2">
          <span className="small text-truncate d-block">{stream.name}</span>
        </Card.Body>
      </Card>
    </Col>
  );
});
