// ======== STEP 1: Select important elements from the page ========

const userTableBody = document.getElementById("userTableBody");
const searchInput = document.getElementById("searchInput");
const addUserBtn = document.getElementById("addUserBtn");
const userFormSection = document.getElementById("userFormSection");
const userForm = document.getElementById("userForm");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const departmentInput = document.getElementById("department");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");

// Pagination elements
const rowsPerPageSelect = document.getElementById("rowsPerPage");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfo = document.getElementById("pageInfo");

// ======== STEP 2: Define where we get data ========
const API_URL = "https://jsonplaceholder.typicode.com/users";

// ======== STEP 3: Global variables ========
let usersList = [];
let editMode = false;
let currentEditId = null;
let currentPage = 1;
let rowsPerPage = 10;

// ======== STEP 4: Fetch and display users ========
async function fetchUsers() {
  try {
    const response = await fetch(API_URL);
    const users = await response.json();
    usersList = users;
    displayPaginatedUsers(); // Show first page only
  } catch (error) {
    console.error("Error fetching users:", error);
    alert("Failed to load users. Please check your internet connection.");
  }
}

// ======== STEP 5: Display users in the table ========
function displayUsers(users) {
  userTableBody.innerHTML = "";

  users.forEach((user) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name.split(" ")[0]}</td>
      <td>${user.name.split(" ")[1] || ""}</td>
      <td>${user.email}</td>
      <td>${user.company.name}</td>
      <td>
        <button class="action-btn edit-btn" data-id="${user.id}">Edit</button>
        <button class="action-btn delete-btn" data-id="${user.id}">Delete</button>
      </td>
    `;

    userTableBody.appendChild(row);
  });

  // Attach events to Edit and Delete buttons
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const userId = parseInt(e.target.dataset.id);
      editUser(userId);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const userId = parseInt(e.target.dataset.id);
      deleteUser(userId);
    });
  });
}

// ======== STEP 6: Pagination Logic ========

function displayPaginatedUsers() {
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedUsers = usersList.slice(start, end);
  displayUsers(paginatedUsers);
  updatePageInfo();
}

function updatePageInfo() {
  const totalPages = Math.ceil(usersList.length / rowsPerPage);
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayPaginatedUsers();
  }
});

nextPageBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(usersList.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayPaginatedUsers();
  }
});

rowsPerPageSelect.addEventListener("change", (e) => {
  rowsPerPage = parseInt(e.target.value);
  currentPage = 1;
  displayPaginatedUsers();
});

// ======== STEP 7: Add & Edit User ========

addUserBtn.addEventListener("click", () => {
  userFormSection.classList.remove("hidden");
  userForm.reset();
  formTitle.textContent = "Add User";
  editMode = false;
  currentEditId = null;
});

cancelBtn.addEventListener("click", () => {
  userFormSection.classList.add("hidden");
});

userForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const userData = {
    firstName: firstNameInput.value.trim(),
    lastName: lastNameInput.value.trim(),
    email: emailInput.value.trim(),
    department: departmentInput.value.trim(),
  };

  if (!userData.firstName || !userData.lastName || !userData.email || !userData.department) {
    alert("Please fill in all fields.");
    return;
  }

  if (editMode) {
    const index = usersList.findIndex((u) => u.id === currentEditId);
    if (index !== -1) {
      usersList[index].name = `${userData.firstName} ${userData.lastName}`;
      usersList[index].email = userData.email;
      usersList[index].company.name = userData.department;
    }
    alert("User updated successfully!");
  } else {
    const newUser = {
      id: usersList.length + 1,
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      company: { name: userData.department },
    };
    usersList.push(newUser);
    alert("User added successfully!");
  }

  userForm.reset();
  userFormSection.classList.add("hidden");
  editMode = false;
  currentEditId = null;
  formTitle.textContent = "Add User";

  displayPaginatedUsers(); // ✅ Fix: show correct paginated list
});

// ======== STEP 8: Edit User ========
function editUser(id) {
  const user = usersList.find((u) => u.id === id);
  if (!user) return alert("User not found!");

  const [first, last] = user.name.split(" ");
  firstNameInput.value = first || "";
  lastNameInput.value = last || "";
  emailInput.value = user.email;
  departmentInput.value = user.company.name;

  editMode = true;
  currentEditId = id;
  formTitle.textContent = "Edit User";
  userFormSection.classList.remove("hidden");
}

// ======== STEP 9: Delete User ========
function deleteUser(id) {
  const confirmDelete = confirm("Are you sure you want to delete this user?");
  if (!confirmDelete) return;

  usersList = usersList.filter((user) => user.id !== id);
  alert("User deleted successfully!");
  displayPaginatedUsers(); // ✅ Fix: update correct page after delete
}

// ======== STEP 10: Search Users ========
searchInput.addEventListener("input", (event) => {
  const searchTerm = event.target.value.toLowerCase();

  const filteredUsers = usersList.filter((user) => {
    const fullName = user.name.toLowerCase();
    const email = user.email.toLowerCase();
    const department = user.company.name.toLowerCase();
    return (
      fullName.includes(searchTerm) ||
      email.includes(searchTerm) ||
      department.includes(searchTerm)
    );
  });

  displayUsers(filteredUsers);
});

// ======== STEP 11: Sorting ========
let sortDirection = "asc";
let activeColumn = null;

document.querySelectorAll("th[data-column]").forEach((header) => {
  header.addEventListener("click", () => {
    const column = header.dataset.column;

    if (activeColumn === column) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortDirection = "asc";
      activeColumn = column;
    }

    sortUsers(column, sortDirection);
    updateSortArrows(column, sortDirection);
  });
});

function updateSortArrows(column, direction) {
  document.querySelectorAll("th[data-column]").forEach((header) => {
    if (header.dataset.column === column) {
      header.textContent =
        header.textContent.split(" ")[0] + (direction === "asc" ? " ↑" : " ↓");
    } else {
      header.textContent = header.textContent.split(" ")[0] + " ⬍";
    }
  });
}

function sortUsers(column, direction) {
  let sortedUsers = [...usersList];

  sortedUsers.sort((a, b) => {
    let valueA = "";
    let valueB = "";

    if (column === "firstName") {
      valueA = a.name.split(" ")[0].toLowerCase();
      valueB = b.name.split(" ")[0].toLowerCase();
    } else if (column === "lastName") {
      valueA = (a.name.split(" ")[1] || "").toLowerCase();
      valueB = (b.name.split(" ")[1] || "").toLowerCase();
    } else if (column === "email") {
      valueA = a.email.toLowerCase();
      valueB = b.email.toLowerCase();
    } else if (column === "department") {
      valueA = a.company.name.toLowerCase();
      valueB = b.company.name.toLowerCase();
    } else if (column === "id") {
      valueA = a.id;
      valueB = b.id;
    }

    if (valueA < valueB) return direction === "asc" ? -1 : 1;
    if (valueA > valueB) return direction === "asc" ? 1 : -1;
    return 0;
  });

  usersList = sortedUsers;
  displayPaginatedUsers();
}

// ======== STEP 12: Run on page load ========
fetchUsers();
