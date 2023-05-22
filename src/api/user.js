import axios from "axios";
import { BASE_URL } from "@config/constants";

const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  credentials: "include",
});

const url = "/api/v1/users";

export const getAllUsers = ({ config, path }) =>
  axiosPrivate.get(url + `${path}`, config);
export const getRoles = ({ config }) =>
  axiosPrivate.get(url + `/roles`, config);
export const deleteUser = ({ config, id }) =>
  axiosPrivate.delete(url + `/${id}`, config);
export const updateUserRole = ({ data, config, id }) =>
  axiosPrivate.put(url + `/role/${id}`, data, config);
export const inviteUser = ({ data, config }) =>
  axiosPrivate.post(url + `/invite`, data, config);
export const resendInvite = ({ data , config }) =>
  axiosPrivate.post(url + `/invite/resend`, data, config);
