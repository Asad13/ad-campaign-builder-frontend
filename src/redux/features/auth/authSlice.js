import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../../../api/auth";

export const logInUser = createAsyncThunk("auth/logInUser", async (body) => {
  const response = await api.logInUser(body);
  return response.data;
});

export const signUpUser = createAsyncThunk("auth/signUpUser", async (body) => {
  const response = await api.signUpUser(body);
  return response.data;
});

export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async ({ formData, token }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.updateUser({ formData, config });
    return response.data;
  }
);

export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async ({ body, token }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.updatePassword({ body, config });
    return response.data;
  }
);

export const forgotPassword = createAsyncThunk("auth/forgotPassword", async (body) => {
  const response = await api.forgotPassword(body);
  return response.data;
});

export const setPassword = createAsyncThunk("auth/setPassword", async ({token, values : body}) => {
  const response = await api.setPassword({token, body});
  return response.data;
});

export const resetPassword = createAsyncThunk("auth/resetPassword", async ({token, values : body}) => {
  const response = await api.resetPassword({token, body});
  return response.data;
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async (token) => {
  const body = {
    message: "logout",
  };

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.logoutUser(body, config);
  return response.data;
});

export const verifyAuth = createAsyncThunk("auth/verifyAuth", async () => {
  const response = await api.verifyAuth();
  return response.data;
});

export const getAccessToken = createAsyncThunk("auth/getAccessToken", async () => {
  const response = await api.getAccessToken();
  return response.data;
});

/**
 * User Information
 * @typedef User
 * @type {object}
 * @property {string} id - User's ID
 * @property {string} name - User's Name
 * @property {string} email - User's Email
 * @property {string} imageUrl - User's Image URL
 * @property {string} company_name - User's Company Name
 * @property {string} category_id - User's Selected Field
 * @property {string} subcategory_id - User's Selected Category
 */

const initialState = {
  errorMsg: "",
  status: null,
  message: "",
  profileMessage: "",
  /** @type {User} */
  user: null,
  token: null,
  authorized: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    saveUser: (state, action) => {
      state.status = action.payload?.status;
      state.message = action.payload?.message;
      state.user = action.payload.data?.user;
      state.token = action.payload.data?.accessToken;
    },
    updateMessage: (state, action) => {
      state.message = "";
    },
    updateProfileMessage: (state, action) => {
      state.profileMessage = "";
    },
    updateStatus: (state, action) => {
      state.status = null;
    },
  },
  extraReducers: {
    [logInUser.fulfilled]: (state, action) => {
      state.status = action.payload?.status;
      state.message = action.payload?.message;
      if(action.payload?.status){
        state.user = action.payload.data?.user;
        state.token = action.payload.data?.accessToken;
        state.authorized = true;
      }else{
        state.authorized = false;
      }
    },
    [logInUser.rejected]: (state, action) => {
      state.authorized = false;
    },
    [signUpUser.fulfilled]: (state, action) => {
      state.status = action.payload?.status;
      state.message = action.payload?.message;
    },
    [verifyAuth.fulfilled]: (state, action) => {
      state.status = action.payload?.status;
      state.message = action.payload?.message;
      state.user = action.payload.data?.user;
      state.token = action.payload.data?.accessToken;
      state.authorized = true;
    },
    [verifyAuth.rejected]: (state, action) => {
      state.user = null;
      state.token = null;
      state.authorized = false;
    },
    [getAccessToken.fulfilled]: (state, action) => {
      state.status = action.payload?.status;
      state.message = action.payload?.message;
      state.user = action.payload.data?.user;
      state.token = action.payload.data?.accessToken;
    },
    [forgotPassword.fulfilled]: (state, action) => {
      state.status = action.payload?.status;
      state.message = action.payload?.message;
    },
    [resetPassword.fulfilled]: (state, action) => {
      state.status = action.payload?.status;
      state.message = action.payload?.message;
    },
    [setPassword.fulfilled]: (state, action) => {
      state.status = action.payload?.status;
      state.message = action.payload?.message;
    },
    [updateUser.fulfilled]: (state, action) => {
      state.status = action.payload?.status;
      state.profileMessage = action.payload?.message;
      state.user = action.payload.data?.user;
    },
    [updatePassword.fulfilled]: (state, action) => {
      state.status = action.payload?.status;
      state.profileMessage = action.payload?.message;
    },
    [logoutUser.fulfilled]: (state, action) => {
      state.status = false;
      state.message = "";
      state.profileMessage = "";
      state.user = null;
      state.token = null;
      state.authorized = false;
    },
  },
});

const { actions, reducer } = authSlice;

export const { logout, saveUser, updateMessage, updateProfileMessage, updateStatus } = actions;

export default reducer;
