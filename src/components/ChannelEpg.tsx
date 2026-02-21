import { Card } from "react-bootstrap";
import { Stream } from "../types/Types";
import { getEpg, ShortEpg } from "../api/xtreamCodesApi";
import {useContext, useEffect, useState} from "react";
import { SourceContext } from "../context/SourceContext";
import { LoadingSpinner } from "./common/LoadingSpinner";

export const ChannelEpg = ({ stream, className }: { stream: Stream, className?: string }) => {

  const source = useContext(SourceContext);
  const [loading, setLoading] = useState(false);
  const [shortEpgs, setShortEpgs] = useState<ShortEpg[]>([]);
  
  const fetchEpg = async (): Promise<ShortEpg[]> => {
    if (!source || !stream?.epgChannelId) return [];

    return await getEpg(source, stream.streamId);
  };

  useEffect(() => {
      setLoading(true);
      fetchEpg()
        .then((shortEpgList: ShortEpg[]) => {
            setShortEpgs(shortEpgList);
        })
        .finally(() => setLoading(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source, stream]);

  return (
    <div className={className} style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", fontSize: '0.75rem' }}>
        <div className="fw-semibold text-muted mb-1" style={{ fontSize: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>EPG</div>
        <LoadingSpinner visible={loading} />
        {shortEpgs?.map((shortEpg: ShortEpg) => (
            shortEpg &&
                <Card key={shortEpg.id} className="mt-2">
                    <Card.Body className="py-2 px-3">
                        <div className="fw-semibold mb-1" style={{ fontSize: '0.8rem' }}>{shortEpg.title}</div>
                        <div className="text-muted">{shortEpg.start} → {shortEpg.end}</div>
                        {shortEpg.description && <div className="mt-1">{shortEpg.description}</div>}
                    </Card.Body>
                </Card>
        ))}
    </div>
    
  );
};

