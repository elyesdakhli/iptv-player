import {Stream, VodStream} from "../types/Types.ts";
import {useContext, useEffect, useState} from "react";
import ReactPlayer from "react-player";
import {Button, Col, Row} from "react-bootstrap";
import {SourceContext} from "../context/SourceContext.ts";
import {ModeContext} from "../context/ModeContext.ts";

type ChannelViewProps = {
    stream: Stream | VodStream | null;
    onCancelPlay: () => void;
}
function ChannelView({stream, onCancelPlay}: ChannelViewProps){
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
                    <Col xs={12} sm={10}>
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
export default ChannelView;