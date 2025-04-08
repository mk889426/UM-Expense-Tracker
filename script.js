document.addEventListener("DOMContentLoaded", function () {
    const description = document.getElementById("description");
    const category = document.getElementById("category");
    const date = document.getElementById("date");
    const amount = document.getElementById("amount");
    const incomeItem = document.getElementById("incomes-list");
    const expenseItem = document.getElementById("expenses-list");
    const submitForm = document.getElementById("create-transaction-form");
    const netIncomeButton = document.getElementById("calculateNetIncome");
    const netIncomeText = document.getElementById("netIncomeText");
    const totalIncomeText = document.getElementById("totalIncomeText");
    const totalExpenseText = document.getElementById("totalExpenseText");
    const transactionType = document.getElementById("type");
    const subcategory = document.getElementById("subcategory");
    const filter_btn = document.getElementById("filter_btn");

    const expenseSubcategories = {
        food: ["Groceries", "Dining Out", "Snacks"],
        transportation: ["Fuel", "Taxi", "Public Transport"],
        entertainment: ["Movies", "Games", "Streaming"],
        housing: ["Rent", "Utilities", "Maintenance"],
        health: ["Doctor", "Medicine", "Insurance"],
        shopping: ["Clothing", "Electronics", "Online"],
        education: ["Tuition", "Books", "Courses"],
        travel: ["Flight", "Hotel", "Tour"],
        investment: ["Stocks", "FD", "Mutual Funds"],
        personal: ["Gym", "Salon", "Hobbies"],
        debtpayments: ["Loans", "Credit Card", "EMI"]
    };

    function loadTransactions() {
        const data = localStorage.getItem("transactions");
        if (!data) return;
        const savedTransactions = JSON.parse(data);
        incomeItem.innerHTML = "";
        expenseItem.innerHTML = "";

        savedTransactions.forEach((transaction, index) => {
            const li = document.createElement("li");
            li.textContent = `${transaction.description} ₹${transaction.amount} on ${transaction.date}`;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "❌";
            deleteButton.style.cssText = "background: none; margin-top: 0px; color: red; border: none; cursor: pointer;";
            deleteButton.addEventListener("click", () => deleteTransaction(index));
            li.appendChild(deleteButton);

            if (transaction.type === "income") {
                incomeItem.appendChild(li);
            } else {
                expenseItem.appendChild(li);
            }
        });
    }

    //initiallly load the transactions
    loadTransactions();

    // show and hide the expenses categories if the transaction type is income
    transactionType.addEventListener("change", function () {
        if (this.value === "expense") {
            category.classList.remove("toggle-category");
            subcategory.classList.remove("toggle-category");
        } else {
            category.classList.add("toggle-category");
            subcategory.classList.add("toggle-category");
        }
    });

    // function to show the sub-categories dropdown
    category.addEventListener("change", function () {
        const selectedCategory = this.value;
        const subcats = expenseSubcategories[selectedCategory] || [];

        subcategory.innerHTML = `<option value="">Select Subcategory</option>`;
        subcats.forEach(sub => {
            const option = document.createElement("option");
            option.value = sub;
            option.textContent = sub;
            subcategory.appendChild(option);
        });
    });

    // filter functionality
    filter_btn.addEventListener("change", function (event) {
        const selectedCategory = event.target.value;

        const data = localStorage.getItem("transactions");
        if (!data) return;

        const savedTransactions = JSON.parse(data);
        const filteredExpenses = savedTransactions.filter(
            (tr) => tr.type === "expense" && tr.category === selectedCategory
        );

        // clearing existing expense list
        expenseItem.innerHTML = "";

        // filtered list show
        filteredExpenses.forEach((transaction, index) => {
            const li = document.createElement("li");
            li.textContent = `${transaction.description} ₹${transaction.amount} on ${transaction.date}`;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "❌";
            deleteButton.style.cssText = "background: none; margin-top: 0px; color: red; border: none; cursor: pointer;";
            deleteButton.addEventListener("click", () => deleteTransaction(index));
            li.appendChild(deleteButton);

            expenseItem.appendChild(li);
        });
    });

    //adding new transaction
    function saveTransaction(transaction) {
        const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
        transactions.push(transaction);
        localStorage.setItem("transactions", JSON.stringify(transactions));

        description.value = "";
        transactionType.value = "income";
        category.value = "food";
        subcategory.value = "groceries";
        date.value = "";
        amount.value = "";

        category.classList.add("toggle-category");
        subcategory.classList.add("toggle-category");

        // load all transactions again after adding a new one
        loadTransactions();
    }

    function deleteTransaction(index) {
        const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
        transactions.splice(index, 1);
        localStorage.setItem("transactions", JSON.stringify(transactions));
        loadTransactions();
    }

    function validateTransaction(transaction) {
        let isValid = true;

        // Clear all previous errors
        document.getElementById("descriptionError").textContent = "";
        document.getElementById("amountError").textContent = "";
        document.getElementById("dateError").textContent = "";
        document.getElementById("categoryError").textContent = "";
        document.getElementById("subcategoryError").textContent = "";

        // Validate description
        if (!transaction.description.trim()) {
            document.getElementById("descriptionError").textContent = "Description is required.";
            isValid = false;
        }

        const amount = Number(transaction.amount);
        if (!transaction.amount || isNaN(amount) || amount <= 0) {
            document.getElementById("amountError").textContent = "Enter a valid amount greater than 0.";
            isValid = false;
        }

        if (!transaction.date) {
            document.getElementById("dateError").textContent = "Date is required.";
            isValid = false;
        }

        if (transaction.type === "expense") {
            if (!transaction.category) {
                document.getElementById("categoryError").textContent = "Select a category.";
                isValid = false;
            }
            if (!transaction.subcategory) {
                document.getElementById("subcategoryError").textContent = "Select a subcategory.";
                isValid = false;
            }
        }

        if (isValid) {
            saveTransaction(transaction);
        }
    }


    submitForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const transaction = {
            description: description.value,
            type: transactionType.value,
            date: date.value,
            amount: amount.value,
        };

        if (transaction.type === "expense") {
            transaction.category = category.value;
            transaction.subcategory = subcategory.value;
        }

        validateTransaction(transaction);
    });

    netIncomeButton.addEventListener("click", function (event) {
        event.preventDefault();

        const data = localStorage.getItem("transactions");
        if (!data) return;

        const savedTransactions = JSON.parse(data);
        const incomes = savedTransactions.filter(tr => tr.type === "income");
        const expenses = savedTransactions.filter(tr => tr.type === "expense");

        const totalIncome = incomes.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
        const totalExpense = expenses.reduce((sum, transaction) => sum + Number(transaction.amount), 0);

        netIncomeText.textContent = `₹${totalIncome - totalExpense}`;
        totalIncomeText.textContent = `₹${totalIncome}`;
        totalExpenseText.textContent = `₹${totalExpense}`;
    });
});
