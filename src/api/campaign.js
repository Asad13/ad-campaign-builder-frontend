import axios from "axios";
import { BASE_URL } from "@config/constants";

const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  credentials: "include",
});

const axiosPrivateMultipart = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "multipart/form-data" },
  withCredentials: true,
  credentials: "include",
});

const url = "/api/v1/campaigns";

export const getAllCampaigns = ({ config, page }) =>
  axiosPrivate.get(url + `?page=${page}`, config);
export const getCampaign = ({ config, id }) =>
  axiosPrivate.get(url + `/${id}`, config);
export const updateCampaign = ({ formData, config, id }) =>
  axiosPrivate.put(url + `/${id}`, formData, config);
export const deleteCampaign = ({ config, id }) =>
  axiosPrivate.delete(url + `/${id}`, config);
export const createCampaign = ({ formData, config }) =>
  axiosPrivate.post(url, formData, config);
