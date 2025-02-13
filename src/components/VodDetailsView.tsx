import { VodStream } from "../types/Types.ts";
import { useContext, useEffect, useState } from "react";
import { ModeContext } from "../context/ModeContext.ts";
import { SourceContext } from "../context/SourceContext.ts";
import { getVodStreamInfo, VodStreamInfo } from "../api/xtreamCodesApi.ts";
import { LoadingSpinner } from "./common/LoadingSpinner.tsx";
import { Card } from "react-bootstrap";
import fallBackImage from "../assets/film-play-transparant.png";
import { StarFill } from "react-bootstrap-icons";
import {proxyPrefix} from "../utils/proxy.ts";

export const VodDetailsView = ({ stream }: { stream: VodStream }) => {
  const mode = useContext(ModeContext);
  const source = useContext(SourceContext);

  const [loading, setLoading] = useState(false);
  const [vodInfo, setVodInfo] = useState<VodStreamInfo | null>(null);
  const [noImage, setNoImage] = useState(false);

  const fetchVodInfo = async (): Promise<VodStreamInfo | null> => {
    if (!source || !stream?.streamId) return Promise.resolve(null);

    return await getVodStreamInfo(source, stream?.streamId.toString());
  };
  useEffect(() => {
    setLoading(true);
    fetchVodInfo()
      .then((vodInfo: VodStreamInfo | null) => {
        setVodInfo(vodInfo);
      })
      .finally(() => setLoading(false));
  }, [stream]);

  return (
    mode === "FILMS" &&
    vodInfo && (
      <>
        <LoadingSpinner visible={loading} />
        {vodInfo && (
          <Card>
            <Card.Img
              variant="top"
              src={noImage ? fallBackImage : proxyPrefix(vodInfo.movieImage)}
              onError={() => setNoImage(true)}
            />
            <Card.Body>
              <Card.Title>{stream.name}</Card.Title>
              <Card.Text>
                <strong>Genre:</strong> {vodInfo.genre}
              </Card.Text>
              <Card.Text>
                <strong>Rating:</strong> {stream.rating}{" "}
                <StarFill style={{ color: "gold" }} />
              </Card.Text>
              <Card.Text>
                <strong>Director:</strong> {vodInfo.director}
              </Card.Text>
              <Card.Text>
                <strong>Release Date:</strong> {vodInfo.releaseDate}{" "}
              </Card.Text>
              <Card.Text>
                <strong>Country:</strong> {vodInfo.country || "-"}
              </Card.Text>
              <Card.Text>
                <strong>Duration:</strong> {vodInfo.duration}
              </Card.Text>
              <Card.Text>
                <strong>Description:</strong> {vodInfo.description}
              </Card.Text>
              <Card.Text>
                <strong>Cast:</strong> {vodInfo.cast}
              </Card.Text>
            </Card.Body>
          </Card>
        )}
      </>
    )
  );
};
