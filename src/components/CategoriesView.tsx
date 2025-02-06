import {forwardRef, Ref, useEffect, useImperativeHandle, useState} from "react";
import {Category, Source} from "../types/Types.ts";
import {Button, Form} from "react-bootstrap";
import { X } from 'react-bootstrap-icons';
import * as React from "react";
import {getCategories} from "../api/xtreamCodesApi.ts";
import {storageApi} from "../api/storageApi.ts";

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
        <div className="row p-10">
            <div className="col-11 p-0">
                <Form.Control type="text" placeholder="Search category" value={filterValue}
                              onChange={(event) => handleSearch(event)}/>
            </div>
            {filterValue &&
                <div className="col-1  p-0">
                    <Button variant="link"
                        onClick={() => handleClearFilter()}
                        aria-label="Clear search"
                        className="p-0">
                            <X size={18} />
                    </Button>
                </div>
            }
        </div>
        <ul className="list-group row p-3">
            {
                displayCategories?.map((category, index) => (
                    <li key={category.categoryId}
                        className={selectedCategoryInd === index ? "list-group-item active" : "list-group-item"}
                        onClick={() => {
                            setSelectedCategoryInd(index)
                            onSelect(category);
                        }
                        }>{category.categoryName}</li>
                ))
            }
        </ul>
    </div>
});

export default CategoriesView;