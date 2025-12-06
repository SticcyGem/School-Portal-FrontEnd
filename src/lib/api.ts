// src/lib/api.ts
export const API_BASE = "http://localhost:8080/api";

export async function apiRequest(endpoint: string, method = "GET", body?: any) {
    const token = localStorage.getItem("jwt_token");
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        // 401 Unauthorized handling
        if (res.status === 401) {
            localStorage.removeItem("jwt_token");
            window.location.href = "/login";
            return null;
        }

        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        // Handle HTTP errors returned by the server (e.g., 400 from validation)
        if (!res.ok) {
            throw new Error(data.message || data.error || `Error ${res.status}`);
        }

        return data;
    } catch (e) {
        console.error("API Error:", e);
        throw e;
    }
}