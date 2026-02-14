import SourcesView from "./components/SourcesView.tsx";
import {Col, Row} from "react-bootstrap";
import {HomeView} from "./components/HomeView.tsx";
import {useCallback, useState} from "react";
import {AppMode, Category, Source, Stream} from "./types/Types.ts";
import {ModeContext} from "./context/ModeContext.ts";
import {AppModeSelector} from "./components/AppModeSelector.tsx";
import {SourceContext} from "./context/SourceContext.ts";
import {storageApi} from "./api/storageApi.ts";
import {ErrorBoundary} from "./components/common/ErrorBoundary.tsx";

function App() {
    const [mode, setMode] = useState<AppMode>('TV');
    const [activeSource, setActiveSource] = useState<Source | null>(storageApi.getActiveSource());
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
    const [clearCacheSignal, setClearCacheSignal] = useState(0);

    const handleClearData = useCallback(() => {
        setSelectedStream(null);
        setSelectedCategory(null);
        setClearCacheSignal(prev => prev + 1);
    }, []);

    const handleSourceChanged = useCallback(() => {
        setSelectedStream(null);
        setSelectedCategory(null);
        setActiveSource(storageApi.getActiveSource());
    }, []);

    const handleSelectCategory = useCallback((category: Category | null) => {
        setSelectedCategory(category);
        setSelectedStream(null);
    }, []);

    const handleSelectStream = useCallback((stream: Stream | null) => {
        setSelectedStream(stream);
    }, []);

    const handleCancelPlay = useCallback(() => {
        setSelectedStream(null);
    }, []);

    const handleModeSelect = useCallback((selMode: AppMode) => {
        setMode(selMode);
    }, []);

    return (
        <ErrorBoundary>
            <div className="container-fluid">
                <Row className="p-2">
                    <Col xl={3}><h1 className="text-center">Iptvyk</h1></Col>
                    <SourcesView onClearData={handleClearData}
                                 onSourcesChanged={handleSourceChanged}/>
                </Row>
                <Row className="align-content-center mt-2">
                    <Col xs={2}>
                        <h4>Mode</h4>
                    </Col>
                    <Col xs={10}>
                        <AppModeSelector mode={mode} onSelect={handleModeSelect}/>
                    </Col>
                </Row>
                <SourceContext.Provider value={activeSource}>
                    <ModeContext.Provider value={mode}>
                        <HomeView
                            className='mt-2'
                            activeSource={activeSource}
                            selectedCategory={selectedCategory}
                            selectedStream={selectedStream}
                            clearCacheSignal={clearCacheSignal}
                            onSelectCategory={handleSelectCategory}
                            onSelectStream={handleSelectStream}
                            onCancelPlay={handleCancelPlay}
                        />
                    </ModeContext.Provider>
                </SourceContext.Provider>
            </div>
        </ErrorBoundary>
    )
}

export default App;
