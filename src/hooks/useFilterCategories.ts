import { Category } from "../types/Types.ts";
import { useEffect, useState } from "react";

export const useFilterCategories = (categories: Category[]) => {
  const [filterValue, setFilterValue] = useState("");
  const [filteredCategories, setFilteredCategories] =
    useState<Category[]>(categories);

  const filterCategories = (
    filter: string,
    categories: Category[]
  ): Category[] => {
    return !filter || filter === ""
      ? categories
      : categories.filter((cat) =>
          cat.categoryName.toLowerCase().includes(filter.toLowerCase())
        );
  };

  function search(searchValue: string) {
    if (!categories) return;
    setFilterValue(searchValue);
  }

  const clearFilter = () => {
    setFilterValue("");
  };

  useEffect(() => {
    setFilteredCategories(filterCategories(filterValue, categories));
  }, [filterValue, categories]);

  return { filteredCategories: filteredCategories, search, clearFilter };
};
