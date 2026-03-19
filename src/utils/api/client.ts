import axios from "axios";
import { ENV } from "src/utils/constants/env";

const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
