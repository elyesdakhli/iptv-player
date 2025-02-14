import {proxyPrefix} from "../../utils/proxy.ts";
import {useEffect, useState} from "react";

export const MyImage = ({ url, height, width }: { url: string; height: number; width: number }) => {

    const [imageSrc, setImageSrc] = useState('');

    const fetchImage = async () => {
        const response = await fetch(proxyPrefix(url));
        return response.blob();
    }

    useEffect(() => {
        fetchImage()
            .then((blob) => {
                setImageSrc(URL.createObjectURL(blob));
            })
            .catch((error) => {
                console.error("Error fetching image", error);
            });
    }, []);

    return (
        <img src={imageSrc} alt={""} height={height} width={width} />
    );
}