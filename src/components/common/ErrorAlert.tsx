import {Alert} from "react-bootstrap";

export const ErrorAlert = ({error}:{error: Error | string | null}) => {
    return (
        error && (
            <Alert className="alert alert-danger" variant="danger" role="alert">
                {typeof error === 'object' && 'message' in error ? (error as Error).message : error}
            </Alert>)
    )
};