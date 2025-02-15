import {Alert, Row} from "react-bootstrap";
import {CategoriesRef, CategoriesView} from "./CategoriesView.tsx";
import {StreamsView} from "./StreamsView.tsx";
import {ChannelView} from "./ChannelView.tsx";
import {Category, Stream} from "../types/Types.ts";
import {forwardRef, Ref, useCallback, useImperativeHandle, useRef, useState} from "react";
import {SourceContext} from "../context/SourceContext.ts";
import {useActiveSource} from "../hooks/useActiveSource.ts";
import * as stream from "node:stream";

export type HomeRefs = {
    handleClearData: () => void;
    handleSourceChanged: () => void;
}
export const HomeView = forwardRef((_: {}, ref: Ref<HomeRefs>) => {

    const {activeSource, loadActiveSource} = useActiveSource();

    const [selectedCategory, setSelectedCategory] = useState<Category|null>(null);
    const [selectedStream, setSelectedStream] = useState<Stream|null>(null);
    const categoriesViewRef = useRef<CategoriesRef>(null);

    console.log("HomeView rendered");

    const handleSelectCategory = useCallback((category: Category | null) => {
        setSelectedCategory(category);
        setSelectedStream(null);
    },[]);

    const handleSelectStream = useCallback((stream: Stream | null) => {
        setSelectedStream(stream);
    }, [stream]);

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
                    <Row className="" hidden={selectedStream != null}>
                        {selectedCategory && <StreamsView category={selectedCategory} onSelect={handleSelectStream}/>}
                    </Row>
                    <Row>
                        <ChannelView stream={selectedStream} onCancelPlay={handleCancelPlay}/>
                    </Row>
                </>
            )}
        </SourceContext.Provider>
    </>
});