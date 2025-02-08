import {forwardRef, Ref, useEffect, useImperativeHandle, useState} from "react";
import {Category, Source} from "../types/Types.ts";
import {Button, Col, Form, ListGroup, ListGroupItem} from "react-bootstrap";
import {Search, X} from 'react-bootstrap-icons';
import * as React from "react";
import {getCategories} from "../api/xtreamCodesApi.ts";
import {storageApi} from "../api/storageApi.ts";
import '../css/categories.css'

export type CategoryViewProps = {
    source: Source | null;
    onSelect: (category: Category) => void;
}

export type CategoriesRef = {
    handleClearData: () => void;
}

const CategoriesView = forwardRef(({source, onSelect}: CategoryViewProps, ref: Ref<CategoriesRef>) => {
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState<Error|null>(Error);
    const [selectedCategoryInd, setSelectedCategoryInd] = useState(-1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filterValue, setFilterValue] = useState<string>('');
    const [displayCategories, setDisplayCategories] = useState<Category[]>();

    const initFromApi = () => {
        if(!source)
            return;
        setLoading(true);
        setApiError(null);
        getCategories(source)
            .then(categoriesData => {
                setSelectedCategoryInd(-1);
                setDisplayCategories(categoriesData);
                setCategories(categoriesData);
                setFilterValue('');
                storageApi.saveCategories(source.name, categoriesData);
                console.log("Categories loaded from api.");
            })
            .catch( (error) => setApiError(error))
            .finally( () => setLoading(false));
    }

    const initFromCache = (): boolean => {
        if(!source)
            return false;
        const localStorageCategories = storageApi.getCategories(source.name)
        if(localStorageCategories?.length>0){
            setCategories(localStorageCategories);
            setDisplayCategories(localStorageCategories);
            setApiError(null);
            setLoading(false);
            setFilterValue('');
            console.log("Categories loaded from cache.");
            return true;
        }
        return false;
    }

    useEffect(() => {
        if(!source)
            return;
        //Getting categories from cache (localstorage)
        if(initFromCache())
            return;
        //Getting categories from api
        initFromApi();
    }, [source]);


    const filterCategories = (filter: string, categories: Category[]): Category[] => {
        return (!filter || filter === '') ?
            categories :
            categories
                .filter(cat => cat.categoryName.toLowerCase().includes(filter.toLowerCase()))
    }

    function handleSearch(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        if(!categories)
            return;
        const searchValue = event.target.value;
        setFilterValue(searchValue);
        setDisplayCategories(filterCategories(searchValue, categories));
        setSelectedCategoryInd(-1);
    }

    const handleClearFilter = () => {
        setFilterValue('');
        setDisplayCategories(categories);
    }

    const handleClearData= () => {
        if(!source)
            return
        storageApi.cleanCategories(source.name);
        initFromApi();
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
                               onChange={(event) => handleSearch(event)}/>
             </Col>
             <Col xs={1} className="p-0">
                 {filterValue &&
                     <Button variant="link"
                             onClick={() => handleClearFilter()}
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