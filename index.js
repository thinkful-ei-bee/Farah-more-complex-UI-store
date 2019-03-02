'use strict';
/* global $ */
/* global cuid */

const STORE = {
  items: [ 
    {id: cuid(), name: 'apples', checked: false, edited: false},
    {id: cuid(), name: 'oranges', checked: false, edited: false},
    {id: cuid(), name: 'milk', checked: true, edited: false},
    {id: cuid(), name: 'bread', checked: false, edited: false}
  ],
  hideCompleted: false,
  searchedItem: null,
};

function requiredInput(){
  $('input').prop('required', true);
}

function generateItemElement(item) {
  console.log(item);
  let itemTitle;
  if (item.edited) {
    itemTitle =
    `<form id="edit-item-name-form">
        <input type="text" name="edit-name" class="js-edit-item-name" value="${item.name}" />
      </form>`;
  }
  else {
    itemTitle = 
    `<span class="shopping-item js-shopping-item ${item.checked ? 'shopping-item__checked' : ''}">
      ${item.name}
    </span>`;
  }

  const disabledStatus = item.edited ? 'disabled' : '';

  return `
    <li data-item-id="${item.id}">
      <span class="shopping-item js-shopping-item ${item.checked ? 'shopping-item__checked' : ''}">${item.name}</span>
      <div class="shopping-item-controls">
        <button class="shopping-item-toggle js-item-toggle">
            <span class="button-label">check</span>
        </button>
        <button class="shopping-item-delete js-item-delete">
            <span class="button-label">delete</span>
        </button>
        <button class="shopping-item-edit js-item-edit">
            <span class="button-label">edit</span>
        </button>
        
      </div>
    </li>`;
}

function generateShoppingItemsString(shoppingList) {
  console.log('Generating shopping list element');
  const items = shoppingList.map((item) => generateItemElement(item));
  return items.join('');
}

function renderShoppingList() {
  // render the shopping list in the DOM
  console.log('`renderShoppingList` ran');

  let filteredItems = STORE.items;
  if (STORE.hideCompleted){
    filteredItems = filteredItems.filter(item => !item.checked);
  }

  if (STORE.searchedItem) {
    console.log(STORE.searchedItem);
    filteredItems = filteredItems.filter(item => item.name.includes(STORE.searchedItem));
  }

  const shoppingListItemsString = generateShoppingItemsString(filteredItems);

  // insert that HTML into the DOM
  $('.js-shopping-list').html(shoppingListItemsString);
}

function addItemToShoppingList(itemName) {
  console.log(`Adding "${itemName}" to shopping list`);
  STORE.items.push({id: cuid(), name: itemName, checked: false});
}

function handleNewItemSubmit() {
  $('#js-shopping-list-form').submit(function(event) {
    event.preventDefault();
    console.log('`handleNewItemSubmit` ran');
    const newItemName = $('.js-shopping-list-entry').val();
    $('.js-shopping-list-entry').val('');
    addItemToShoppingList(newItemName);
    renderShoppingList();
  });
}

function toggleCheckedForListItem(itemId) {
  console.log('Toggling checked property for item with id ' + itemId);
  const item = STORE.items.find(item => item.id === itemId);
  item.checked = !item.checked;
}


function getItemIdFromElement(item) {
  return $(item)
    .closest('li')
    .data('item-id');
}

function handleItemCheckClicked() {
  $('.js-shopping-list').on('click', '.js-item-toggle', event => {
    const id = getItemIdFromElement(event.currentTarget);
    toggleCheckedForListItem(id);
    renderShoppingList();
  });
}

function deleteItem(id){
  console.log('`handleDeleteItemClicked` ran');
  const index = STORE.items.findIndex(i => i.id === id);
  if (index === -1) return;
  STORE.items.splice(index, 1);
}

function handleDeleteItemClicked() {
  $('.js-shopping-list').on('click', '.js-item-delete', event => {
    const id = getItemIdFromElement(event.currentTarget);
    deleteItem(id);
    renderShoppingList();
  }); 
}

function toggleHideFilter(){ 
  //this funtion will change the STORE.hideCompleted property
  STORE.hideCompleted = !STORE.hideCompleted;
}

function handleToggleHideFilter() {
  //this function will be the even listener on the checkbox
  $('.js-hide-completed-toggle').on('click', () => {
    toggleHideFilter();
    renderShoppingList();
  });
}

// You will need to create a function that changes one or more properties in the store
function searchFilter(searched){ 
  STORE.searchedItem = searched; 
}

// You will need to create a function that adds an event listener, who responsibility is to change the store and run the rendering function
function handleSearchFilter(){
  //this function will be the event listener on the search bar 
  $('#js-search-form').on('keyup', () => {
    console.log('`handleSearchFilter` ran');
    const searched = $('.js-search-entry').val();
    //const filterItems = 

    searchFilter(searched);
    renderShoppingList();
  });
}


// this function sets item 'edited' prop
function setEditedItem(itemId, edited){
  const targetedItem = STORE.items.find(item => item.id === itemId);
  targetedItem.edited = edited;
}


function handleEditTitle(){ // toggle form class
  $('.js-shopping-list').on('click', '.js-item-edit', event => {
    const id = getItemIdFromElement(event.target);
    //const editedItem = $(this).text();
    setEditedItem(id, true);
    renderShoppingList();
  });
}

function editItemName(itemId, newName) {
  const targetItem = STORE.items.find(item => item.id === itemId);
  targetItem.name = newName;
}

function handleEditNameForm(){
  $('.js-shopping-list').on('submit', '#edit-item-name-form', event => {
    event.preventDefault();
    const id = getItemIdFromElement(event.target);
    const newName = $('.js-edit-item-name').val();
    editItemName(id, newName);
    setEditedItem(id, false); 
    renderShoppingList();
  });
}

// this function will be our callback when the page loads. it's responsible for
// initially rendering the shopping list, and activating our individual functions
// that handle new item submission and user clicks on the "check" and "delete" buttons
// for individual shopping list items.
function handleShoppingList() {
  requiredInput();
  renderShoppingList();
  handleNewItemSubmit();
  handleItemCheckClicked();
  handleDeleteItemClicked();
  handleToggleHideFilter();
  handleSearchFilter();
  handleEditTitle();
  handleEditNameForm();
  
}

// when the page loads, call `handleShoppingList`
$(handleShoppingList);