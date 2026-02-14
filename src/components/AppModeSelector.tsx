import {AppMode} from "../types/Types.ts";
import {Dropdown, DropdownButton} from "react-bootstrap";

export const AppModeSelector = ({mode, onSelect}: {mode: AppMode; onSelect: (mode: AppMode) => void}) => {
    return (
        <DropdownButton title={mode || "Mode"} onSelect={(event) => {
                onSelect(event as AppMode);
              }
            } variant="secondary">
            <Dropdown.Item eventKey="TV">TV</Dropdown.Item>
            <Dropdown.Item eventKey="FILMS">Films</Dropdown.Item>
            <Dropdown.Item eventKey="SERIES" disabled>Series</Dropdown.Item>
        </DropdownButton>
    )
}
