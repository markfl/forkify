"use strict";
import Recipe from '../models/Recipe';

export default class RecipeSaved {
    constructor() {
        this.recipeArray = [];
    }

    addRecipes(id, title, author, img, url, ingredients ) {
        const currentRecipe = { id, title, author, img, url, ingredients };
        this.recipeArray.push(currentRecipe);
        this.persistData();
        return currentRecipe;
    }

    fillRecipes(id) {
        var recipe = new Recipe();
        const index = this.recipeArray.findIndex(el => el.id === id);
        const currentRecipe = this.recipeArray[index];
        recipe.id = currentRecipe.id;
        recipe.title = currentRecipe.title;
        recipe.author = currentRecipe.author;
        recipe.img = currentRecipe.img;
        recipe.url = currentRecipe.url;
        recipe.ingredients = currentRecipe.ingredients;

        return recipe;
    }

    //fillIngredients() {
    //    return result;
    //}

    //deleteRecipes(id) {
    //    const index = this.recipeArray.findIndex(el => el.id === id);
    //    this.recipeArray.splice(index, 1);
    //    this.persistData();
    //}

    isSaved(id) {
        return this.recipeArray.findIndex(el => el.id === id) !== -1;
    }

    //getNumSaved() {
    //    return this.recipeArray.length;
    //}

    persistData() {
        localStorage.setItem('recipessaved', JSON.stringify(this.recipeArray));
    }

    readStorage () {
        const storage = JSON.parse(localStorage.getItem('recipessaved'));
        
        // Restoring recipes from the localStorage
        if (storage) this.recipeArray = storage;
    }
}