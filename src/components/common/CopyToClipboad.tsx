import {Button} from "react-bootstrap";
import {useState} from "react";

export default function CopyToClipboad({buttonLabel, textToCopy}: {buttonLabel: string, textToCopy: string}) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    return (
        <>
            <Button variant='secondary' onClick={copy} >{copied ? 'Copied !' : buttonLabel}</Button>
        </>
    )
}