import { PlaceSummary, PlaceDetail, Review, TourSlot, User } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiClient {
  private activeUserId: string | null = null;

  setActiveUserId(id: string | null) {
    this.activeUserId = id;
  }

  getActiveUserId(): string | null {
    if (this.activeUserId) return this.activeUserId;
    if (typeof window !== "undefined") {
      return localStorage.getItem("wayfarer_active_user_id");
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set("Content-Type", "application/json");

    const userId = this.getActiveUserId();
    if (userId) {
      headers.set("X-User-Id", userId);
    }

    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage =
          data.error ||
          data.message ||
          (data.details && data.details[0]?.message) ||
          `Request failed with status ${response.status}`;
        const error = new Error(errorMessage);
        (error as any).code = data.code;
        (error as any).status = response.status;
        throw error;
      }

      return data as T;
    } catch (err: any) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        throw new Error("Cannot connect to Wayfarer API server. Please ensure the backend is running.");
      }
      throw err;
    }
  }

  // Users endpoint for switcher
  async getUsers(): Promise<User[]> {
    return this.request<User[]>("/users");
  }

  // Places list with category and sort query
  async getPlaces(params: { category?: string; sort?: string; search?: string } = {}): Promise<PlaceSummary[]> {
    const query = new URLSearchParams();
    if (params.category && params.category !== "All") query.set("category", params.category);
    if (params.sort) query.set("sort", params.sort);
    if (params.search) query.set("search", params.search);

    const qs = query.toString();
    return this.request<PlaceSummary[]>(`/places${qs ? `?${qs}` : ""}`);
  }

  // Single place detail
  async getPlaceById(id: string): Promise<PlaceDetail> {
    return this.request<PlaceDetail>(`/places/${id}`);
  }

  // Tour slots for place
  async getTourSlots(placeId: string): Promise<TourSlot[]> {
    return this.request<TourSlot[]>(`/places/${placeId}/tour-slots`);
  }

  // Book seats on a tour slot
  async bookSeats(slotId: string, seats: number): Promise<{ booking: any; remainingSeats: number; isFullyBooked: boolean }> {
    return this.request<{ booking: any; remainingSeats: number; isFullyBooked: boolean }>(
      `/tour-slots/${slotId}/bookings`,
      {
        method: "POST",
        body: JSON.stringify({ seats }),
      }
    );
  }

  // Submit or update a review
  async submitReview(placeId: string, rating: number, body: string): Promise<Review> {
    return this.request<Review>(`/places/${placeId}/reviews`, {
      method: "POST",
      body: JSON.stringify({ rating, body }),
    });
  }
}

export const api = new ApiClient();
