import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../../../api/finance";

export const getAllCards = createAsyncThunk(
  "finance/getAllCards",
  async ({ token }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.getAllCards({ config });
    return response.data;
  }
);

export const addCard = createAsyncThunk(
  "finance/addCard",
  async ({ data, token }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.addCard({ data, config });
    return response.data;
  }
);

export const getCard = createAsyncThunk(
  "finance/getCard",
  async ({ token, id }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.getCard({ config, id });
    return response.data;
  }
);

export const updateCard = createAsyncThunk(
  "finance/updateCard",
  async ({ data, token, id }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.updateCard({ data, config, id });
    return response.data;
  }
);

export const deleteCard = createAsyncThunk(
  "finance/deleteCard",
  async ({ token, id }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.deleteCard({ config, id });
    return response.data;
  }
);

export const getTaxInfo = createAsyncThunk(
  "finance/getTaxInfo",
  async ({ token }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.getTaxInfo({ config });
    return response.data;
  }
);

export const saveTaxInfo = createAsyncThunk(
  "finance/saveTaxInfo",
  async ({ data, token }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.saveTaxInfo({ data, config });
    return response.data;
  }
);

export const saveVAT_GST = createAsyncThunk(
  "finance/saveVAT_GST",
  async ({ data, token }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.saveVAT_GST({ data, config });
    return response.data;
  }
);

export const getAllInvoices = createAsyncThunk(
  "finance/getAllInvoices",
  async ({ token, page }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.getAllInvoices({ config, page });
    return response.data;
  }
);

export const getInvoice = createAsyncThunk(
  "finance/getInvoice",
  async ({ token, id }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.getInvoice({ config, id });
    return response.data;
  }
);

const initialState = {
  status: null,
  message: "",
  statusAllCards: null,
  messageAllCards: "",
  statusGetCard: null,
  messageGetCard: "",
  numberOfCards: 0,
  cards: [],
  card: null,
  taxInfo: null,
  statusTaxInfo: null,
  messageTaxInfo: "",
  statusVatGst: null,
  messageVatGst: "",
  numberOfInvoices: 0,
  invoices: [],
  statusAllInvoices: null,
  messageAllInvoices: "",
  invoice: null,
  statusInvoice: null,
  messageInvoice: "",
};

const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    updateStatus: (state, action) => {
      state.status = null;
    },
    updateMessage: (state, action) => {
      state.message = "";
    },
    updateStatusAllCards: (state, action) => {
      state.statusAllCards = null;
    },
    updateMessageAllCards: (state, action) => {
      state.messageAllCards = "";
    },
    updateStatusGetCard: (state, action) => {
      state.statusGetCard = null;
    },
    updateMessageGetCard: (state, action) => {
      state.messageGetCard = "";
    },
    updateCardToNull: (state, action) => {
      state.card = null;
    },
    updateStatusTaxInfo: (state, action) => {
      state.statusTaxInfo = null;
    },
    updateMessageTaxInfo: (state, action) => {
      state.messageTaxInfo = "";
    },
    updateStatusVatGst: (state, action) => {
      state.statusVatGst = null;
    },
    updateMessageVatGst: (state, action) => {
      state.messageVatGst = "";
    },
    updateStatusInvoice: (state, action) => {
      state.statusInvoice = null;
    },
    updateMessageInvoice: (state, action) => {
      state.messageInvoice = "";
    },
    updateInvoice: (state, action) => {
      state.invoice = null;
    },
  },
  extraReducers: {
    [getAllCards.fulfilled]: (state, action) => {
      state.statusAllCards = action.payload?.status;
      state.messageAllCards = action.payload?.message;
      state.cards = action.payload.data?.cards ?? [];
      state.numberOfCards = action.payload.data?.numberOfCards ?? 0;
    },
    [addCard.fulfilled]: (state, action) => {
      state.status = action.payload?.status;
      state.message = action.payload?.message;
      const newCard = action.payload.data?.card;
      if (newCard) {
        state.cards.push(newCard);
      }
    },
    [getCard.fulfilled]: (state, action) => {
      state.statusGetCard = action.payload?.status;
      state.messageGetCard = action.payload?.message;
      state.card = action.payload.data?.card;
    },
    [updateCard.fulfilled]: (state, action) => {
      state.status = action.payload?.status;
      state.message = action.payload?.message;
      const updatedCard = action.payload.data?.card;
      if (updateCard) {
        state.cards = state.cards.map((card) => {
          if (card.id === updatedCard.id) {
            return updatedCard;
          } else {
            return card;
          }
        });
      }
    },
    [deleteCard.fulfilled]: (state, action) => {
      state.status = action.payload?.status;
      state.message = action.payload?.message;
      const deletedCard = action.payload.data?.card;
      state.cards = state.cards.filter((card) => card.id !== deletedCard.id);
      if(action.payload.data?.newDefaultCardId){
        let cards = [...state.cards];
        const newDefaultCardId = action.payload.data?.newDefaultCardId;
        cards = cards.map((card) => {
          if( card.id === newDefaultCardId){
            card.isDefault = true;
          }
          return card;
        });
        if (cards.length > 1) {
          const defaultCardIndex = cards.findIndex(
            (card) => card.id === newDefaultCardId
          );
          if (defaultCardIndex !== 0) {
            const defaultCard = cards.find(
              (card) => card.id === newDefaultCardId
            );
            cards.splice(defaultCardIndex, 1);
            cards.unshift(defaultCard);
          }
        }
        state.cards = cards;
      }
    },
    [getTaxInfo.fulfilled]: (state, action) => {
      state.taxInfo = action.payload.data?.taxInfo;
    },
    [saveTaxInfo.fulfilled]: (state, action) => {
      state.statusTaxInfo = action.payload?.status;
      state.messageTaxInfo = action.payload?.message;
      const newTaxInfo = {...state.taxInfo};
      newTaxInfo.name = action.payload.data?.taxInfo.name;
      newTaxInfo.address_line_one = action.payload.data?.taxInfo.address_line_one;
      newTaxInfo.address_line_two = action.payload.data?.taxInfo.address_line_two;
      state.taxInfo = newTaxInfo;
    },
    [saveVAT_GST.fulfilled]: (state, action) => {
      state.statusVatGst = action.payload?.status;
      state.messageVatGst = action.payload?.message;
      const newTaxInfo = {...state.taxInfo};
      newTaxInfo.vat_gst = action.payload.data?.taxInfo.vat_gst;
      state.taxInfo = newTaxInfo;
    },
    [getAllInvoices.fulfilled]: (state, action) => {
      state.statusAllInvoices = action.payload?.status;
      state.messageAllInvoices = action.payload?.message;
      state.invoices = action.payload.data?.invoices ?? [];
      state.numberOfInvoices = action.payload.data?.numberOfInvoices ?? 0;
    },
    [getInvoice.fulfilled]: (state, action) => {
      state.statusInvoice = action.payload?.status;
      state.messageInvoice = action.payload?.message;
      state.invoice = action.payload.data?.invoice;
    },
  },
});

const { actions, reducer } = financeSlice;

export const {
  updateStatus,
  updateMessage,
  updateStatusAllCards,
  updateMessageAllCards,
  updateStatusGetCard,
  updateMessageGetCard,
  updateCardToNull,
  updateStatusTaxInfo,
  updateMessageTaxInfo,
  updateStatusVatGst,
  updateMessageVatGst,
  updateStatusInvoice,
  updateMessageInvoice,
  updateInvoice
} = actions;

export default reducer;
