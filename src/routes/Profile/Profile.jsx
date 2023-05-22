import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";
import SideBar from "@components/Layout/SideBar";
import {
  ProfileIcon,
  BillingIcon,
  HistoryIcon,
  PasswordIcon,
  SettingsIcon,
} from "@assets/images/sidebar/profile";

const sideNavItems = [
  {
    value: "Profile",
    path: "/profile",
    icon: ProfileIcon,
    isHash: false,
    adminOnly: false
  },
  {
    value: "Admin Settings",
    path: "/profile/settings",
    icon: SettingsIcon,
    isHash: false,
    adminOnly: true
  },
  {
    value: "Billing",
    path: "/profile/billing",
    icon: BillingIcon,
    isHash: false,
    adminOnly: true
  },
  {
    value: "Purchase History",
    path: "/profile/purchase-history",
    icon: HistoryIcon,
    isHash: false,
    adminOnly: true
  },
  {
    value: "Password",
    path: "/profile/password",
    icon: PasswordIcon,
    isHash: false,
    adminOnly: false
  },
];

const Profile = () => {
  return (
    <>
      <Helmet>
        <title>Campaign Builder - Profile</title>
      </Helmet>
      <div style={{ paddingLeft: "85px", paddingTop:'120px', paddingBottom: '50px' }}>
        <SideBar sideNavItems={sideNavItems} isHash={false} />
        <Outlet />
      </div>
    </>
  );
};

export default Profile;
