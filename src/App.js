import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyAuth } from "./redux/features/auth/authSlice";
import Layout from "./components/Layout";
import Signup from "./routes/Auth/Signup";
import Login from "./routes/Auth/Login";
import ForgotPassword from "./routes/Auth/ForgotPassword";
import ResetPassword from "./routes/Auth/ResetPassword";
import SetPassword from "./routes/Auth/SetPassword";
import ConfirmEmail from "./routes/Auth/ConfirmEmail";
import ResetPasswordEmail from "./routes/Auth/ResetPasswordEmail";
import Profile from "./routes/Profile";
import ProfileRoot from "./components/Profile/ProfileRoot";
import Billing from "./components/Profile/Billing";
import Card from "./components/Profile/Card";
import Password from "./components/Profile/Password";
import PurchaseHistory from "./components/Profile/PurchaseHistory";
import Settings from "./components/Profile/Settings";
import Campaign from "./routes/Campaign";
import NewCampaign from "./components/Campaign/NewCampaign";
import EditCampaign from "./components/Campaign/EditCampaign";
import AllCampaigns from "./components/Campaign/AllCampaigns";
import Creatives from "./routes/Creatives";
import Dashboard from "./routes/Dashboard";
import Loader from "./components/UI/Loader";
import ScrollToTop from "./components/Utils/ScrollToTop";
import Token from "./components/Utils/Token";
import {
  ACCESS_FETCH_INTERVAL,
  USER_ROLE_ADMIN,
  USER_ROLE_CREATOR,
} from "@config/constants";

function App() {
  const { user, token, authorized } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [task, setTask] = useState(null);

  useEffect(() => {
    if (!authorized) {
      dispatch(verifyAuth());
    }

    if (authorized === true) {
      setTask(
        setInterval(() => {
          dispatch(verifyAuth());
        }, ACCESS_FETCH_INTERVAL)
      );
    }

    if (authorized === false && task > 0) {
      clearInterval(task);
      setTask(null);
    }
  }, [task]);

  if (authorized === null) {
    return (
      <div className="pageLoaderContainer">
        <Loader />
      </div>
    );
  }

  let routes = null;

  if (authorized) {
    if (user?.role === USER_ROLE_ADMIN) {
      routes = (
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/campaigns" />} // Needs to be updated Later
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/creatives" element={<Creatives />} />
          <Route path="/campaigns" element={<Campaign />}>
            <Route index element={<AllCampaigns />} />
            <Route path="new" element={<NewCampaign />} />
            <Route path=":id" element={<EditCampaign />} />
          </Route>
          <Route path="/profile" element={<Profile />}>
            <Route index element={<ProfileRoot />} />
            <Route path="settings" element={<Settings />} />
            <Route path="billing" element={<Billing />} />
            <Route path="add-card" element={<Card />} />
            <Route path="edit-card/:id" element={<Card />} />
            <Route path="purchase-history" element={<PurchaseHistory />} />
            <Route path="password" element={<Password />} />
          </Route>
          <Route
            path="/notifications"
            element={
              <h1 className="tw-text-blue-700 tw-ml-24">Notifications</h1>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      );
    } else if (user?.role === USER_ROLE_CREATOR) {
      routes = (
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/campaigns" />} // Needs to be updated Later
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/creatives" element={<Creatives />} />
          <Route path="/campaigns" element={<Campaign />}>
            <Route index element={<AllCampaigns />} />
            <Route path="new" element={<NewCampaign />} />
            <Route path=":id" element={<EditCampaign />} />
          </Route>
          <Route path="/profile" element={<Profile />}>
            <Route index element={<ProfileRoot />} />
            <Route path="password" element={<Password />} />
          </Route>
          <Route
            path="/notifications"
            element={
              <h1 className="tw-text-blue-700 tw-ml-24">Notifications</h1>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      );
    }
  } else {
    routes = (
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/set-password/:token" element={<SetPassword />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/reset-password-email" element={<ResetPasswordEmail />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }
  return (
    <>
      <ScrollToTop />
      <Layout user={user} token={token}>
        {token && <Token />}
        {routes}
      </Layout>
    </>
  );
}

export default App;
