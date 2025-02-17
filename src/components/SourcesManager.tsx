import {Alert, Button, Form, FormGroup, ListGroup, ListGroupItem, Modal} from "react-bootstrap";
import * as React from "react";
import {forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState} from "react";
import {storageApi} from "../api/storageApi.ts";
import {Source} from "../types/Types.ts";


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

type SourceItemsProps = {
    sources: Source[];
    onSelect: (source: Source) => void;
}
type SourceItemsRef = {
    clearSelection: () => void;
}
const SourceItems = forwardRef(({sources, onSelect}: SourceItemsProps, ref: Ref<SourceItemsRef>) => {
    const [selectedSourceInd, setSelectedSourceInd] = useState(-1);

    useImperativeHandle(ref, () => ({
        clearSelection: () => setSelectedSourceInd(-1)
    }));

    return (
        <ListGroup>
            {sources?.map( (source, ind) => (
                <ListGroupItem key={source.name} className={(selectedSourceInd === ind ? "active": "")}
                               onClick={() => {
                                   setSelectedSourceInd(ind);
                                   onSelect(source);
                               }
                               }>{source.name}</ListGroupItem>))
            }
        </ListGroup>
    )
})

type SourceEditViewProps = {
    source: Source;
    sources: Source[];
    isEdit: boolean;
    onSave: (source: Source) => void;
    onDelete: (source: Source) => void;
    onCancel: () => void;
}
const SourceEditView = ({source, isEdit, sources, onSave, onCancel, onDelete}: SourceEditViewProps) => {
    const [formData, setFormData] = useState<Source>(source);
    const [validated, setValidated] = useState(false);
    const [createSourceError, setCreateSourceError] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    useEffect(() => {
        setFormData(source);
    }, [source]);

    const saveNewSource = (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();
        if (!form.checkValidity()) {
            return;
        }
        //to check
        setValidated(true);
        const sourcesWithSameName = sources?.filter( (src) => src.name === formData.name).length;
        if(sourcesWithSameName && sourcesWithSameName > 0){
            setCreateSourceError('A source with this name already exists');
            return;
        }
        setCreateSourceError('');
        onSave(formData);

    }

    const deleteSource = () => {
        if(!formData.name)
            return;
        onDelete(formData);
    }

    return (
        <Form noValidate validated={validated} onSubmit={saveNewSource} ref={formRef}>
            <div className="row mt-1">
                {createSourceError &&<Alert variant="danger">
                    {createSourceError}
                </Alert>}
                <FormGroup>
                    <Form.Label className="fw-bolder">Source Name</Form.Label>
                    <Form.Control type="text" placeholder="Source name" name="name" value={formData.name} onChange={handleChange} required/>
                </FormGroup>
                <FormGroup className="mt-2">
                    <Form.Label className="fw-bolder">Server url</Form.Label>
                    <Form.Control type="text" placeholder="Server url" name="url" value={formData.url} onChange={handleChange} required/>
                </FormGroup>
                <FormGroup className="mt-2">
                    <Form.Label className="fw-bolder">Username</Form.Label>
                    <Form.Control type="text" placeholder="Username" name="username" value={formData.username} onChange={handleChange} required/>
                </FormGroup>
                <FormGroup className="mt-2">
                    <Form.Label className="fw-bolder">Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" name="password" value={formData.password} onChange={handleChange} required/>
                </FormGroup>
                <FormGroup className="mt-2">
                    <Form.Label className="fw-bolder">Active</Form.Label>
                    <Form.Check checked={formData.active} name="active"
                                onChange={(e) => setFormData({...formData, active: e.target.checked})}></Form.Check>
                </FormGroup>
            </div>
            <div className="row mt-3 justify-content-center">
                <Button className="col-md-3 mx-1" variant="primary" disabled={!formRef.current?.checkValidity()} type="submit">{!isEdit ? 'Add' : 'Save'}</Button>
                <Button className="col-md-3 mx-1" variant="light" onClick={onCancel}>Cancel</Button>
                <Button className="col-md-3 mx-1" variant="danger" disabled={!isEdit} onClick={deleteSource}>Delete</Button>
            </div>
        </Form>
    )
}