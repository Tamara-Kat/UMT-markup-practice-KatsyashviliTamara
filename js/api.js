const BASE_URL = "http://localhost:3000";

function normalizeResponseData(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData.data)) {
    return responseData.data;
  }

  return [];
}

async function fetchBestsellers() {
  const response = await axios.get(`${BASE_URL}/bestsellers`);
  return normalizeResponseData(response.data);
}

async function fetchBouquets({ category = "all" }) {
  const params = {};

  if (category !== "all") {
    params.category = category;
  }

  const response = await axios.get(`${BASE_URL}/bouquets`, { params });
  return normalizeResponseData(response.data);
}