import {Alert, Row} from "react-bootstrap";
import {CategoriesView} from "./CategoriesView.tsx";
import {StreamsView} from "./StreamsView.tsx";
import {ChannelView} from "./ChannelView.tsx";
import {Category, Source, Stream} from "../types/Types.ts";

type HomeViewProps = {
    className?: string;
    activeSource: Source | null;
    selectedCategory: Category | null;
    selectedStream: Stream | null;
    clearCacheSignal: number;
    onSelectCategory: (category: Category | null) => void;
    onSelectStream: (stream: Stream | null) => void;
    onCancelPlay: () => void;
};

export const HomeView = ({
    className,
    activeSource,
    selectedCategory,
    selectedStream,
    clearCacheSignal,
    onSelectCategory,
    onSelectStream,
    onCancelPlay
}: HomeViewProps) => {

    return <div className={className}>
        {!activeSource && (
            <Alert variant='light'>No Active source found.</Alert>
        )}
        {activeSource && (
            <>
                <Row className='mt-2' hidden={selectedStream != null}>
                    <CategoriesView onSelect={onSelectCategory} clearCacheSignal={clearCacheSignal}/>
                </Row>
                <Row className="mt-2" hidden={selectedStream != null}>
                    {selectedCategory && <StreamsView category={selectedCategory} onSelect={onSelectStream}/>}
                </Row>
                <Row>
                    <ChannelView stream={selectedStream} onCancelPlay={onCancelPlay}/>
                </Row>
            </>
        )}
    </div>
};
