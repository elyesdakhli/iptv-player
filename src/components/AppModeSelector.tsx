import {AppMode} from "../types/Types.ts";
import {Dropdown, DropdownButton} from "react-bootstrap";
import {useContext, useState} from "react";
import {SourceContext} from "../context/SourceContext.ts";

export const AppModeSelector = ({onSelect}: {onSelect: (mode: AppMode) => void}) => {
    const [mode, setMode] = useState('TV');
    const source = useContext(SourceContext);

    return (
        source && (
            <DropdownButton title={mode ||"Mode" } onSelect={(event) => {
                    setMode(event as AppMode);
                    onSelect(event as AppMode)
                  }
                } variant="success">
                <Dropdown.Item eventKey="TV">TV</Dropdown.Item>
                <Dropdown.Item eventKey="FILMS">Films</Dropdown.Item>
                <Dropdown.Item eventKey="SERIES">Series</Dropdown.Item>
            </DropdownButton>
        )
    )
}