import {Alert, Button, Form, FormGroup, ListGroup, ListGroupItem, Modal} from "react-bootstrap";
import { useRef, useState} from "react";
import {storageApi} from "../api/storageApi.ts";
import {Source} from "../types/Types.ts";
import * as React from "react";


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
    onSourcesChanged: () => void
}
export const SourcesManager = ({onSourcesChanged}: SourcesManagerProps) => {
    const loadSourcesFromCache= () => storageApi.getSources() || EMPTY_SOURCES;

    const [sources, setSources] = useState<Source[]>(loadSourcesFromCache());
    const [showModal, setShowModal] = useState(false);
    const [showSourceForm, setShowSourceForm] = useState(false);
    const [selectedSourceInd, setSelectedSourceInd] = useState(-1);
    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState<Source>(EMPTY_SOURCE)
    const [createSourceError, setCreateSourceError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleShow = () => {
        setShowModal(!showModal);
    }

    const handleClose = () => {
        setShowModal(false);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
        if(sources.length ===0){
            formData.active = true;
        }
        sources.push(formData);
        storageApi.saveSource(formData);
        setFormData(EMPTY_SOURCE);
        setCreateSourceError('');
        setShowSourceForm(false);
        onSourcesChanged();
    }

    const deleteSource = () => {
        if(!formData.name)
            return;
        setSources(storageApi.deleteSource(formData.name));
        storageApi.cleanCategories(formData.name);
        setFormData(EMPTY_SOURCE);
        setShowSourceForm(false);
        onSourcesChanged();
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

                        <ListGroup>
                            {sources?.map( (source, ind) => (
                                <ListGroupItem key={source.name} className={(selectedSourceInd === ind ? "active": "")}
                                    onClick={() => {
                                        setSelectedSourceInd(ind);
                                        setEditMode(true);
                                        setShowSourceForm(true);
                                        setFormData(source);
                                    }
                                }>{source.name}</ListGroupItem>))
                            }
                        </ListGroup>
                    </div>
                    {showSourceForm && (
                        <div className="col-md-9">
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
                                    <Button className="col-md-3 mx-1" variant="primary" disabled={!formRef.current?.checkValidity()} type="submit">{editMode ? 'Add' : 'Save'}</Button>
                                    <Button className="col-md-3 mx-1" variant="dark" onClick={()=> setShowSourceForm(false)}>Cancel</Button>
                                    <Button className="col-md-3 mx-1" variant="danger" disabled={!editMode} onClick={deleteSource}>Delete</Button>
                                </div>
                            </Form>
                        </div>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {
                    setShowSourceForm(true);
                    setEditMode(false);
                    setFormData(EMPTY_SOURCE);
                    setSelectedSourceInd(-1);
                }
                }>New</Button>
                <Button variant="primary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    </>
}