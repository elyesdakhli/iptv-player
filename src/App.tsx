import SourcesView from "./components/SourcesView.tsx";
import CategoriesView, {CategoriesRef} from "./components/CategoriesView.tsx";
import StreamsView from "./components/StreamsView.tsx";
import {Category, Stream} from "./types/Types.ts";
import {useRef, useState} from "react";
import ChannelView from "./components/ChannelView.tsx";
import {storageApi} from "./api/storageApi.ts";
import {Alert, Row} from "react-bootstrap";

function App() {
    const [selectedCategory, setSelectedCategory] = useState<Category|null>(null);
    const [selectedStream, setSelectedStream] = useState<Stream|null>(null);
    const categoriesView = useRef<CategoriesRef>(null);
    const [activeSource, setActiveSource] = useState(storageApi.getActiveSource());

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
        categoriesView.current?.handleClearData();
    }
    const handleSourceChanged = () => {
        handleSelectStream(null);
        handleSelectCategory(null);
        setActiveSource(storageApi.getActiveSource());
    }

    const handleCancelPlay = () => {
        handleSelectStream(null);
    }

    return (
        <>
            <h1 className="text-center">Iptv player</h1>
            <hr/>
            <div className="container-fluid p-10">
                <Row>
                    <SourcesView source={activeSource} onClearData={handleClearData} onSourcesChanged={handleSourceChanged}/>
                </Row>
                <hr />
                {!activeSource && (
                    <Alert variant='warning'>No Active source found.</Alert>
                )}
                {activeSource &&(
                    <>
                        <Row hidden={selectedStream != null}>
                            <CategoriesView source={activeSource} onSelect={handleSelectCategory} ref={categoriesView}/>
                        </Row>
                        <Row className="mt-5" hidden={selectedStream != null}>
                            <StreamsView source={activeSource} category={selectedCategory} onSelect={handleSelectStream}/>
                        </Row>
                        <Row>
                            <ChannelView source={activeSource} stream={selectedStream} onCancelPlay={handleCancelPlay}/>
                        </Row>
                    </>
                )}
            </div>
        </>
  )
}

export default App;
