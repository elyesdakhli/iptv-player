
export const LoadingSpinner = ({visible}:{visible: boolean}) => (
    <div className="spinner-border" role="status" hidden={!visible}>
        <span className="visually-hidden">Loading...</span>
    </div>
);