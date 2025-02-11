import {Stream} from "../types/Types.ts";
import {useContext, useEffect, useState} from "react";
import ReactPlayer from "react-player";
import {Button, Col, Row} from "react-bootstrap";
import {SourceContext} from "../context/SourceContext.ts";

type ChannelViewProps = {
    stream: Stream | null;
    onCancelPlay: () => void;
}
function ChannelView({stream, onCancelPlay}: ChannelViewProps){
    const source = useContext(SourceContext);
    const [streamUrl, setStreamUrl] = useState<string>('');
    useEffect(()=> {
        if(!source || !stream)
            return;
        setStreamUrl(`${source.url}/live/${source.username}/${source.password}/${stream.streamId}.m3u8`)
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
                                    forceHLS: true, // Force HLS.js for broader compatibility
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