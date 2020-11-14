import ToDoList from './totolist.js';
import ToDoItem from './todoitem.js';

const toDoList = new ToDoList()

// launch app
document.addEventListener("readystatechange", (event) => {
    if (event.target.readyState == "complete") {
        initApp();
    }
});

const initApp = () => {
    // Add listeners
    const itemEntryForm = document.getElementById("itemEntryForm");
    itemEntryForm.addEventListener("submit", (event) => {
        event.preventDefault();
        processSubmission();
    })

    const clearItems = document.getElementById("clearItems");
    clearItems.addEventListener("click", (event) => {
        const list = toDoList.getList()
        if (list.length) {
            const confirmed = confirm("Are you sure you want to clear the entire list?");
            if (confirmed) {
                toDoList.clearList();
                updatePesistentData(toDoList.getList());
                refreshThePage();
            }
        }
    })

    // Procedural

    loadListObject();
    refreshThePage();
}

const loadListObject = () => {
    const storeList = localStorage.getItem("myToDoList");
    if (typeof storeList !== "string") return;
    const parsedList = JSON.parse(storeList);
    parsedList.forEach((itemObj) => {
        const newToDoitem = createNewItem(itemObj._id, itemObj._item);
        toDoList.addItemToList(newToDoitem);
    })
}

const refreshThePage = () => {
    clearListDisplay()
    renderList()
    clearItemEntryField();
    setFocusOnItemEntry();

}

const clearListDisplay = () => {
    const parentElement = document.getElementById("listItems");
    deleteContents(parentElement);
}

const deleteContents = (parentElement) => {
    let child = parentElement.lastElementChild;
    while (child) {
        parentElement.removeChild(child)
        child = parentElement.lastElementChild;
    }
}

const renderList = () => {
    const list = toDoList.getList();
    list.forEach(item => {
        buildListItem(item);
    })
}

const buildListItem = (item) => {
    const div = document.createElement("div");
    div.className = "item";
    const check = document.createElement("input");
    check.type = "checkbox";
    check.id = item.getId();
    check.tabIndex = 0;
    addClickListenerToCheckbox(check)
    const label = document.createElement('label')
    label.htmlFor = item.getId();
    label.textContent = item.getItem();
    div.appendChild(check);
    div.appendChild(label);
    const container = document.getElementById('listItems');
    container.appendChild(div);
}

const addClickListenerToCheckbox = (checkbox) => {
    checkbox.addEventListener("click", (event) => {
        toDoList.removeItemFromList(checkbox.id);
        const removedText = getLabelText(checkbox.id);
        updatePesistentData(toDoList.getList());
        updateScreenReaderConfirmation(removedText, "removed from list");
        setTimeout(() => {
            refreshThePage();
        }, 1000);
    });
}

const getLabelText = (checkboxId) => {
    return document.getElementById(checkboxId).nextElementSibling.textContent;
}

const updatePesistentData = (listArray) => {
    localStorage.setItem("myToDoList", JSON.stringify(listArray));
}

const clearItemEntryField = () => {
    document.getElementById("newItem").value = "";
}

const setFocusOnItemEntry = () => {
    document.getElementById("newItem").focus();
}

const processSubmission = () => {
    const newEntryText = getNewEntry();
    if (!newEntryText.length) return;
    const nextItemID = calcNextItemId();
    const toDoItem = createNewItem(nextItemID, newEntryText)
    toDoList.addItemToList(toDoItem)
    updatePesistentData(toDoList.getList());
    updateScreenReaderConfirmation(newEntryText, "added")
    refreshThePage()
}

const getNewEntry = () => {
    return document.getElementById("newItem").value.trim();
}

const calcNextItemId = () => {
    let nextItemId = 1;
    const list = toDoList.getList()
    if (list.length > 0) {
        nextItemId = list[list.length - 1].getId() + 1;
    }
    return nextItemId;
}

const createNewItem = (itemId, itemText) => {
    const toDo = new ToDoItem();
    toDo.setId(itemId);
    toDo.setItem(itemText)
    return toDo;
}

const updateScreenReaderConfirmation = (newEntryText, actionVerb) => {
    document.getElementById("confirmation").textContent = `${newEntryText} ${actionVerb}.`;
}