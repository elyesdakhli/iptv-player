import {proxyPrefix} from "../../utils/proxy.ts";
import {memo, PropsWithChildren, useState} from "react";

export const MyImage = memo(({ url, height, width, fallbackImage, className, children }:
                        PropsWithChildren & { url: string; height?: number; width?: number, fallbackImage?: string, className?: string }) => {

    const [isError, setIsError] = useState(false);

    if (!url || isError) {
        if (fallbackImage) {
            return <img src={fallbackImage} alt="" height={height} width={width} className={className} />;
        }
        return <span>{children}</span>;
    }

    const imgSrc = url.startsWith('https') ? url : proxyPrefix(url);

    return (
        <img
            src={imgSrc}
            alt=""
            height={height}
            width={width}
            className={className}
            onError={() => setIsError(true)}
        />
    );
});
