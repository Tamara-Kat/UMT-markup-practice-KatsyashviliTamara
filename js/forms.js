const subscribeForm = document.querySelector(".subscribe-form");
const modalForm = document.querySelector(".modal-form");

function createFormMessage(form, text) {
  let message = form.querySelector(".form-message");

  if (!message) {
    message = document.createElement("p");
    message.classList.add("form-message");
    form.append(message);
  }

  message.textContent = text;
}

subscribeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(subscribeForm);
  const email = formData.get("subscriber_email");

  createFormMessage(
    subscribeForm,
    `Thank you! ${email} has been subscribed.`
  );

  subscribeForm.reset();
});

modalForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(modalForm);
  const name = formData.get("user_name");

  createFormMessage(
    modalForm,
    `Thank you, ${name}! Your request has been sent.`
  );

  modalForm.reset();
});