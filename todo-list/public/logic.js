"use strict";
// Small helper to get element by id
function el(id) {
    return document.getElementById(id);
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded — ready to start work");

    const addBtn = el("add-task-button");
    if (!addBtn) {
        console.warn("add-task-button not found in DOM");
        return;
    }

    addBtn.addEventListener("click", function () {
        const input = el("new-task-input");
        // future: read input.value and create task element
    });
});

