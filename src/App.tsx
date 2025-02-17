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
                    <Col xl={3}><h1 className="text-center">Iptvyk</h1></Col>
                    <SourcesView onClearData={homeViewRef.current?.handleClearData}
                                 onSourcesChanged={homeViewRef.current?.handleSourceChanged}/>
                </Row>
                <Row className="align-content-center mt-2">
                    <Col xs={2}>
                        <h4>Mode</h4>
                    </Col>
                    <Col xs={10}>
                        <AppModeSelector onSelect={(selMode: AppMode) => setMode(selMode)}/>
                    </Col>
                </Row>
                <ModeContext.Provider value={mode}>
                    <HomeView ref={homeViewRef} className='mt-2'/>
                </ModeContext.Provider>
            </div>
        </>
  )
}

export default App;
