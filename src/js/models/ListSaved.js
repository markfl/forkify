"use strict";
export default class ListSaved {
    constructor() {
        this.listArray = [];
    }

    addList(id, ingredients ) {
        const currentList = { id, ingredients };
        this.listArray.push(currentList);
        this.persistData();
        return currentList;
    }

    isSaved(id) {
        return this.listArray.findIndex(el => el.id === id) !== -1;
    }

    persistData() {
        localStorage.setItem('listsaved', JSON.stringify(this.listArray));
    }

    readStorage () {
        const storage = JSON.parse(localStorage.getItem('listsaved'));
        
        // Restoring recipes from the localStorage
        if (storage) this.listArray = storage;
    }
}