async function sendRequest(path, data) {
  const response = await fetch(`/api/auth/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Request failed.");
  }

  return result;
}

function createUser(name, email, password) {
  return sendRequest("register", { name, email, password });
}

function loginUser(email, password) {
  return sendRequest("login", { email, password });
}

function logoutUser() {
  return sendRequest("logout", {});
}

async function getCurrentUser() {
  const response = await fetch("/api/auth/me");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Could not check login status.");
  }

  return response.json();
}

export {
    createUser, 
    loginUser, 
    logoutUser, 
    getCurrentUser,
};
