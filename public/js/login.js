async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (res.ok && data.token) {
    localStorage.setItem("token", data.token);
    window.location.href = "/index.html";
  } else {
    alert(data.message || "Login falhou");
  }
}