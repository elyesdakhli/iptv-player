import {Category} from "../types/Types.ts";
import {useEffect, useState} from "react";

export const useFilterCategories = (categories: Category[]) => {
    const [filterValue, setFilterValue] = useState('');
    const [displayCategories, setDisplayCategories] = useState<Category[]>(categories);

    const filterCategories = (filter: string, categories: Category[]): Category[] => {
        return (!filter || filter === '') ?
            categories :
            categories
                .filter(cat => cat.categoryName.toLowerCase().includes(filter.toLowerCase()))
    }

    function search(searchValue: string) {
        if(!categories)
            return;
        setFilterValue(searchValue);
    }

    const clearSearch = () => {
        setFilterValue('');
    }

    useEffect(() => {
        setDisplayCategories(filterCategories(filterValue, categories));
    }, [filterValue, categories]);

    return {displayCategories, search, clearSearch};
}