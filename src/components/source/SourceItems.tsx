import {Source} from "../../types/Types.ts";
import {forwardRef, Ref, useImperativeHandle, useState} from "react";
import {ListGroup, ListGroupItem} from "react-bootstrap";

export type SourceItemsProps = {
    sources: Source[];
    onSelect: (source: Source) => void;
}
export type SourceItemsRef = {
    clearSelection: () => void;
}

export const SourceItems = forwardRef(({sources, onSelect}: SourceItemsProps, ref: Ref<SourceItemsRef>) => {
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