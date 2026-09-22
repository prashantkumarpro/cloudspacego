import axios from "axios";
import { API_URL } from "@/lib/utils/api";

export const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});