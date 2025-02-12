import {VodStream} from "../types/Types.ts";
import {useContext, useEffect, useState} from "react";
import {ModeContext} from "../context/ModeContext.ts";
import {SourceContext} from "../context/SourceContext.ts";
import {getVodStreamInfo, VodStreamInfo} from "../api/xtreamCodesApi.ts";
import {LoadingSpinner} from "./common/LoadingSpinner.tsx";
import {Card} from "react-bootstrap";
import fallBackImage from "../assets/film-play-transparant.png";

export const VodDetailsView = ({stream}: {stream: VodStream}) => {
    const mode = useContext(ModeContext);
    const source = useContext(SourceContext);

    const [loading, setLoading] = useState(false);
    const [vodInfo, setVodInfo] = useState<VodStreamInfo | null>(null);
    const [noImage, setNoImage] = useState(false);

    const fetchVodInfo = async (): Promise<VodStreamInfo |null> => {
        if(!source || !stream?.streamId)
            return Promise.resolve(null);

        return  await getVodStreamInfo(source, stream?.streamId.toString())

    }
    useEffect(() => {
        setLoading(true);
        fetchVodInfo()
            .then((vodInfo: VodStreamInfo|null) => {
                setVodInfo(vodInfo);
            })
            .finally(() => setLoading(false));
    }, [stream]);

    return (
        (mode === 'FILMS' && vodInfo) && (
            <>
                <LoadingSpinner visible={loading} />
                <Card>
                    <Card.Img variant="top" src={noImage ? fallBackImage : vodInfo.movieImage} onError={() => setNoImage(true)}/>
                    <Card.Body>
                        <Card.Title>{stream.name}</Card.Title>
                        <Card.Text>
                            <p><strong>Genre:</strong> {vodInfo.genre}</p>
                            <p><strong>Director:</strong> {vodInfo.director}</p>
                            <p><strong>Release Date:</strong> {vodInfo.releaseDate}</p>
                            <p><strong>Duration:</strong> {vodInfo.duration}</p>
                            <p><strong>Description:</strong> {vodInfo.description}</p>
                            <p><strong>Cast:</strong> {vodInfo.cast}</p>
                        </Card.Text>
                    </Card.Body>
                </Card>
            </>
        )
    )
}