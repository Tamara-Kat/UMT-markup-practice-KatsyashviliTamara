const API_BASE_URL = "https://flora-backend-jtb2.onrender.com/api";

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
  const response = await axios.get(`${API_BASE_URL}/bouquets`);
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

async function fetchFeedbacks() {
  const response = await axios.get(`${API_BASE_URL}/feedbacks`);
  return normalizeResponseData(response.data);
}

async function createOrder(orderData) {
  const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
  return response.data;
}