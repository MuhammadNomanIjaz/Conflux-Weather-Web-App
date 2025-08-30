// Toggle dropdown
function toggleDropdown() {
  document.querySelector(".dropdown").classList.toggle("open");
}

// Set theme immediately when clicked (without notification)
function setTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light");
  } else {
    document.body.classList.remove("light");
  }

  // Save theme in localStorage
  localStorage.setItem("theme", theme);
}

// Load saved theme on refresh
window.onload = () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    setTheme(savedTheme);
  }
};
