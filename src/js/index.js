// import str from './models/Search';
// import {add, multiply, ID} from './views/searchView';
// import {add as a, multiply as m, ID} from './views/searchView';
// import * as sV from './views/searchView';

// console.log(`Using imported function! ${add(ID, 2)} and ${multiply(3,5)}. ${str}`);
// console.log(`Using imported function! ${a(sV.ID, 2)} and ${m(5,5)}. ${str}`);
// console.log(`Using imported function! ${sV.add(sV.ID, 6)} and ${sV.multiply(5,5)}. ${str}`);

// 0880633019c8c0029b4eecadd75d2985
// http://food2fork.com/api/search 
// http://food2fork.com/api/get 
"use strict";
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import RecipeSaved from './models/RecipeSaved';
import SearchSaved from './models/SearchSaved';
import ListSaved from './models/ListSaved';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};
window.state = state;
/**
 * SEARCH CONTROLLER
 */

const controlSearch = async () => {
    // 1) Get query from view
    const query = searchView.getInput();

    if (query) {
        // 2) New search object and add to state
        state.search = new Search(query);
        

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        var pages = 1
        
        //for (pages = 1; pages <= 10; pages++) {
            try {
                // 4) Search for recipes and parse ingredients
                await state.search.getResults();
                //if (pages === 1) {
                    searchView.renderResults(state.search.result);
                //};
                state.searchSaved.addSearches(state.search.query, state.search.result);
            } catch (err) {
                console.log(err);
                clearLoader();
                alert('Something wrong with the search...');
            }
        //}
        
        // 5) Render results on UI
        clearLoader();
    };
};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    const query = searchView.getInput();
    if (!state.searchSaved) {
        state.searchSaved = new SearchSaved();
    } else {
        state.searchSaved.readStorage(query);
    };

    // User has NOT searched this item yet
    if (!state.searchSaved.isSearched(query)) {
        controlSearch();
    } else {
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        state.search = state.searchSaved.fillSearch(query);
        searchView.renderResults(state.search.result);
        clearLoader();
    };
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

/**
 * RECIPE CONTROLLER
 */
const controlRecipe = () => {
    // Get ID from url
    const id = window.location.hash.replace('#', '');
    if (!state.recipesaved) state.recipesaved = new RecipeSaved();
    state.recipesaved.readStorage();

    // Recipe has NOT yet saved to local storage
    if (!state.recipesaved.isSaved(id)) {

        // Call AJAX get recipe
        asyncControlRecipe();

    } else {

        // Create new recipe object
        state.recipe = new Recipe(id);
        state.recipe = state.recipesaved.fillRecipes(id);

        // Calculate servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();

        // Render recipe
        clearLoader();
        recipeView.renderRecipe(
            state.recipe,
            state.likes.isLiked(id)
        );
    }
};

const asyncControlRecipe = async () => {
    // Get ID from url
    const id = window.location.hash.replace('#', '');

    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if (state.search) searchView.highlightSelected(id);

        // Create new recipe object
        state.recipe = new Recipe(id);

        try {
            // Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
    
            // Render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );

            // save current recipe to local storage
            controlRecipeSaved(id);

        } catch (err) {
            console.log(err);
            alert('Error processing recipe!');
        }
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**
 * LIST CONTROLLER
 */
const controlList = () => {
    // Create a new list If there is none yet
    if (!state.list) state.list = new List();
        // remove current items in list
        listView.deleteList();
        // Add each ingredient to the list and UI
        state.recipe.ingredients.forEach(el => {
            const item = state.list.addItem(el.count, el.unit, el.ingredient);
            listView.renderItem(item);
        });
};

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

    // Handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

/**
 * LIKES CONTROLLER
 */
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(newLike);

    // User HAS liked current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    state.recipeSaved = new RecipeSaved();

    // Restore likes
    state.likes.readStorage();

    // Restore recipes
    state.recipeSaved.readStorage();
    
    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    // Get ID from url
    const id = window.location.hash.replace('#', '');
    if (!state.listsaved) state.listsaved = new ListSaved();
    state.listsaved.readStorage();

    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();

        // User has NOT yet saved current recipe
        
        if (!state.listsaved.isSaved(id)) {
            // save ingredients to local storage
            controlShoppingListSaved(state.recipe.id);
        } else {
        }
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});

/**
 * PERSISTANT RECIPES CONTROLLER
 */
const controlRecipeSaved = (id) => {
    // User has NOT yet saved current recipe
    if (!state.recipesaved.isSaved(id)) {
        // Add receipt to the state
        const newRecipes = state.recipeSaved.addRecipes(
            id,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img,
            state.recipe.url,
            state.recipe.ingredients
        );
    }
};

/*
 * PERSISTANT SHOPPING LIST CONTROLLER
*/
const controlShoppingListSaved = (id) => {
    // User has NOT yet saved current recipe
    if (!state.listsaved.isSaved(id)) {
        // Add receipt to the state
        const newList = state.listsaved.addList(
            id,
            state.recipe.ingredients
        );
    }
};