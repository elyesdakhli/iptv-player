import {forwardRef, Ref, useContext, useImperativeHandle, useState} from "react";
import {Category} from "../types/Types.ts";
import {Button, Col, Form, ListGroup, ListGroupItem} from "react-bootstrap";
import {Search, X} from 'react-bootstrap-icons';
import {storageApi} from "../api/storageApi.ts";
import '../css/categories.css'
import {SourceContext} from "../context/SourceContext.ts";
import {useFetchCategories} from "../hooks/useFetchCategories.ts";
import {useFilterCategories} from "../hooks/useFilterCategories.ts";

export type CategoryViewProps = {
    onSelect: (category: Category) => void;
}

export type CategoriesRef = {
    handleClearData: () => void;
}

const CategoriesView = forwardRef(({ onSelect}: CategoryViewProps, ref: Ref<CategoriesRef>) => {
    const source = useContext(SourceContext);

    const onFetchComplete = () => {
        setSelectedCategoryInd(-1);
        setFilterValue('');
        clearSearch();
    }
    const [filterValue, setFilterValue] = useState('');
    const {categories, loading, apiError, refetchCategories} = useFetchCategories(onFetchComplete);
    const {displayCategories, search, clearSearch} = useFilterCategories(categories);

    const [selectedCategoryInd, setSelectedCategoryInd] = useState(-1);

    const handleClearData= () => {
        if(!source)
            return
        storageApi.cleanCategories(source.name);
        refetchCategories();
    }

    useImperativeHandle(ref, () => ({
        handleClearData
    }));

    if (!categories)
        return <></>

    return <div className="container">
        <div className="row">
             {loading &&
                 <>
                     <div className="spinner-border" role="status">
                         <span className="visually-hidden">Loading...</span>
                     </div>
                 </>}
             {apiError &&
                 <>
                     <div className="alert alert-danger" role="alert">
                         Error while getting categories list.
                     </div>
                 </>}
         </div>
         <div className="row p-10 mb-2 flex-box justify-content-center">
             <Col xs={2}><h4>Categories</h4></Col>
             <Col xs={2} className="p-10">
                 <Form.Control type="text" placeholder="Search category" value={filterValue}
                               onChange={(event) => {
                                   setFilterValue(event.target.value);
                                   search(event.target.value)
                               }
                               }/>
             </Col>
             <Col xs={1} className="p-0">
                 {filterValue &&
                     <Button variant="link"
                             onClick={() => {
                                 setFilterValue('');
                                 clearSearch();}
                             }
                             aria-label="Clear search"
                             className="p-0">
                         <X size={18} />
                     </Button>
                 }
             </Col>
             <Col xs={1}><Search /></Col>
         </div>

        <div className="row">
            <div className="Horizontal-list-container">
                <ListGroup horizontal className="scrollable-list">
                    {
                        displayCategories?.map((category, index) => (
                            <ListGroupItem key={category.categoryId}
                                           className={"my-list-item " + (selectedCategoryInd === index ? "list-group-item active" : "list-group-item")}
                                           onClick={() => {
                                               setSelectedCategoryInd(index)
                                               onSelect(category);
                                           }
                                           }>{category.categoryName}</ListGroupItem>
                        ))
                    }
                </ListGroup>
            </div>
        </div>
    </div>
});

export default CategoriesView;