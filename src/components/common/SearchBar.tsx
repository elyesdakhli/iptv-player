import {useState} from "react";
import {Button, Col, Form} from "react-bootstrap";
import {Search, X} from "react-bootstrap-icons";

export const SearchBar = ({searchPlaceHolder, searchFn}: {searchPlaceHolder: string, searchFn: (searchTerm: string) => void}) => {
    const [filterValue, setFilterValue] = useState('');

    return (
        <>
            <Col xs={2} className="p-10">
                <Form.Control type="text" placeholder={searchPlaceHolder}value={filterValue}
                              onChange={(event) => {
                                  setFilterValue(event.target.value);
                                  searchFn(event.target.value);
                              }}/>
            </Col>
            <Col xs={1} className="p-0">
                {filterValue && (
                    <Button variant="link"
                            onClick={() =>  {
                                setFilterValue('');
                                searchFn('');
                            }}
                            aria-label="Clear search"
                            className="p-0">
                        <X size={18} />
                    </Button>
                )}
            </Col>
            <Col xs={1}><Search /></Col>
        </>
    )
}