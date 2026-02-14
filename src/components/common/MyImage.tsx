import {proxyPrefix} from "../../utils/proxy.ts";
import {memo, PropsWithChildren, useState} from "react";

export const MyImage = memo(({ url, height, width, fallbackImage, children }:
                        PropsWithChildren & { url: string; height?: number; width?: number, fallbackImage?: string }) => {

    const [isError, setIsError] = useState(false);

    const imgSrc = url.startsWith('https') ? url : proxyPrefix(url);

    if (isError && !fallbackImage) {
        return <span>{children}</span>;
    }

    return (
        <img
            src={isError ? fallbackImage : imgSrc}
            alt=""
            height={height}
            width={width}
            onError={() => setIsError(true)}
        />
    );
});
