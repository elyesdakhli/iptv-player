import {proxyPrefix} from "../../utils/proxy.ts";
import {memo, PropsWithChildren, useEffect, useState} from "react";

export const MyImage = memo(({ url, height, width, fallbackImage, children }:
                        PropsWithChildren & { url: string; height?: number; width?: number, fallbackImage?: any }) => {

    const [imageSrc, setImageSrc] = useState('');
    const [isError, setIsError] = useState(false);

    const fetchImage = async () => {
        try{
            const response = await fetch(proxyPrefix(url));

            return response.ok ? new Promise((resolve) => resolve(response.blob()))
                 : new Promise((reject) => reject(new Error('Failed to fetch image')));
        }catch (e) {
            new Promise((reject) => reject(e));
        }
    }

    useEffect(() => {
        fetchImage()
            .then((blob) => {
                setImageSrc(URL.createObjectURL(blob as Blob));
            })
            .catch(() => {
                if (fallbackImage)
                    setImageSrc(fallbackImage);
                setIsError(true);
            });
    }, []);

    return (
        <>
            {(isError && !fallbackImage) ? (<span>{children}</span>) : (<img src={imageSrc} alt={""} height={height} width={width}/>)}
        </>
    );
});