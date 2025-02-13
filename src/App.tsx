import SourcesView from "./components/SourcesView.tsx";
import {Col, Row} from "react-bootstrap";
import {HomeRefs, HomeView} from "./components/HomeView.tsx";
import {useRef, useState} from "react";
import {AppMode} from "./types/Types.ts";
import {ModeContext} from "./context/ModeContext.ts";
import {AppModeSelector} from "./components/AppModeSelector.tsx";

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
                        <AppModeSelector onSelect={(selMode: AppMode) => setMode(selMode)}/>
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
