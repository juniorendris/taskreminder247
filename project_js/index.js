// ==========================================
// MODAL HANDLING
// ==========================================
const signInBtn = document.getElementById("showSignIn");
const signUpBtn = document.getElementById("showSignUp");
const signInOverlay = document.getElementById("signinOverlay");
const signUpOverlay = document.getElementById("signupOverlay");

function closeModals() {
  signInOverlay?.classList.remove("active");
  signUpOverlay?.classList.remove("active");
}

function openModal(overlay) {
  closeModals();
  overlay?.classList.add("active");
}

signInBtn?.addEventListener("click", () => openModal(signInOverlay));
signUpBtn?.addEventListener("click", () => openModal(signUpOverlay));

window.addEventListener("click", (event) => {
  if (event.target === signInOverlay || event.target === signUpOverlay) {
    closeModals();
  }
});

// ==========================================
// SIGN UP INTERACTION
// ==========================================
const signUpForm = document.getElementById("signUpForm");

if (signUpForm) {
  signUpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = {
      email: document.getElementById("signup-email").value.trim(),
      userName: document.getElementById("signup-username").value.trim(),
      password: document.getElementById("signup-password").value,
      major: document.getElementById("signup-major").value.trim(),
    };

    if (!data.email || !data.userName || !data.password) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const response = await fetch("/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
       
        localStorage.setItem("AccessToken", result.AccessToken);
        localStorage.setItem("RefreshToken", result.RefreshToken);

        alert(result.message);
        signUpForm.reset();
        window.location.href = "/customer.html";
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Unable to connect to server.");
    }
  });
}

// ==========================================
// SIGN IN INTERACTION
// ==========================================
const signInForm = document.getElementById("signInForm");

if (signInForm) {
  signInForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = {
      email: document.getElementById("signin-email").value.trim(),
      password: document.getElementById("signin-password").value,
    };

    if (!data.email || !data.password) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const response = await fetch("/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem("AccessToken", result.AccessToken);
        localStorage.setItem("RefreshToken", result.RefreshToken);

        alert(result.message);
        signInForm.reset();
        window.location.href = "/customer.html";
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Unable to connect to server.");
    }
  });
}

// ==========================================
// UTILITY ENGINE & LOGOUT
// ==========================================
function changeSearchInput() {
  const type = document.getElementById("searchType");
  const input = document.getElementById("searchValue");

  if (!type || !input) return;

  if (type.value === "reminder_time") {
    input.type = "datetime-local";
  } else {
    input.type = "text";
    input.placeholder = `Search by ${type.value.replaceAll("_", " ")}`;
  }
}

function logoutSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  alert("Logged out successfully.");
  window.location.href = "/index.html";
}
