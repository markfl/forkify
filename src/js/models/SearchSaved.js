"use strict";
import Search from '../models/Search';

export default class SearchSaved {
    constructor() {
        this.searchArray = [];
    }

    addSearches(query, result) {
        const currentSearch = { query, result };
        this.searchArray.push(currentSearch);
        this.persistData();
        //console.log(currentSearch, this.searchArray);
        return currentSearch;
    }

    isSearched(query) {
        return this.searchArray.findIndex(el => el.query === query) !== -1;
    }

    persistData() {
        localStorage.setItem('searchssaved', JSON.stringify(this.searchArray));
    }

    readStorage () {
        const storage = JSON.parse(localStorage.getItem('searchssaved'));
        
        // Restoring recipes from the localStorage
        if (storage) this.searchArray = storage;
    }

    fillSearch(query) {
        var search = new Search();
        const index = this.searchArray.findIndex(el => el.query === query);
        const currentSearch = this.searchArray[index];
        search.query = currentSearch.query;
        search.result = currentSearch.result;

        return search;
    }
}