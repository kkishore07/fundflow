const API_URL = (import.meta.env?.VITE_API_URL as string | undefined) || "http://localhost:3000";

export type Role = "user" | "creator" | "admin";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
};

export type CampaignStatus = "pending" | "approved" | "rejected" | "closed";

export type Campaign = {
  _id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  status: CampaignStatus;
  endDate: string;
  creatorName: string;
  image: string | null;
  averageRating: number;
  totalRatings: number;
  createdAt?: string;
  rejectionReason?: string | null;
};

export type DonationStatus = "pending" | "processing" | "completed" | "failed" | "refunded";

export type Donation = {
  _id: string;
  amount: number;
  campaignId: string;
  campaignTitle: string;
  userName?: string;
  paymentMethod: string;
  status: DonationStatus;
  refundRequested: boolean;
  isSuspicious: boolean;
  suspiciousReason?: string | null;
  createdAt: string;
};

type ApiErrorPayload = { message?: string; error?: string };

const getStoredToken = () => localStorage.getItem("cf_token");

const toIsoString = (value: unknown) => {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
};

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => typeof value === "object" && value !== null;

const getString = (record: UnknownRecord | null | undefined, key: string): string | undefined => {
  if (!record) return undefined;
  const value = record[key];
  return typeof value === "string" ? value : undefined;
};

const getNumberLike = (record: UnknownRecord | null | undefined, key: string): number | undefined => {
  if (!record) return undefined;
  const value = record[key];
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) return Number(value);
  return undefined;
};

const getRecord = (record: UnknownRecord | null | undefined, key: string): UnknownRecord | undefined => {
  if (!record) return undefined;
  const value = record[key];
  return isRecord(value) ? value : undefined;
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) return Number(value);
  return fallback;
};

const toBool = (value: unknown) => value === true;

const asUser = (raw: unknown): User => {
  const rec = isRecord(raw) ? raw : {};
  return {
    _id: getString(rec, "_id") || getString(rec, "id") || "",
    name: getString(rec, "name") || getString(rec, "email") || "User",
    email: getString(rec, "email") || "",
    role: ((getString(rec, "role") || "user") as Role) ?? "user",
    createdAt: getString(rec, "createdAt"),
  };
};

const asCampaign = (raw: unknown): Campaign => {
  const rec = isRecord(raw) ? raw : {};
  const creator = getRecord(rec, "creator");
  const imageValue = rec["image"];
  return {
    _id: getString(rec, "_id") || "",
    title: getString(rec, "title") || "",
    description: getString(rec, "description") || "",
    targetAmount: getNumberLike(rec, "targetAmount") ?? 0,
    currentAmount: getNumberLike(rec, "currentAmount") ?? 0,
    status: ((getString(rec, "status") || "pending") as CampaignStatus) ?? "pending",
    endDate: toIsoString(rec["endDate"]),
    creatorName: getString(rec, "creatorName") || getString(creator, "name") || "",
    image: typeof imageValue === "string" ? imageValue : imageValue === null ? null : null,
    averageRating: toNumber(rec["averageRating"], 0),
    totalRatings: toNumber(rec["totalRatings"], 0),
    createdAt: getString(rec, "createdAt"),
    rejectionReason: getString(rec, "rejectionReason") ?? null,
  };
};

const asDonation = (raw: unknown): Donation => {
  const rec = isRecord(raw) ? raw : {};
  const campaign = getRecord(rec, "campaign");
  const donor = getRecord(rec, "donor");
  const refundStatus = getString(rec, "refundStatus");
  const campaignIdValue = getString(campaign, "_id") || (typeof rec["campaign"] === "string" ? (rec["campaign"] as string) : "");

  return {
    _id: getString(rec, "_id") || "",
    amount: getNumberLike(rec, "amount") ?? 0,
    campaignId: campaignIdValue,
    campaignTitle: getString(campaign, "title") || getString(rec, "campaignTitle") || "",
    userName: getString(donor, "name") || getString(rec, "donorName") || getString(rec, "userName"),
    paymentMethod: getString(rec, "paymentMethod") || "upi",
    status: ((getString(rec, "paymentStatus") || getString(rec, "status") || "completed") as DonationStatus) ?? "completed",
    refundRequested: refundStatus ? refundStatus !== "none" : toBool(rec["refundRequested"]),
    isSuspicious: toBool(rec["isSuspicious"]),
    suspiciousReason: getString(rec, "suspiciousReason") ?? null,
    createdAt: toIsoString(rec["createdAt"]),
  };
};

async function requestJson<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    auth?: boolean;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const { method = "GET", body, auth = true, headers = {} } = options;

  const finalHeaders: Record<string, string> = { ...headers };
  const token = getStoredToken();
  if (auth && token) finalHeaders.Authorization = `Bearer ${token}`;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (!isFormData && body !== undefined) {
    finalHeaders["Content-Type"] = finalHeaders["Content-Type"] || "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });

  const text = await res.text();
  const json: unknown = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const payload = isRecord(json) ? (json as ApiErrorPayload) : {};
    throw new Error(payload.message || payload.error || res.statusText || "Request failed");
  }

  return json as T;
}

export const getUploadUrl = (filename: string | null | undefined) => {
  if (!filename) return null;
  if (/^https?:\/\//i.test(filename)) return filename;
  return `${API_URL}/uploads/${filename}`;
};

export const api = {
  register: async (data: { name: string; email: string; password: string; role: Role }) => {
    await requestJson("/api/auth/register", { method: "POST", body: data, auth: false });
    return api.login({ email: data.email, password: data.password });
  },
  login: async (data: { email: string; password: string }) => {
    const result = await requestJson<{ user: unknown; token: string }>("/api/auth/login", {
      method: "POST",
      body: data,
      auth: false,
    });

    return { user: asUser(result.user), token: result.token };
  },
  getUsers: async () => {
    const result = await requestJson<{ users: unknown[] }>("/api/auth/users");
    return (result.users || []).map(asUser);
  },

  getCampaigns: async (params?: { status?: CampaignStatus; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    const result = await requestJson<{ campaigns: unknown[] }>(`/api/campaigns${qs ? `?${qs}` : ""}`, { auth: false });
    return (result.campaigns || []).map(asCampaign);
  },
  getCampaign: async (id: string) => {
    const result = await requestJson<{ campaign: unknown }>(`/api/campaigns/${id}`, { auth: false });
    return asCampaign(result.campaign);
  },
  getMyCampaigns: async () => {
    const result = await requestJson<{ campaigns: unknown[] }>("/api/campaigns/creator/my-campaigns");
    return (result.campaigns || []).map(asCampaign);
  },
  createCampaign: async (data: { title: string; description: string; targetAmount: number; endDate: string; image?: File | null }) => {
    const form = new FormData();
    form.append("title", data.title);
    form.append("description", data.description);
    form.append("targetAmount", String(data.targetAmount));
    form.append("endDate", data.endDate);
    if (data.image) form.append("image", data.image);
    const result = await requestJson<{ campaign: unknown }>("/api/campaigns", { method: "POST", body: form });
    return asCampaign(result.campaign);
  },
  updateCampaign: async (id: string, data: { title: string; description: string; targetAmount: number; endDate: string; image?: File | null }) => {
    const form = new FormData();
    form.append("title", data.title);
    form.append("description", data.description);
    form.append("targetAmount", String(data.targetAmount));
    form.append("endDate", data.endDate);
    if (data.image) form.append("image", data.image);
    const result = await requestJson<{ campaign: unknown }>(`/api/campaigns/${id}`, { method: "PUT", body: form });
    return asCampaign(result.campaign);
  },
  approveCampaign: async (id: string) => {
    await requestJson(`/api/campaigns/${id}/approve`, { method: "PUT" });
    return { success: true };
  },
  rejectCampaign: async (id: string, rejectionReason = "Rejected by admin") => {
    await requestJson(`/api/campaigns/${id}/reject`, { method: "PUT", body: { rejectionReason } });
    return { success: true };
  },
  rateCampaign: async (id: string, rating: number) => {
    const result = await requestJson<{ averageRating: number; totalRatings: number }>(`/api/campaigns/${id}/rate`, {
      method: "POST",
      body: { rating },
    });
    return result;
  },
  getCreatorAnalytics: async () => {
    return requestJson<{
      totalCampaigns: number;
      approvedCampaigns: number;
      pendingCampaigns: number;
      rejectedCampaigns: number;
      totalRaised: number;
      totalTarget: number;
      totalDonations: number;
      averageProgress: number;
      topCampaigns: Array<{ _id: string; title: string; targetAmount: number; currentAmount: number; donationCount: number }>;
    }>("/api/campaigns/creator/analytics");
  },

  createDonation: async (data: { campaignId: string; amount: number; paymentMethod: string }) => {
    const result = await requestJson<{ donation: unknown; warning?: string | null }>("/api/donations", {
      method: "POST",
      body: data,
    });
    return { donation: asDonation(result.donation), warning: result.warning ?? null };
  },
  getMyDonations: async () => {
    const result = await requestJson<{ donations: unknown[] }>("/api/donations/user/my-donations");
    return (result.donations || []).map(asDonation);
  },
  requestRefund: async (donationId: string, reason = "User requested a refund") => {
    await requestJson("/api/donations/refund/request", { method: "POST", body: { donationId, reason } });
    return { success: true };
  },
  getPendingRefunds: async () => {
    const result = await requestJson<{ donations: unknown[] }>("/api/donations/refund/pending");
    return (result.donations || []).map(asDonation);
  },
  processRefund: async (donationId: string, approve: boolean) => {
    const result = await requestJson<{ donation: unknown }>("/api/donations/refund/process", {
      method: "POST",
      body: { donationId, approve },
    });
    return asDonation(result.donation);
  },
  getSuspiciousDonations: async () => {
    const result = await requestJson<{ donations: unknown[] }>("/api/donations/suspicious");
    return (result.donations || []).map(asDonation);
  },
};
