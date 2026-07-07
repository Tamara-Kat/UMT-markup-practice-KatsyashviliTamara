const bestsellersList = document.querySelector(".js-bestsellers-list");
const bouquetsList = document.querySelector(".js-bouquets-list");
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

  if (shownItems >= state.bouquets.length) {
    loadMoreButton.hidden = true;

    if (state.bouquets.length > 0) {
      showMessage(bouquetsMessage, "You have reached the end of the list.");
    }

    return;
  }

  loadMoreButton.hidden = false;
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

async function renderBestsellers() {
  try {
    clearMessage(bestsellersMessage);

    const bestsellers = await fetchBestsellers();
    saveProducts(bestsellers);

    if (!bestsellers.length) {
      showMessage(bestsellersMessage, "No bestsellers found.");
      return;
    }

    const markup = createProductMarkup(bestsellers, "bestsellers-item");
    bestsellersList.innerHTML = "";
    bestsellersList.insertAdjacentHTML("beforeend", markup);
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

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const quantity = Number(productQuantityInput.value) || 1;
  const productTitle = state.selectedProduct?.title || "bouquet";

  orderMessage.textContent = `Thank you! Your order for ${quantity} ${productTitle} has been received.`;

  setTimeout(() => {
    closeOrderModal();
  }, 1800);
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

renderBestsellers();
renderBouquetsByCategory();

function scrollSlider(list, direction) {
  const firstItem = list.querySelector("li");
  const styles = window.getComputedStyle(list);
  const gap = parseFloat(styles.columnGap) || 24;
  const itemWidth = firstItem
    ? firstItem.getBoundingClientRect().width
    : list.clientWidth;

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
      scrollSlider(bestsellersList, -1);
    });

    nextButton.addEventListener("click", () => {
      scrollSlider(bestsellersList, 1);
    });
  }

  if (feedbackControls) {
    const feedbackList = document.querySelector(".feedback-list");
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

initSliderControls();