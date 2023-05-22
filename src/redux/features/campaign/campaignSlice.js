import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../../../api/campaign";

export const getAllCampaigns = createAsyncThunk(
  "campaign/getAllCampaigns",
  async ({ token, page }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.getAllCampaigns({ config, page });
    return response.data;
  }
);

export const getCampaign = createAsyncThunk(
  "campaign/getCampaign",
  async ({ token, id }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.getCampaign({ config, id });
    return response.data;
  }
);

export const createCampaign = createAsyncThunk(
  "campaign/createCampaign",
  async ({ formData, token }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.createCampaign({ formData, config });
    return response.data;
  }
);

export const updateCampaign = createAsyncThunk(
  "campaign/updateCampaign",
  async ({ formData, token, id }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.updateCampaign({ formData, config, id });
    return response.data;
  }
);

export const deleteCampaign = createAsyncThunk(
  "campaign/deleteCampaign",
  async ({ token, id }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.deleteCampaign({ config, id });
    return response.data;
  }
);

const initialState = {
  statusNewCampaign: null,
  messageNewCampaign: "",
  statusAllCampaigns: null,
  messageAllCampaigns: "",
  numberOfCampaigns: 0,
  campaigns: [],
  campaign: null,
  statusEditCampaign: null,
  messageEditCampaign: "",
  statusDeleteCampaign: null,
  messageDeleteCampaign: "",
};

const campaignSlice = createSlice({
  name: "campaign",
  initialState,
  reducers: {
    updateMessageNewCampaign: (state, action) => {
      state.messageNewCampaign = "";
    },
    updateStatusNewCampaign: (state, action) => {
      state.statusNewCampaign = null;
    },
    updateMessageEditCampaign: (state, action) => {
      state.messageEditCampaign = "";
    },
    updateStatusEditCampaign: (state, action) => {
      state.statusEditCampaign = null;
    },
    updateMessageDeleteCampaign: (state, action) => {
      state.messageDeleteCampaign = "";
    },
    updateStatusDeleteCampaign: (state, action) => {
      state.statusDeleteCampaign = null;
    },
    deselectCampaign: (state, action) => {
      state.campaign = null;
    },
  },
  extraReducers: {
    [getAllCampaigns.fulfilled]: (state, action) => {
      state.statusAllCampaigns = action.payload?.status;
      state.messageAllCampaigns = action.payload?.message;
      state.campaigns = action.payload.data?.campaigns ?? [];
      state.numberOfCampaigns = action.payload.data?.numberOfCampaigns ?? 0;
    },
    [getCampaign.fulfilled]: (state, action) => {
      state.campaign = action.payload.data?.campaign;
    },
    [createCampaign.fulfilled]: (state, action) => {
      state.statusNewCampaign = action.payload?.status;
      state.messageNewCampaign = action.payload?.message;
    },
    [updateCampaign.fulfilled]: (state, action) => {
      state.statusEditCampaign = action.payload?.status;
      state.messageEditCampaign = action.payload?.message;
      state.campaign = action.payload.data?.campaign ?? null;
    },
    [deleteCampaign.fulfilled]: (state, action) => {
      state.statusEditCampaign = null;
      state.messageEditCampaign = "";
      state.campaign = null;
      state.statusDeleteCampaign = action.payload?.status;
      state.messageDeleteCampaign = action.payload?.message;
    },
  },
});

const { actions, reducer } = campaignSlice;

export const {
  updateMessageNewCampaign,
  updateStatusNewCampaign,
  updateMessageEditCampaign,
  updateStatusEditCampaign,
  updateMessageDeleteCampaign,
  updateStatusDeleteCampaign,
  deselectCampaign
} = actions;

export default reducer;
