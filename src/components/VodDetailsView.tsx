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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, stream]);

  return (
    mode === "FILMS" &&
    vodInfo && (
      <>
        <LoadingSpinner visible={loading} />
        <Card className="mt-2" style={{ fontSize: '0.78rem' }}>
          <div className="d-flex gap-2 p-2">
            <img
              src={noImage ? fallBackImage : proxyPrefix(vodInfo.movieImage)}
              onError={() => setNoImage(true)}
              style={{ width: 70, height: 100, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
            />
            <div style={{ minWidth: 0 }}>
              <div className="fw-semibold text-truncate mb-1">{stream.name}</div>
              {vodInfo.genre && <div className="text-muted text-truncate">{vodInfo.genre}</div>}
              <div><StarFill style={{ color: 'gold' }} size={10} /> {stream.rating}</div>
              {vodInfo.releaseDate && <div>{vodInfo.releaseDate}</div>}
              {vodInfo.duration && <div>{vodInfo.duration}</div>}
              {vodInfo.country && <div>{vodInfo.country}</div>}
              {vodInfo.director && <div className="text-truncate">Dir: {vodInfo.director}</div>}
            </div>
          </div>
          {vodInfo.description && (
            <div className="px-2 pb-2 text-muted" style={{ fontSize: '0.7rem', overflow: 'hidden', maxHeight: '4.5rem' }}>
              {vodInfo.description}
            </div>
          )}
        </Card>
      </>
    )
  );
};
