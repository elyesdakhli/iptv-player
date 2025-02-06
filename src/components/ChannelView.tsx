import {Source, Stream} from "../types/Types.ts";
import {useEffect, useState} from "react";
import ReactPlayer from "react-player";

type ChannelViewProps = {
    source: Source | null;
    stream: Stream | null;
}
function ChannelView({source, stream}: ChannelViewProps){

    const [streamUrl, setStreamUrl] = useState<string>('');
    useEffect(()=> {
        if(!source || !stream)
            return;
        setStreamUrl(`${source.url}/live/${source.username}/${source.password}/${stream.streamId}.m3u8`)
    }, [source, stream]);

    if(!source || !stream?.streamId)
        return <></>


    return <>
        { source && stream?.streamId &&
            <div className="p-50 text-center">
                <h4><img src={stream.streamIcon} alt={''} height={25} width={25}/> {stream.name}</h4>
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
            </div>
    }</>
}
export default ChannelView;