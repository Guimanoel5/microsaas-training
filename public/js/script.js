// ===============================
// AUTH FETCH (Request com Token)
// ===============================

async function authFetch(url, options = {}) {
    const token = localStorage.getItem("token");

    return fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": token ? "Bearer " + token : "",
            ...options.headers
        }
    });
}

// ===============================
// Proteção da Dashboard
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token && !window.location.pathname.includes("login")) {
        window.location.href = "/login.html";
        return;
    }

    initDashboardEvents();
});

// ===============================
// Sistema de Notificação PROFISSIONAL
// ===============================

function showNotification(message, type = "info") {
    const popup = document.getElementById("notificationPopUp");
    const text = document.getElementById("notificationText");
    const iconContainer = document.getElementById("notificationIcon");

    text.textContent = message;

    popup.classList.remove("border-blue-600", "border-red-600", "border-green-600");
    iconContainer.classList.remove(
        "bg-blue-100", "text-blue-500",
        "bg-red-100", "text-red-500",
        "bg-green-100", "text-green-500"
    );

    if (type === "error") {
        popup.classList.add("border-red-600");
        iconContainer.classList.add("bg-red-100", "text-red-500");
        iconContainer.innerHTML = `<i class="fas fa-times-circle"></i>`;
    } else if (type === "success") {
        popup.classList.add("border-green-600");
        iconContainer.classList.add("bg-green-100", "text-green-500");
        iconContainer.innerHTML = `<i class="fas fa-check-circle"></i>`;
    } else {
        popup.classList.add("border-blue-600");
        iconContainer.classList.add("bg-blue-100", "text-blue-500");
        iconContainer.innerHTML = `<i class="fas fa-info-circle"></i>`;
    }

    popup.classList.remove("translate-x-[150%]");

    setTimeout(() => {
        popup.classList.add("translate-x-[150%]");
    }, 3000);
}

// ===============================
// Navegação entre seções
// ===============================

window.showSection = function(section) {
    const contentIdeias = document.getElementById("content-ideias");
    const contentUsers = document.getElementById("content-users");
    const linkIdeias = document.getElementById("link-ideias");
    const linkUsers = document.getElementById("link-users");

    if (section === "users") {
        contentIdeias.classList.add("hidden");
        contentUsers.classList.remove("hidden");

        linkUsers.classList.add("bg-blue-700", "text-white");
        linkIdeias.classList.remove("bg-blue-700", "text-white");

        loadUsers();
    } else {
        contentUsers.classList.add("hidden");
        contentIdeias.classList.remove("hidden");

        linkIdeias.classList.add("bg-blue-700", "text-white");
        linkUsers.classList.remove("bg-blue-700", "text-white");
    }
};

// ===============================
// Carregar Usuários
// ===============================

window.loadUsers = async function() {
    try {
        const res = await authFetch("/api/users");

        if (!res.ok) throw new Error();

        const users = await res.json();
        const table = document.getElementById("userTable");

        table.innerHTML = "";

        users.forEach(user => {
            table.innerHTML += `
                <tr class="border-b border-blue-100 hover:bg-blue-50 transition">
                    <td class="p-4 text-blue-800 font-medium">${user.name}</td>
                    <td class="p-4 text-blue-500 text-sm">${user.email}</td>
                    <td class="p-4 text-center">
                        <button onclick="editUser(${user.id})" class="text-blue-500 hover:text-blue-700 mr-3">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteUser(${user.id})" class="text-red-400 hover:text-red-600">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
        });

    } catch {
        showNotification("Erro ao conectar com o banco de dados", "error");
    }
};

// ===============================
// Salvar Usuário
// ===============================

window.handleSaveUser = async function(event) {
    if (event) event.preventDefault();

    const id = document.getElementById("userId").value;
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const isUpdate = id && id !== "";
    const userData = { name, email };

    if (!isUpdate || password.trim() !== "") {
        userData.password = password;
    }

    try {
        const res = await authFetch(
            isUpdate ? `/api/users/${id}` : "/api/users",
            {
                method: isUpdate ? "PUT" : "POST",
                body: JSON.stringify(userData)
            }
        );

        if (res.ok) {
            showNotification(
                isUpdate
                    ? "Usuário atualizado com sucesso!"
                    : "Usuário criado com sucesso!",
                "success"
            );

            document.getElementById("userModal").classList.add("hidden");
            document.getElementById("userForm").reset();

            loadUsers();
        } else {
            const errorData = await res.json();
            showNotification(errorData.message || "Erro na API", "error");
        }

    } catch {
        showNotification("Erro de conexão", "error");
    }
};

// ===============================
// Editar Usuário
// ===============================

window.editUser = async function(id) {
    const res = await authFetch(`/api/users/${id}`);
    if (!res.ok) return;

    const user = await res.json();

    document.getElementById("modalTitle").textContent = "Editar Usuário";
    document.getElementById("userId").value = user.id;
    document.getElementById("name").value = user.name;
    document.getElementById("email").value = user.email;

    document.getElementById("userModal").classList.remove("hidden");
    document.getElementById("userModal").classList.add("flex");
};

// ===============================
// Deletar Usuário (SEM confirm())
// ===============================

window.deleteUser = function(id) {
    authFetch(`/api/users/${id}`, {
        method: "DELETE"
    })
    .then(res => {
        if (!res.ok) throw new Error();
        showNotification("Usuário removido com sucesso!", "success");
        loadUsers();
    })
    .catch(() => showNotification("Erro ao excluir usuário", "error"));
};

// ===============================
// Inicialização dos Eventos
// ===============================

function initDashboardEvents() {

    const refreshBtn = document.getElementById("refreshUsersBtn");

    if (refreshBtn) {
        refreshBtn.onclick = () => {
            loadUsers();
            showNotification("Dados sincronizados com o banco!", "success");
        };
    }

    document.getElementById("link-users").onclick = e => {
        e.preventDefault();
        showSection("users");
    };

    document.getElementById("link-ideias").onclick = e => {
        e.preventDefault();
        showSection("ideias");
    };

    document.getElementById("openCreateUserModalBtn").onclick = () => {
        document.getElementById("modalTitle").textContent = "Criar Usuário";
        document.getElementById("userId").value = "";
        document.getElementById("userForm").reset();

        document.getElementById("userModal").classList.remove("hidden");
        document.getElementById("userModal").classList.add("flex");
    };

    document.getElementById("closeUserModalBtn").onclick = () => {
        document.getElementById("userModal").classList.add("hidden");
    };
}