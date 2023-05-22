import axios from "axios";
import { BASE_URL } from "@config/constants";

const axiosNormal = axios.create({
  baseURL: BASE_URL,
});

const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  credentials: "include",
});

const axiosPrivateMultipart = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type" : "multipart/form-data" },
  withCredentials: true,
  credentials: "include",
});

const url = "/api/v1";

export const logInUser = (body) => axiosPrivate.post(url + "/auth/login", body);
export const signUpUser = (body) => axiosNormal.post(url + "/auth/signup", body);
export const verifyAuth = () => axiosPrivate.get(url + "/auth/token");
export const getAccessToken = () => axiosPrivate.get(url + "/auth/access");
export const forgotPassword = (body) => axiosNormal.post(url + "/auth/forgot-password", body);
export const resetPassword = ({token,body}) => axiosNormal.post(url + `/auth/reset-password/${token}`, body);
export const setPassword = ({token,body}) => axiosNormal.post(url + `/auth/set-new-password/${token}`, body);
export const updateUser = ({formData, config}) => axiosPrivateMultipart.post(url + "/users", formData, config);
export const updatePassword = ({body, config}) => axiosPrivate.post(url + "/users/password", body, config);
export const logoutUser = (body, config) => axiosPrivate.post(url + "/auth/logout", body, config);
