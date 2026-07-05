const bestsellersList = document.querySelector(".js-bestsellers-list");
const bouquetsList = document.querySelector(".js-bouquets-list");
const loadMoreButton = document.querySelector(".js-load-more");
const filterButtons = document.querySelectorAll(".filter-button");
const bestsellersMessage = document.querySelector(".js-bestsellers-message");
const bouquetsMessage = document.querySelector(".js-bouquets-message");

const state = {
  page: 1,
  limit: 4,
  category: "all",
  bouquets: [],
};

function createProductMarkup(products, itemClass) {
  return products
    .map(
      ({ title, price, image, image2x, alt }) => `
        <li class="${itemClass}">
          <article class="product-card">
            <img
              class="product-img"
              src="${image}"
              srcset="${image} 1x, ${image2x} 2x"
              alt="${alt}"
              width="320"
              loading="lazy"
            />
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

async function renderBestsellers() {
  try {
    clearMessage(bestsellersMessage);

    const bestsellers = await fetchBestsellers();

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
      "Sorry, bouquets could not be loaded. Check json-server.",
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