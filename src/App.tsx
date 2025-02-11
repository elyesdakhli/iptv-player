import SourcesView from "./components/SourcesView.tsx";
import {Col, Dropdown, DropdownButton, Row} from "react-bootstrap";
import {HomeRefs, HomeView} from "./components/HomeView.tsx";
import {useRef, useState} from "react";
import {AppMode} from "./types/Types.ts";
import {ModeContext} from "./context/ModeContext.ts";

function App() {
    const homeViewRef = useRef<HomeRefs>(null);
    const [mode, setMode] = useState<AppMode>('TV')
    console.log("App component rendered for mode " + mode);
    return (
        <>
            <div className="container-fluid">
                <Row className="p-2">
                    <Col><h1 className="text-center">Iptv player</h1></Col>
                    <SourcesView onClearData={homeViewRef.current?.handleClearData}
                                 onSourcesChanged={homeViewRef.current?.handleSourceChanged}/>
                </Row>
                <Row className="align-content-center">
                    <Col>
                        <DropdownButton title={mode ||"Mode" } onSelect={(event) => setMode(event as AppMode)}
                                        variant="success">
                            <Dropdown.Item eventKey="TV">TV</Dropdown.Item>
                            <Dropdown.Item eventKey="FILMS">Films</Dropdown.Item>
                            <Dropdown.Item eventKey="SERIES">Series</Dropdown.Item>
                        </DropdownButton>
                    </Col>
                </Row>
                <ModeContext.Provider value={mode}>
                    <HomeView ref={homeViewRef}/>
                </ModeContext.Provider>
            </div>
        </>
  )
}

export default App;
