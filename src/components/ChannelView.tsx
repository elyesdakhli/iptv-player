import {Stream, VodStream} from "../types/Types.ts";
import {useContext, useEffect, useState} from "react";
import ReactPlayer from "react-player";
import {Button, Card, Col, Row} from "react-bootstrap";
import {SourceContext} from "../context/SourceContext.ts";
import {ModeContext} from "../context/ModeContext.ts";
import {getVodStreamInfo, VodStreamInfo} from "../api/xtreamCodesApi.ts";
import {LoadingSpinner} from "./common/LoadingSpinner.tsx";
import fallBackImage from '../assets/film-play-transparant.png';

type ChannelViewProps = {
    stream: Stream | VodStream | null;
    onCancelPlay: () => void;
}
export const ChannelView = ({stream, onCancelPlay}: ChannelViewProps) => {
    const source = useContext(SourceContext);
    const mode = useContext(ModeContext);
    const [streamUrl, setStreamUrl] = useState<string>('');

    function buildStreamUrl() {
        if(!stream)
            throw new Error('Stream is not defined');

        if(!source)
            throw new Error('Source is not defined');

        const streamType = mode === 'FILMS' ? 'movie' : 'live';
        const streamExtension = mode === 'FILMS' ? (stream as VodStream).containerExtension : 'm3u8';

        return `${source.url}/${streamType}/${source.username}/${source.password}/${stream.streamId}.${streamExtension}`;
    }

    useEffect(()=> {
        if(!source || !stream)
            return;
        setStreamUrl(buildStreamUrl())
    }, [source, stream]);

    if(!source || !stream?.streamId)
        return <></>


    return <>
        { source && stream?.streamId && (
            <>
                <Row className="justify-content-center g-2">
                    <Col xs={1}><Button onClick={onCancelPlay} variant="secondary">Back</Button></Col>
                    <Col><h4><img src={stream.streamIcon} alt={''} height={25} width={25}/> {stream.name}</h4></Col>
                </Row>
                <Row className="justify-content-center mt-3">
                    <Col xs={12} sm={2} lg={3}>
                        <VodDetailsView stream={(stream as VodStream)} />
                    </Col>
                    <Col xs={12} sm={10} lg={8}>
                        <ReactPlayer
                            url={streamUrl} // Supports HLS, DASH, etc.
                            controls
                            playing // Auto-play (may require `muted` due to browser policies)
                            width="100%"
                            height="auto"
                            config={{
                                file: {
                                    forceHLS: mode === 'TV', // Force HLS.js for broader compatibility
                                    hlsOptions: {
                                        maxBufferSize: 10 * 1000 * 1000, // Adjust buffer size if needed
                                    },
                                },
                            }}
                            onError={(error) => console.log(error)}
                        />
                    </Col>
                </Row>
            </>)
    }</>
}

const VodDetailsView = ({stream}: {stream: VodStream}) => {
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