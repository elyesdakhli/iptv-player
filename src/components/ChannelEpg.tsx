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
    }, [stream]);

  return (
    <div className={className}>
        <LoadingSpinner visible={loading} />
        {shortEpgs &&
            <>
                {shortEpgs.map((shortEpg: ShortEpg) => (
                    shortEpg &&
                        <Card key={shortEpg.id} className="mt-2">
                            <Card.Body>
                                <Card.Title>{shortEpg.title}</Card.Title>
                                <Card.Text><strong>Start:</strong> {shortEpg.start}</Card.Text>
                                <Card.Text><strong>End:</strong> {shortEpg.end}</Card.Text>
                                <Card.Text><strong>Description:</strong> {shortEpg.description}</Card.Text>
                            </Card.Body>
                        </Card>
                ))}

            </>
        }
    </div>
    
  );
};

