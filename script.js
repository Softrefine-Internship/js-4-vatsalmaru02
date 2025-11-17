// write javascript here

let expenses = [];
const expenseForm = document.getElementById("expenseForm");
const expenseDateInput = document.getElementById("expenseDate");
const totalExpensesEl = document.getElementById("totalExpenses");
const totalItemsEl = document.getElementById("totalItems");
const expensesContainer = document.getElementById("expensesContainer");
const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");
const resetModal = document.getElementById("resetModal");
const resetExpensesBtn = document.getElementById("resetExpenses");
const confirmResetBtn = document.getElementById("confirmReset");
const cancelResetBtn = document.getElementById("cancelReset");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const selectByCategory = document.getElementById("selectByCategory");
let expenseToDeleteIndex = null;

const categoryLabels = {
  food: "Food & Dining",
  transport: "Transport",
  entertainment: "Entertainment",
  utilities: "Utilities",
  healthcare: "Healthcare",
  shopping: "Shopping",
  other: "Other",
};

const setTodayDate = () => {
  const today = new Date().toISOString().split("T")[0];
  expenseDateInput.value = today;
};

const saveExpenses = () => {
  localStorage.setItem("expenses", JSON.stringify(expenses));
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

const formatCurrency = (amount) => {
  return "₹" + parseFloat(amount).toFixed(2);
};

const getCategoryLabel = (category) => categoryLabels[category] || category;

const renderExpenses = () => {
  if (expenses.length === 0) {
    expensesContainer.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
        <h3>No expenses yet</h3>
        <p>Start tracking by adding your first expense above</p>
      </div>`;
  } else {
    const expenseRows = expenses
      .map(
        (expense, index) => `
        <tr>
          <td>${expense.name}</td>
          <td><strong>${formatCurrency(expense.amount)}</strong></td>
          <td>${formatDate(expense.date)}</td>
          <td><span class="category-badge category-${
            expense.category
          }">${getCategoryLabel(expense.category)}</span></td>
          <td><button class="btn-delete" onclick="deleteExpense(${
            expense.id
          })">Delete 
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon icon-delete">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button></td>
        </tr>`
      )
      .join("");

    expensesContainer.innerHTML = `
      <div class="table-section">
        <table>
          <thead>
            <tr>
              <th>Expense Name</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>${expenseRows}</tbody>
        </table>
      </div>`;
  }

  // Update summary
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  totalExpensesEl.textContent = formatCurrency(total);
  totalItemsEl.textContent = expenses.length;
};

const addExpense = (e) => {
  e.preventDefault();

  const formData = new FormData(expenseForm);
  const name = formData.get("expenseName").trim();
  const amount = parseFloat(formData.get("expenseAmount"));
  const date = formData.get("expenseDate");
  const category = formData.get("expenseCategory");

  if (!name || !amount || !date || !category) {
    alert("Please fill in all fields");
    return;
  }

  expenses.unshift({ id: Date.now(), name, amount, date, category });
  saveExpenses();
  renderExpenses();

  expenseForm.reset();
  setTodayDate();
};

const openDeleteModal = (id) => {
  expenseToDeleteIndex = expenses.findIndex((exp) => exp.id === id);
  deleteModal.classList.add("show");
};

const searchExpenses = () => {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = selectByCategory.value;

  let filteredExpenses = expenses;

  if (searchTerm) {
    filteredExpenses = filteredExpenses.filter((expense) => {
      const name = expense.name.toLowerCase();
      const amount = expense.amount.toString();
      return name.includes(searchTerm) || amount.includes(searchTerm);
    });
  }

  if (selectedCategory) {
    filteredExpenses = filteredExpenses.filter((expense) => {
      return expense.category === selectedCategory;
    });
  }

  if (searchTerm || selectedCategory) {
    expensesContainer.style.display = "none";
    searchResults.style.display = "block";

    if (filteredExpenses.length === 0) {
      searchResults.innerHTML = `<div class="empty-state"><p>No matching expenses found.</p></div>`;
    } else {
      const expenseRows = filteredExpenses
        .map(
          (expense) => `
          <tr>
            <td>${expense.name}</td>
            <td><strong>${formatCurrency(expense.amount)}</strong></td>
            <td>${formatDate(expense.date)}</td>
            <td><span class="category-badge category-${
              expense.category
            }">${getCategoryLabel(expense.category)}</span></td>
            <td><button class="btn-delete" onclick="deleteExpense(${
              expense.id
            })">Delete</button></td>
          </tr>`
        )
        .join("");

      searchResults.innerHTML = `
        <div class="table-section">
          <table>
            <thead>
              <tr>
                <th>Expense Name</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Category</th>
                <th>Action</th>
                </tr>
              </thead>
            <tbody>${expenseRows}</tbody>
          </table>
        </div>`;
    }
  } else {
    searchResults.style.display = "none";
    expensesContainer.style.display = "block";
  }
};

//  This function needs to be globally accessible for the onclick attribute
window.deleteExpense = openDeleteModal;

const closeDeleteModal = () => {
  deleteModal.classList.remove("show");
  expenseToDeleteIndex = null;
};

const confirmDelete = () => {
  expenses.splice(expenseToDeleteIndex, 1);
  saveExpenses();
  renderExpenses();
  searchExpenses();
  closeDeleteModal();
};

const openResetModal = () => {
  resetModal.classList.add("show");
};

const closeResetModal = () => {
  resetModal.classList.remove("show");
};

const confirmReset = () => {
  expenses = [];
  saveExpenses();
  renderExpenses();
  searchExpenses();
  closeResetModal();
};

const init = () => {
  const stored = localStorage.getItem("expenses");
  if (stored) {
    expenses = JSON.parse(stored);
  }
  setTodayDate();
  renderExpenses();
};

expenseForm.addEventListener("submit", addExpense);
confirmDeleteBtn.addEventListener("click", confirmDelete);
cancelDeleteBtn.addEventListener("click", closeDeleteModal);
resetExpensesBtn.addEventListener("click", openResetModal);
confirmResetBtn.addEventListener("click", confirmReset);
cancelResetBtn.addEventListener("click", closeResetModal);
searchInput.addEventListener("input", searchExpenses);
selectByCategory.addEventListener("change", searchExpenses);

init();
