const header = document.querySelector("[data-nav]");

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 16);
};

document.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

document.querySelector(".contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button");
  button.textContent = "Inquiry Sent";
  setTimeout(() => {
    button.textContent = "Send Inquiry";
    event.currentTarget.reset();
  }, 1800);
});
