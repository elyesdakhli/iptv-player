import { forwardRef, Ref, useImperativeHandle, useState } from "react";
import { Button, Col, Form } from "react-bootstrap";
import { Search, X } from "react-bootstrap-icons";

export type SearchBarRef = {
  resetSearch: () => void;
};
export type SearchBarProps = {
  searchPlaceHolder: string;
  onSearch: (searchValue: string) => void;
};

export const SearchBar = forwardRef(
  ({ searchPlaceHolder, onSearch }: SearchBarProps, ref: Ref<SearchBarRef>) => {
    const [filterValue, setFilterValue] = useState("");

    const setFilterAndTriggerSearch = (searchValue: string) => {
      setFilterValue(searchValue);
      onSearch(searchValue);
    };

    useImperativeHandle(ref, () => ({
      resetSearch: () => setFilterAndTriggerSearch(""),
    }));

    return (
      <>
        <Col className="p-10" xs={8} md={4}>
          <Form.Control
            type="text"
            placeholder={searchPlaceHolder}
            value={filterValue}
            onChange={(event) => setFilterAndTriggerSearch(event.target.value)}
          />
        </Col>
        <Col className="p-0" xs={2}>
          {filterValue && (
            <Button
              variant="link"
              onClick={() => setFilterAndTriggerSearch("")}
              aria-label="Clear search"
              className="p-0"
            >
              <X size={18} />
            </Button>
          )}
            <Search />
        </Col>
      </>
    );
  }
);
