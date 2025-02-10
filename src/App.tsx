import SourcesView from "./components/SourcesView.tsx";
import CategoriesView, {CategoriesRef} from "./components/CategoriesView.tsx";
import StreamsView from "./components/StreamsView.tsx";
import {Category, Stream} from "./types/Types.ts";
import {useRef, useState} from "react";
import ChannelView from "./components/ChannelView.tsx";
import {Alert, Col, Row} from "react-bootstrap";
import {SourceContext} from "./context/SourceContext.ts";
import {useActiveSource} from "./hooks/useActiveSource.ts";

function App() {
    console.log("App component rendered");
    const [selectedCategory, setSelectedCategory] = useState<Category|null>(null);
    const [selectedStream, setSelectedStream] = useState<Stream|null>(null);
    const categoriesViewRef = useRef<CategoriesRef>(null);

    const {activeSource, loadActiveSource} = useActiveSource();
    const handleSelectCategory = (category: Category | null) => {
        setSelectedCategory(category);
        setSelectedStream(null);
    }

    const handleSelectStream = (stream: Stream | null) => {
        setSelectedStream(stream);
    }

    const handleClearData = () => {
        handleSelectStream(null);
        handleSelectCategory(null);
        categoriesViewRef.current?.handleClearData();
    }
    const handleSourceChanged = () => {
        handleSelectStream(null);
        handleSelectCategory(null);
        loadActiveSource();
    }

    const handleCancelPlay = () => {
        handleSelectStream(null);
    }

    return (
        <>
            <SourceContext.Provider value={activeSource}>
                <div className="container-fluid">
                    <Row className="p-2">
                        <Col><h1 className="text-center">Iptv player</h1></Col>
                        <SourcesView onClearData={handleClearData} onSourcesChanged={handleSourceChanged}/>
                    </Row>
                    <hr />
                    {!activeSource && (
                        <Alert variant='warning'>No Active source found.</Alert>
                    )}
                    {activeSource &&(
                        <>
                            <Row hidden={selectedStream != null}>
                                <CategoriesView onSelect={handleSelectCategory} ref={categoriesViewRef}/>
                            </Row>
                            <Row className="mt-5" hidden={selectedStream != null}>
                                <StreamsView category={selectedCategory} onSelect={handleSelectStream}/>
                            </Row>
                            <Row>
                                <ChannelView stream={selectedStream} onCancelPlay={handleCancelPlay}/>
                            </Row>
                        </>
                    )}
                </div>
            </SourceContext.Provider>
        </>
  )
}

export default App;
