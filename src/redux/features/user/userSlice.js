import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../../../api/user";

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async ({ token, path }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.getAllUsers({ config, path });
    return response.data;
  }
);

export const getRoles = createAsyncThunk(
  "user/getRoles",
  async ({ token }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.getRoles({ config });
    return response.data;
  }
);

export const inviteUser = createAsyncThunk(
  "user/inviteUser",
  async ({ data, token }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.inviteUser({ data, config });
    return response.data;
  }
);


export const resendInvite = createAsyncThunk(
  "user/resendInvite",
  async ({ data , token }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.resendInvite({ data , config });
    return response.data;
  }
);

export const updateUserRole = createAsyncThunk(
  "user/updateUserRole",
  async ({ data, token, id }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.updateUserRole({ data, config, id });
    return response.data;
  }
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async ({ token, id }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.deleteUser({ config, id });
    return response.data;
  }
);

const initialState = {
  statusAllUsers: null,
  messageAllUsers: "",
  statusDeleteUser: null,
  messageDeleteUser: "",
  statusUpdateUserRole: null,
  messageUpdateUserRole: "",
  statusSendInvite: null,
  messageSendInvite: "",
  statusResendInvite: null,
  messageResendInvite: "",
  numberOfUsers: 0,
  roles: null,
  users: [],
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    updateMessageAllUsers: (state, action) => {
      state.messageAllUsers = "";
    },
    updateStatusAllUsers: (state, action) => {
      state.statusAllUsers = null;
    },
    updateMessageDeleteUser: (state, action) => {
      state.messageDeleteUser = "";
    },
    updateStatusDeleteUser: (state, action) => {
      state.statusDeleteUser = null;
    },
    updateMessageUpdateUserRole: (state, action) => {
      state.messageUpdateUserRole = "";
    },
    updateStatusUpdateUserRole: (state, action) => {
      state.statusUpdateUserRole = null;
    },
    updateMessageSendInvite: (state, action) => {
      state.messageSendInvite = "";
    },
    updateStatusSendInvite: (state, action) => {
      state.statusSendInvite = null;
    },
    updateMessageResendInvite: (state, action) => {
      state.messageResendInvite = "";
    },
    updateStatusResendInvite: (state, action) => {
      state.statusResendInvite = null;
    },
  },
  extraReducers: {
    [getAllUsers.fulfilled]: (state, action) => {
      state.statusAllUsers = action.payload?.status;
      state.messageAllUsers = action.payload?.message;
      state.users = action.payload.data?.users ?? [];
      state.numberOfUsers = action.payload.data?.numberOfUsers ?? 0;
    },
    [getRoles.fulfilled]: (state, action) => {
      state.roles = action.payload.data?.roles ?? [];
    },
    [updateUserRole.fulfilled]: (state, action) => {
      state.statusUpdateUserRole = action.payload?.status;
      state.messageUpdateUserRole = action.payload?.message;
      const updatedUser = action.payload.data?.user;

      state.users = state.users.map(user => {
        if(user.id === updatedUser.id){
          user.role_id = updatedUser.role_id;
          return user;
        }else{
          return user;
        }
      })
    },
    [inviteUser.fulfilled]: (state, action) => {
      state.statusSendInvite = action.payload?.status;
      state.messageSendInvite = action.payload?.message;
      const newUser = action.payload.data?.user;
      state.numberOfUsers = action.payload.data?.numberOfUsers ?? state.numberOfUsers + 1;
      if(newUser){
        if(state.users.length <= 1){
          state.users.push(newUser);
        }else{
          state.users.splice(1, 0, newUser);
        }
      }
      if(state.users.length > 3){
        state.users.pop();
      }
    },
    [resendInvite.fulfilled]: (state, action) => {
      state.statusResendInvite = action.payload?.status;
      state.messageResendInvite = action.payload?.message;
    },
    [deleteUser.fulfilled]: (state, action) => {
      state.statusDeleteUser = action.payload?.status;
      state.messageDeleteUser = action.payload?.message;
      const deletedUser = action.payload.data?.user;
      state.numberOfUsers = action.payload.data?.numberOfUsers ?? state.numberOfUsers - 1;
      state.users = state.users.filter(user => user.id !== deletedUser.id);
    },
  },
});

const { actions, reducer } = profileSlice;

export const {
  updateMessageAllUsers,
  updateStatusAllUsers,
  updateMessageDeleteUser,
  updateStatusDeleteUser,
  updateMessageUpdateUserRole,
  updateStatusUpdateUserRole,
  updateMessageSendInvite,
  updateStatusSendInvite,
  updateMessageResendInvite,
  updateStatusResendInvite,
} = actions;

export default reducer;
