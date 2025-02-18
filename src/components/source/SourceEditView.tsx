import {Source} from "../../types/Types.ts";
import {useEffect, useRef, useState} from "react";
import {Alert, Button, Form, FormGroup} from "react-bootstrap";

export type SourceEditViewProps = {
    source: Source;
    sources: Source[];
    isEdit: boolean;
    onSave: (source: Source) => void;
    onDelete: (source: Source) => void;
    onCancel: () => void;
}
export const SourceEditView = ({source, isEdit, sources, onSave, onCancel, onDelete}: SourceEditViewProps) => {
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