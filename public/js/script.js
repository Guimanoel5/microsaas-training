// Sistema de Notificação (Global)
window.showAlert = function(message, type = 'success') {
    const pop = document.getElementById("notificationPopUp");
    const text = document.getElementById("notificationText");
    text.textContent = message;
    pop.classList.remove('translate-x-[150%]', 'border-blue-600', 'border-red-600');
    pop.classList.add(type === 'error' ? 'border-red-600' : 'border-blue-600');
    setTimeout(() => pop.classList.add('translate-x-[150%]'), 3500);
};

// --- NOVA FUNÇÃO DE NAVEGAÇÃO ---
window.showSection = function(section) {
    const contentIdeias = document.getElementById("content-ideias");
    const contentUsers = document.getElementById("content-users");
    const linkIdeias = document.getElementById("link-ideias");
    const linkUsers = document.getElementById("link-users");

    if (section === 'users') {
        contentIdeias.classList.add("hidden");
        contentUsers.classList.remove("hidden");
        // Estilo ativo na sidebar
        linkUsers.classList.add("bg-blue-700", "text-white");
        linkIdeias.classList.remove("bg-blue-700", "text-white");
        window.loadUsers();
    } else {
        contentUsers.classList.add("hidden");
        contentIdeias.classList.remove("hidden");
        // Estilo ativo na sidebar
        linkIdeias.classList.add("bg-blue-700", "text-white");
        linkUsers.classList.remove("bg-blue-700", "text-white");
    }
};

// Carregar Usuários
window.loadUsers = async function() {
    try {
        const res = await fetch("/api/users");
        const users = await res.json();
        const table = document.getElementById("userTable");
        table.innerHTML = "";
        users.forEach(user => {
            table.innerHTML += `
                <tr class="border-b border-blue-100 hover:bg-blue-50 transition">
                    <td class="p-4 text-sm text-blue-700 font-medium">${user.id}</td>
                    <td class="p-4 text-blue-800 font-medium">${user.name}</td>
                    <td class="p-4 text-blue-500 text-sm">${user.email}</td>
                    <td class="p-4 text-center">
                        <button onclick="editUser(${user.id})" class="text-blue-500 hover:text-blue-700 mr-3"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteUser(${user.id})" class="text-red-400 hover:text-red-600"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        });
    } catch (err) { console.error(err); }
};

// FUNÇÃO QUE SALVA
window.handleSaveUser = async function(event) {
    if (event) event.preventDefault();
    
    const id = document.getElementById("userId").value;
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const isUpdate = id && id !== "";
    const userData = { name, email };

    if (!isUpdate || (password && password.trim() !== "")) {
        userData.password = password;
    }

    try {
        const res = await fetch(isUpdate ? `/api/users/${id}` : "/api/users", {
            method: isUpdate ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });

        if (res.ok) {
            showAlert(isUpdate ? "Atualizado!" : "Criado!");
            document.getElementById("userModal").classList.add("hidden");
            document.getElementById("userForm").reset();
            loadUsers();
        } else {
            const errorData = await res.json();
            showAlert(errorData.message || "Erro na API", "error");
        }
    } catch (err) {
        showAlert("Erro de conexão", "error");
    }
};

window.editUser = async function(id) {
    const res = await fetch(`/api/users/${id}`);
    const user = await res.json();
    document.getElementById("modalTitle").textContent = "Editar Usuário";
    document.getElementById("userId").value = user.id;
    document.getElementById("name").value = user.name;
    document.getElementById("email").value = user.email;
    document.getElementById("userModal").classList.remove("hidden");
    document.getElementById("userModal").classList.add("flex");
};

window.deleteUser = function(id) {
    if(confirm("Deseja excluir?")) {
        fetch(`/api/users/${id}`, { method: "DELETE" }).then(() => loadUsers());
    }
};

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    // Eventos de clique para navegação
    document.getElementById("link-users").onclick = (e) => {
        e.preventDefault();
        showSection('users');
    };

    document.getElementById("link-ideias").onclick = (e) => {
        e.preventDefault();
        showSection('ideias');
    };

    // Botão abrir modal
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
});