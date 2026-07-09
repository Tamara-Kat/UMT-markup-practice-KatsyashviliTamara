const bestsellersList = document.querySelector(".js-bestsellers-list");
const bouquetsList = document.querySelector(".js-bouquets-list");
const feedbackList = document.querySelector(".feedback-list");
const loadMoreButton = document.querySelector(".js-load-more");
const filterButtons = document.querySelectorAll(".filter-button");
const bestsellersMessage = document.querySelector(".js-bestsellers-message");
const bouquetsMessage = document.querySelector(".js-bouquets-message");

const productBackdrop = document.querySelector(".js-product-backdrop");
const productCloseButton = document.querySelector(".js-product-close");
const productModalImg = document.querySelector(".js-product-modal-img");
const productModalTitle = document.querySelector(".js-product-modal-title");
const productModalPrice = document.querySelector(".js-product-modal-price");
const productModalDescription = document.querySelector(
  ".js-product-modal-description"
);
const productBuyButton = document.querySelector(".js-product-buy");
const productQuantityInput = document.querySelector(".js-product-quantity");

const orderBackdrop = document.querySelector(".js-order-backdrop");
const orderCloseButton = document.querySelector(".js-order-close");
const orderForm = document.querySelector(".js-order-form");
const orderMessage = document.querySelector(".js-order-message");

const state = {
  page: 1,
  limit: 4,
  category: "all",
  bouquets: [],
  allProducts: [],
  selectedProduct: null,
  bestsellers: [],
  bestsellersPage: 0,
  bestsellersPerPage: 3,
};

function createProductMarkup(products, itemClass) {
  return products
    .map(
      ({ id, title, price, photoURL }) => `
        <li class="${itemClass}">
          <article class="product-card" data-product-id="${id}">
            <button
              class="product-image-button"
              type="button"
              data-product-open="${id}"
              aria-label="Open ${title} details"
            >
              <img
                class="product-img"
                src="${photoURL}"
                alt="${title}"
                width="320"
                loading="lazy"
              />
            </button>

            <h3 class="product-title">${title}</h3>
            <p class="product-price">$${price}</p>
          </article>
        </li>
      `
    )
    .join("");
}

function createFeedbackMarkup(feedbacks) {
  return feedbacks
    .map(
      ({ text, author }) => `
        <li class="feedback-item">
          <div class="feedback-card">
            <blockquote class="feedback-text">
              ${text}
            </blockquote>
            <p class="feedback-name">${author}</p>
          </div>
        </li>
      `
    )
    .join("");
}

function showMessage(element, text, type = "success") {
  element.textContent = text;
  element.classList.remove("is-error", "is-success");
  element.classList.add(type === "error" ? "is-error" : "is-success");
}

function clearMessage(element) {
  element.textContent = "";
  element.classList.remove("is-error", "is-success");
}

function getCurrentPageItems() {
  const start = (state.page - 1) * state.limit;
  const end = state.page * state.limit;

  return state.bouquets.slice(start, end);
}

function updateLoadMoreButton() {
  const shownItems = state.page * state.limit;
  const shouldHideButton = shownItems >= state.bouquets.length;

  loadMoreButton.hidden = shouldHideButton;
  loadMoreButton.classList.toggle("is-hidden", shouldHideButton);

  if (shouldHideButton && state.bouquets.length > 0) {
    showMessage(bouquetsMessage, "You have reached the end of the list.");
  }
}

function saveProducts(products) {
  products.forEach((product) => {
    const alreadySaved = state.allProducts.some(
      (savedProduct) => String(savedProduct.id) === String(product.id)
    );

    if (!alreadySaved) {
      state.allProducts.push(product);
    }
  });
}

function findProductById(id) {
  return state.allProducts.find((product) => String(product.id) === String(id));
}

function openProductModal(product) {
  state.selectedProduct = product;

  productModalImg.src = product.photoURL;
  productModalImg.alt = product.title;
  productModalTitle.textContent = product.title;
  productModalPrice.textContent = `$${product.price}`;

  const defaultDescription =
    "Each stem is carefully selected to create a bouquet that radiates freshness, elegance, and the gentle charm of spring. Whether you're celebrating a birthday, sending love, or simply brightening someone's day, this arrangement is sure to bring warm smiles and lasting impressions.";

  productModalDescription.textContent =
    product.description && product.description.length > 80
      ? product.description
      : defaultDescription;

  productQuantityInput.value = 1;

  productBackdrop.classList.remove("is-hidden");
  document.body.classList.add("modal-open");
}

function closeProductModal() {
  productBackdrop.classList.add("is-hidden");
  document.body.classList.remove("modal-open");
}

function openOrderModal() {
  orderBackdrop.classList.remove("is-hidden");
  document.body.classList.add("modal-open");
}

function closeOrderModal() {
  orderBackdrop.classList.add("is-hidden");
  document.body.classList.remove("modal-open");
  orderForm.reset();
  orderMessage.textContent = "";
}

function handleProductClick(event) {
  const openButton = event.target.closest("[data-product-open]");

  if (!openButton) {
    return;
  }

  const productId = openButton.dataset.productOpen;
  const product = findProductById(productId);

  if (!product) {
    return;
  }

  openProductModal(product);
}

function getVisibleBestsellers() {
  const start = state.bestsellersPage * state.bestsellersPerPage;
  const end = start + state.bestsellersPerPage;

  return state.bestsellers.slice(start, end);
}

function updateBestsellersDots() {
  const dots = document.querySelectorAll(".bestsellers .slider-dot");

  dots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === state.bestsellersPage);
  });
}

function renderVisibleBestsellers() {
  const visibleBestsellers = getVisibleBestsellers();
  const markup = createProductMarkup(visibleBestsellers, "bestsellers-item");

  bestsellersList.innerHTML = "";
  bestsellersList.insertAdjacentHTML("beforeend", markup);
  updateBestsellersDots();
}

async function renderBestsellers() {
  try {
    clearMessage(bestsellersMessage);

    const bestsellers = await fetchBestsellers();

    state.bestsellers = bestsellers;
    state.bestsellersPage = 0;

    saveProducts(bestsellers);

    if (!bestsellers.length) {
      showMessage(bestsellersMessage, "No bestsellers found.");
      return;
    }

    renderVisibleBestsellers();
  } catch (error) {
    showMessage(
      bestsellersMessage,
      "Sorry, bestsellers could not be loaded.",
      "error"
    );
  }
}

async function renderBouquetsByCategory() {
  try {
    clearMessage(bouquetsMessage);
    bouquetsList.innerHTML = "";
    loadMoreButton.hidden = true;
    loadMoreButton.classList.add("is-hidden");

    state.page = 1;
    state.bouquets = await fetchBouquets({
      category: state.category,
    });

    saveProducts(state.bouquets);

    if (!state.bouquets.length) {
      showMessage(bouquetsMessage, "No bouquets found.");
      return;
    }

    const firstItems = getCurrentPageItems();
    const markup = createProductMarkup(firstItems, "bouquets-item");

    bouquetsList.insertAdjacentHTML("beforeend", markup);
    updateLoadMoreButton();
  } catch (error) {
    showMessage(
      bouquetsMessage,
      "Sorry, bouquets could not be loaded. Check backend server.",
      "error"
    );
    loadMoreButton.hidden = true;
    loadMoreButton.classList.add("is-hidden");
  }
}

async function renderFeedbacks() {
  try {
    const feedbacks = await fetchFeedbacks();

    if (!feedbacks.length) {
      return;
    }

    feedbackList.innerHTML = "";
    feedbackList.insertAdjacentHTML("beforeend", createFeedbackMarkup(feedbacks));
  } catch (error) {
    console.error("Feedbacks could not be loaded:", error);
  }
}

loadMoreButton.addEventListener("click", () => {
  clearMessage(bouquetsMessage);

  state.page += 1;

  const nextItems = getCurrentPageItems();
  const markup = createProductMarkup(nextItems, "bouquets-item");

  bouquetsList.insertAdjacentHTML("beforeend", markup);
  updateLoadMoreButton();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const selectedCategory = button.dataset.category;

    if (state.category === selectedCategory) {
      return;
    }

    state.category = selectedCategory;

    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    await renderBouquetsByCategory();
  });
});

bestsellersList.addEventListener("click", handleProductClick);
bouquetsList.addEventListener("click", handleProductClick);

productCloseButton.addEventListener("click", closeProductModal);

productBackdrop.addEventListener("click", (event) => {
  if (event.target === productBackdrop) {
    closeProductModal();
  }
});

productBuyButton.addEventListener("click", () => {
  closeProductModal();
  openOrderModal();
});

orderCloseButton.addEventListener("click", closeOrderModal);

orderBackdrop.addEventListener("click", (event) => {
  if (event.target === orderBackdrop) {
    closeOrderModal();
  }
});

orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!state.selectedProduct) {
    orderMessage.textContent = "Please choose a bouquet first.";
    return;
  }

  const formData = new FormData(orderForm);

  const orderData = {
    productId: Number(state.selectedProduct.id),
    productTitle: state.selectedProduct.title,
    quantity: Number(productQuantityInput.value) || 1,
    name: formData.get("name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    message: formData.get("message") || "",
  };

  try {
    await createOrder(orderData);

    orderMessage.textContent = `Thank you! Your order for ${orderData.quantity} ${orderData.productTitle} has been created.`;

    setTimeout(() => {
      closeOrderModal();
    }, 1800);
  } catch (error) {
    orderMessage.textContent = "Sorry, order could not be created.";
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  if (!productBackdrop.classList.contains("is-hidden")) {
    closeProductModal();
  }

  if (!orderBackdrop.classList.contains("is-hidden")) {
    closeOrderModal();
  }
});

function scrollSlider(list, direction) {
  if (!list) {
    return;
  }

  const firstItem = list.querySelector("li");

  if (!firstItem) {
    return;
  }

  const styles = window.getComputedStyle(list);
  const gap = parseFloat(styles.columnGap || styles.gap) || 24;
  const itemWidth = firstItem.getBoundingClientRect().width;

  list.scrollBy({
    left: direction * (itemWidth + gap),
    behavior: "smooth",
  });
}

function initSliderControls() {
  const bestsellersControls = document.querySelector(".bestsellers-controls");
  const feedbackControls = document.querySelector(".feedback-controls");

  if (bestsellersControls && bestsellersList) {
    const [prevButton, nextButton] =
      bestsellersControls.querySelectorAll(".slider-button");

    prevButton.addEventListener("click", () => {
      const pagesCount = Math.ceil(
        state.bestsellers.length / state.bestsellersPerPage
      );

      state.bestsellersPage =
        (state.bestsellersPage - 1 + pagesCount) % pagesCount;

      renderVisibleBestsellers();
    });

    nextButton.addEventListener("click", () => {
      const pagesCount = Math.ceil(
        state.bestsellers.length / state.bestsellersPerPage
      );

      state.bestsellersPage = (state.bestsellersPage + 1) % pagesCount;

      renderVisibleBestsellers();
    });
  }

  if (feedbackControls && feedbackList) {
    const [prevButton, nextButton] =
      feedbackControls.querySelectorAll(".slider-button");

    prevButton.addEventListener("click", () => {
      scrollSlider(feedbackList, -1);
    });

    nextButton.addEventListener("click", () => {
      scrollSlider(feedbackList, 1);
    });
  }
}

renderBestsellers();
renderBouquetsByCategory();
renderFeedbacks();
initSliderControls();