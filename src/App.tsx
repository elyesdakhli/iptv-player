import SourcesView from "./components/SourcesView.tsx";
import CategoriesView, {CategoriesRef} from "./components/CategoriesView.tsx";
import StreamsView from "./components/StreamsView.tsx";
import {Category, Stream} from "./types/Types.ts";
import {useRef, useState} from "react";
import ChannelView from "./components/ChannelView.tsx";
import {storageApi} from "./api/storageApi.ts";
import {Alert} from "react-bootstrap";

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

    return (
      <>
          <h1 className="text-center">Iptv player</h1>
          <hr/>
          <div className="container-fluid p-10">
                <div className="row">
                  <SourcesView source={activeSource} onClearData={handleClearData} onSourcesChanged={handleSourceChanged}/>
                </div>
                <hr />
              {!activeSource && (
                  <Alert variant='warning'>No Active source found.</Alert>
              )}
              {activeSource &&(
                <div className="row">
                    <div className="col-md-2 section d-flex flex-column vh-100">
                        <header><h4>Categories</h4></header>
                        <div className="flex-grow-1 overflow-auto">
                            <CategoriesView source={activeSource} onSelect={handleSelectCategory} ref={categoriesView}/>
                        </div>
                    </div>
                    <div className="col-md-3 section d-flex flex-column vh-100">
                        <header><h4>Channels</h4></header>
                      <div className="flex-grow-1 overflow-auto">
                        <StreamsView source={activeSource} category={selectedCategory} onSelect={handleSelectStream}/>
                      </div>
                    </div>
                    <div className="col-md-7 section">
                      <ChannelView source={activeSource} stream={selectedStream}/>
                    </div>
                </div>
              )}
          </div>
      </>
  )
}

export default App;
