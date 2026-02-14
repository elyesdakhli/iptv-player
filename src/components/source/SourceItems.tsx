import {Source} from "../../types/Types.ts";
import {ListGroup, ListGroupItem} from "react-bootstrap";

export type SourceItemsProps = {
    sources: Source[];
    selectedIndex: number;
    onSelect: (source: Source, index: number) => void;
}

export const SourceItems = ({sources, selectedIndex, onSelect}: SourceItemsProps) => {
    return (
        <ListGroup>
            {sources?.map( (source, ind) => (
                <ListGroupItem key={source.name} className={(selectedIndex === ind ? "active": "")}
                               onClick={() => onSelect(source, ind)}
                >{source.name}</ListGroupItem>))
            }
        </ListGroup>
    )
}
