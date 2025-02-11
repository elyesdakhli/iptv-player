import {Alert, Row} from "react-bootstrap";
import CategoriesView, {CategoriesRef} from "./CategoriesView.tsx";
import StreamsView from "./StreamsView.tsx";
import ChannelView from "./ChannelView.tsx";
import {AppMode, Category, Stream} from "../types/Types.ts";
import {forwardRef, Ref, useContext, useImperativeHandle, useRef, useState} from "react";
import {SourceContext} from "../context/SourceContext.ts";
import {useActiveSource} from "../hooks/useActiveSource.ts";
import {ModeContext} from "../context/ModeContext.ts";

export type HomeRefs = {
    handleClearData: () => void;
    handleSourceChanged: () => void;
}
export const HomeView = forwardRef((_: {}, ref: Ref<HomeRefs>) => {

    const mode = useContext<AppMode>(ModeContext);
    console.log("HomeView rendered with mode " + mode);
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

    const handleCancelPlay = () => {
        handleSelectStream(null);
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

    useImperativeHandle(ref, () => ({
        handleClearData,
        handleSourceChanged
    }));
    return <>
        <SourceContext.Provider value={activeSource}>
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
        </SourceContext.Provider>
    </>
});