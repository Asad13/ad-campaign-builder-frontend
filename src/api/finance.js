import axios from "axios";
import { BASE_URL } from "@config/constants";

const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  credentials: "include",
});

const url = "/api/v1/finance";

export const getAllCards = ({ config }) =>
  axiosPrivate.get(url + "/cards", config);
export const addCard = ({ data, config }) =>
  axiosPrivate.post(url + "/cards", data, config);
export const getCard = ({ config, id }) =>
  axiosPrivate.get(url + `/cards/${id}`, config);
export const deleteCard = ({ config, id }) =>
  axiosPrivate.delete(url + `/cards/${id}`, config);
export const updateCard = ({ data, config, id }) =>
  axiosPrivate.put(url + `/cards/${id}`, data, config);
export const getTaxInfo = ({ config }) =>
  axiosPrivate.get(url + "/tax/info", config);
export const saveTaxInfo = ({ data, config }) =>
  axiosPrivate.post(url + "/tax/info", data, config);
export const saveVAT_GST = ({ data, config }) =>
  axiosPrivate.post(url + "/tax/vat-gst", data, config);
export const getAllInvoices = ({ config, page }) =>
  axiosPrivate.get(url + `/invoices?page=${page}`, config);
export const getInvoice = ({ config, id }) =>
  axiosPrivate.get(url + `/invoices/${id}`, config);
