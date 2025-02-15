import {
    forwardRef, memo,
    Ref, useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { Category } from "../types/Types.ts";
import { Col, ListGroup, ListGroupItem, Row } from "react-bootstrap";
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
};

export type CategoriesRef = {
  handleClearData: () => void;
};

const ALL_CHANNELS_CAT: Category = {
  categoryId: "ALL",
  categoryName: "All",
  parentId: "",
};

export const CategoriesView = memo(forwardRef(
  ({ onSelect }: CategoryViewProps, ref: Ref<CategoriesRef>) => {
    const {
      categories,
      loading,
      apiError,
      reFetchCategories: reFetchCategories,
    } = useFetchCategories(ALL_CHANNELS_CAT);
    const { filteredCategories, search, clearFilter } =
      useFilterCategories(categories);

    const searchBarRef = useRef<SearchBarRef>(null);
    //Contexts
    const source = useContext(SourceContext);
    const mode = useContext(ModeContext);

    const handleClearData = useCallback(() => {
      if (!source) return;
      storageApi.cleanCategories(source.name, mode);
      reFetchCategories();
    }, [source, mode]);

    useImperativeHandle(ref, () => ({
      handleClearData,
    }));

    useEffect(() => {
      reFetchCategories();
      clearFilter();
      searchBarRef.current?.resetSearch();
    }, [mode]);

    console.log("CategoriesView rendered");
    if (!categories) return <></>;

    return (
      <div className="container">
        <Row>
          <LoadingSpinner visible={loading} />
          <ErrorAlert error={apiError} />
        </Row>
        <Row className="p-10 mb-2 flex-box">
          <Col xs={2}>
            <h4>Categories</h4>
          </Col>
          <SearchBar
            ref={searchBarRef}
            searchPlaceHolder="Search category"
            onSearch={search}
          />
        </Row>
        <Row className="Horizontal-list-container">
          <CategoryItems categories={filteredCategories} onSelect={onSelect} />
        </Row>
      </div>
    );
  }
));

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
