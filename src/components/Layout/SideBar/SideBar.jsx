import cns from "classnames";
import { useState } from "react";
import { useSelector } from "react-redux";
import styles from "./SideBar.module.scss";
import SideNavItem from "./SideNavItem";
import { HambergerIcon, CloseIcon } from "@assets/images/sidebar";

const SideBar = ({ sideNavItems }) => {
  const { user } = useSelector((state) => state.auth);

  const [expanded, setExpanded] = useState(false);

  const handleSidebar = () => {
    setExpanded(!expanded);
  };

  let navItems = sideNavItems;

  if (user.role !== "admin") {
    navItems = navItems.filter((navItem) => !navItem?.adminOnly);
  }

  return (
    <>
      <div className={cns(styles.sidebar, expanded ? styles.expanded : "")}>
        {/* <div
          className={cns(styles.iconContainer, styles.menu)}
          onClick={handleSidebar}
        >
          <span className={cns(styles.icon)}>
            {expanded ? <CloseIcon /> : <HambergerIcon />}
          </span>
          <span className={cns(styles.value)}>Hide Menu</span>
        </div> */}
        {navItems.map((item, index) => (
          <SideNavItem
            key={index}
            value={item?.value}
            path={item?.path}
            Icon={item?.icon}
            expanded={expanded}
            isHash={item.isHash}
          />
        ))}
      </div>
    </>
  );
};

export default SideBar;
