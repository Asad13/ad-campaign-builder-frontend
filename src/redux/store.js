import { configureStore } from "@reduxjs/toolkit";
import auth from "./features/auth/authSlice";
import campaign from "./features/campaign/campaignSlice";
import user from "./features/user/userSlice";
import finance from "./features/finance/financeSlice";

export const store = configureStore({
  reducer: {
    auth,
    campaign,
    user,
    finance
  },
});
