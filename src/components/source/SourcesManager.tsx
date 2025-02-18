import {Button, Modal} from "react-bootstrap";
import {useRef, useState} from "react";
import {storageApi} from "../../api/storageApi.ts";
import {Source} from "../../types/Types.ts";
import {SourceItems, SourceItemsRef} from "./SourceItems.tsx";
import {SourceEditView} from "./SourceEditView.tsx";


const EMPTY_SOURCE: Source = {
    name: '',
    url: '',
    username: '',
    password: '',
    type: 'XTREAM_CODES',
    active: false
}

const EMPTY_SOURCES: Source[] = [];
type SourcesManagerProps = {
    onSourcesChanged: (() => void) | undefined
}
export const SourcesManager = ({onSourcesChanged}: SourcesManagerProps) => {
    const loadSourcesFromCache= () => storageApi.getSources() || EMPTY_SOURCES;

    const [source, setSource] = useState<Source>(EMPTY_SOURCE);
    const [sources, setSources] = useState<Source[]>(loadSourcesFromCache());
    const [showModal, setShowModal] = useState(false);
    const [showSourceForm, setShowSourceForm] = useState(false);
    const sourceItemsRef = useRef<SourceItemsRef>(null);


    const [editMode, setEditMode] = useState(false);


    const handleShow = () => {
        setShowModal(!showModal);
    }

    const handleClose = () => {
        setShowModal(false);
    }

    const handleSaveSource = (source: Source) => {
        if(sources.length ===0){
            source.active = true;
        }
        sources.push(source);
        storageApi.saveSource(source);
        setSource(EMPTY_SOURCE);

        setShowSourceForm(false);
        setSources(loadSourcesFromCache());
        if(onSourcesChanged)
            onSourcesChanged();
    }

    const handleCancelEdit = () => {
        setShowSourceForm(false);
    }
    const handleDeleteSource = (source: Source) => {
        setSources(storageApi.deleteSource(source.name));
        setSource(EMPTY_SOURCE);
        setShowSourceForm(false);
        if(onSourcesChanged)
            onSourcesChanged();
    }

    const handleSelectSource = (source: Source) => {
        setEditMode(true);
        setShowSourceForm(true);
        setSource(source);
    }

    return <>
        <Button variant="primary" onClick={handleShow}>
            Sources
        </Button>

        <Modal show={showModal} onHide={handleClose} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Sources</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row">
                    <div className="col-md-3">
                        <SourceItems sources={sources} onSelect={handleSelectSource} ref={sourceItemsRef}/>
                    </div>
                    {showSourceForm && (
                        <div className="col-md-9">
                           <SourceEditView source={source} sources={sources} isEdit={editMode}
                                           onSave={handleSaveSource}
                                           onCancel={handleCancelEdit}
                                           onDelete={handleDeleteSource}/>
                        </div>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {
                    setShowSourceForm(true);
                    setEditMode(false);
                    setSource(EMPTY_SOURCE);
                    sourceItemsRef.current?.clearSelection();
                }
                }>New</Button>
                <Button variant="primary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    </>
}



