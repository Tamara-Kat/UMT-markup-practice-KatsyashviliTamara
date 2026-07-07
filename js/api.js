const BASE_URL = "http://localhost:3001/api/bouquets";

function normalizeResponseData(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData.data)) {
    return responseData.data;
  }

  return [];
}

async function fetchAllBouquets() {
  const response = await axios.get(BASE_URL);
  return normalizeResponseData(response.data);
}

async function fetchBestsellers() {
  const bouquets = await fetchAllBouquets();

  return bouquets.filter((bouquet) => bouquet.favorite);
}

async function fetchBouquets({ category = "all" } = {}) {
  const bouquets = await fetchAllBouquets();

  const regularBouquets = bouquets.filter((bouquet) => !bouquet.favorite);

  const hasCategories = regularBouquets.some((bouquet) => bouquet.category);

  if (!hasCategories || category === "all") {
    return regularBouquets;
  }

  return regularBouquets.filter((bouquet) => bouquet.category === category);
}