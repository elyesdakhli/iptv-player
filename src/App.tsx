import SourcesView from "./components/SourcesView.tsx";
import {Button, Col, Form, Offcanvas, Row} from "react-bootstrap";
import {HomeView} from "./components/HomeView.tsx";
import {useCallback, useEffect, useState} from "react";
import {AppMode, Category, Source, Stream} from "./types/Types.ts";
import {ModeContext} from "./context/ModeContext.ts";
import {AppModeSelector} from "./components/AppModeSelector.tsx";
import {SourceContext} from "./context/SourceContext.ts";
import {storageApi} from "./api/storageApi.ts";
import {ErrorBoundary} from "./components/common/ErrorBoundary.tsx";
import {GearFill} from "react-bootstrap-icons";
import {SourcesManager} from "./components/source/SourcesManager.tsx";

function App() {
    const [mode, setMode] = useState<AppMode>('TV');
    const [activeSource, setActiveSource] = useState<Source | null>(storageApi.getActiveSource());
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
    const [clearCacheSignal, setClearCacheSignal] = useState(0);
    const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

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

    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const [showSettings, setShowSettings] = useState(false);

    const handleToggleDark = useCallback(() => {
        setIsDark(prev => {
            const next = !prev;
            localStorage.setItem('theme', next ? 'dark' : 'light');
            return next;
        });
    }, []);

    return (
        <ErrorBoundary>
            <div className="container-fluid">
                <Row className="pt-2 px-2">
                    <Col className="text-center"><h1>Iptvyk</h1></Col>
                </Row>
                <Row className="pb-2 px-2 align-items-center">
                    <SourcesView />
                </Row>

                <Offcanvas show={showSettings} onHide={() => setShowSettings(false)} placement="end">
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>Settings</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body className="d-flex flex-column gap-3">
                        <SourcesManager onSourcesChanged={handleSourceChanged} />
                        {activeSource && (
                            <Button variant="secondary" onClick={() => { handleClearData(); setShowSettings(false); }}>
                                Clear & Reload
                            </Button>
                        )}
                    </Offcanvas.Body>
                </Offcanvas>
                <Row className="align-items-center mt-2 px-2">
                    <Col xs="auto"><h4 className="mb-0">Mode</h4></Col>
                    <Col><AppModeSelector mode={mode} onSelect={handleModeSelect}/></Col>
                    <Col className="d-flex align-items-center justify-content-end gap-3">
                        <Form.Check
                            type="switch"
                            id="dark-mode-switch"
                            label={isDark ? '🌙' : '☀️'}
                            checked={isDark}
                            onChange={handleToggleDark}
                        />
                        <Button variant="outline-secondary" onClick={() => setShowSettings(true)}>
                            <GearFill size={18} />
                        </Button>
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
