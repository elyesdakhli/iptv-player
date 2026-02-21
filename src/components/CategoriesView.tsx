import {
    memo,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { Category } from "../types/Types.ts";
import { ListGroup, ListGroupItem, Row } from "react-bootstrap";
import { storageApi } from "../api/storageApi.ts";
import "../css/categories.css";
import { SourceContext } from "../context/SourceContext.ts";
import { useFetchCategories } from "../hooks/useFetchCategories.ts";
import { useFilterCategories } from "../hooks/useFilterCategories.ts";
import { ModeContext } from "../context/ModeContext.ts";
import { LoadingSpinner } from "./common/LoadingSpinner.tsx";
import { ErrorAlert } from "./common/ErrorAlert.tsx";
import { SearchBar, SearchBarRef } from "./common/SearchBar.tsx";

export type CategoryViewProps = {
  onSelect: (category: Category) => void;
  clearCacheSignal: number;
};

const ALL_CHANNELS_CAT: Category = {
  categoryId: "ALL",
  categoryName: "All",
  parentId: "",
};

export const CategoriesView = memo(({ onSelect, clearCacheSignal }: CategoryViewProps) => {
    const {
      categories,
      loading,
      apiError,
      reFetchCategories,
    } = useFetchCategories(ALL_CHANNELS_CAT);
    const { filteredCategories, search, clearFilter } =
      useFilterCategories(categories);

    const searchBarRef = useRef<SearchBarRef>(null);
    const source = useContext(SourceContext);
    const mode = useContext(ModeContext);

    useEffect(() => {
      if (!source) return;
      storageApi.cleanCategories(source.name, mode);
      reFetchCategories();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clearCacheSignal, source, mode]);

    useEffect(() => {
      reFetchCategories();
      clearFilter();
      searchBarRef.current?.resetSearch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    if (!categories) return <></>;

    return (
      <div className="container">
        <Row>
          <LoadingSpinner visible={loading} />
          <ErrorAlert error={apiError} />
        </Row>
        <Row className="mb-2">
          <SearchBar
            ref={searchBarRef}
            searchPlaceHolder="Search category"
            onSearch={search}
          />
        </Row>
        <Row className="Horizontal-list-container mx-0">
          <CategoryItems key={mode} categories={filteredCategories} onSelect={onSelect} />
        </Row>
      </div>
    );
});

const CategoryItems = ({
  categories,
  onSelect,
}: {
  categories: Category[];
  onSelect: (category: Category) => void;
}) => {
  const [selectedCategoryInd, setSelectedCategoryInd] = useState(-1);

  return (
    <ListGroup horizontal className="scrollable-list p-2">
      {categories?.map((category, index) => (
        <ListGroupItem
          key={category.categoryId}
          className={
            "my-list-item " +
            (selectedCategoryInd === index
              ? "list-group-item active"
              : "list-group-item")
          }
          onClick={() => {
            setSelectedCategoryInd(index);
            onSelect(category);
          }}
        >
          {category.categoryName}
        </ListGroupItem>
      ))}
    </ListGroup>
  );
};
