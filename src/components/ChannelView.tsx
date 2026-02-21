import {Stream, VodStream} from "../types/Types.ts";
import {useContext, useEffect, useState} from "react";
import {Button, Col, Row} from "react-bootstrap";
import {SourceContext} from "../context/SourceContext.ts";
import {ModeContext} from "../context/ModeContext.ts";
import {VodDetailsView} from "./VodDetailsView.tsx";
import ReactPlayer from "react-player";
import CopyToClipboard from "./common/CopyToClipboard.tsx";
import {ChannelEpg} from "./ChannelEpg.tsx";
import {MyImage} from "./common/MyImage.tsx";
import fallbackFilmImage from "../assets/film-play-transparant.png";

type ChannelViewProps = {
  stream: Stream | VodStream | null;
  onCancelPlay: () => void;
};
export const ChannelView = ({ stream, onCancelPlay }: ChannelViewProps) => {
  const source = useContext(SourceContext);
  const mode = useContext(ModeContext);
  const [streamUrl, setStreamUrl] = useState<string>("");

  function buildStreamUrl() {
    const streamType = mode === "FILMS" ? "movie" : "live";
    const streamExtension =
      mode === "FILMS" ? (stream as VodStream).containerExtension : "m3u8";

    return `${source!.url}/${streamType}/${source!.username}/${source!.password}/${stream!.streamId}.${streamExtension}`;
  }

  useEffect(() => {
    if (!source || !stream) return;
    setStreamUrl(buildStreamUrl());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, stream]);

  if (!source || !stream?.streamId) return <></>;

  return (
    <>
      {source && stream?.streamId && (
        <>
          <Row className="justify-content-center py-2 mx-0">
            <Col xs={12} sm={10} lg={8}>
              <div className="d-flex align-items-center gap-2">
                <Button onClick={onCancelPlay} variant="secondary" size="sm">Back</Button>
                <div className="d-flex align-items-center gap-1 flex-grow-1 overflow-hidden">
                  <MyImage url={stream.streamIcon} height={20} width={20} fallbackImage={fallbackFilmImage}/>
                  <span className="fw-bold small text-truncate">{stream.name}</span>
                </div>
                <CopyToClipboard textToCopy={streamUrl} buttonLabel="Copy link" />
              </div>
            </Col>
          </Row>
          <Row className="justify-content-center mt-3 mx-0">
            <Col xs={12} sm={10} lg={8}>
              <ReactPlayer
                url={streamUrl} // Supports HLS, DASH, etc.
                controls
                playing // Auto-play (may require `muted` due to browser policies)
                width="100%"
                height="auto"
                config={{
                  file: {
                    forceHLS: mode === "TV", // Force HLS.js for broader compatibility
                    hlsOptions: {
                      maxBufferSize: 10 * 1000 * 1000, // Adjust buffer size if needed
                    },
                    attributes: {
                      crossOrigin: "anonymous",
                      }
                  }
                }}
                onError={(error) => console.error(error)}
              />
              {mode === "FILMS" && <VodDetailsView stream={stream as VodStream} />}
            </Col>
            {mode === "TV" && (
              <Col xs={12} sm={2} lg={3}>
                <ChannelEpg stream={stream} className="vertical-scroll"/>
              </Col>
            )}
          </Row>
        </>
      )}
    </>
  );
};
