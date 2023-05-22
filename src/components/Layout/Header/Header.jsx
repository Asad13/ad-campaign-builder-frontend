import cns from "classnames";
import { throttle } from "lodash";
import styles from "./Header.module.scss";
import { observer } from "mobx-react-lite";
import logo from "../../../assets/images/logo.png";
import { UiStoreContext } from "../../../store";
import { Link, useLocation } from "react-router-dom";
import { useEventListener, useOnClickOutside, useWindowSize } from "@hooks";
import { useDispatch } from "react-redux";
import { logoutUser } from "@redux/features/auth/authSlice";
import Avatar from "@assets/images/profile/avatar.png";
import {
  NotificationsIcon,
  HelpIcon,
  LogoutIcon,
} from "../../../assets/images/topbar";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const Header = observer(({ user, token, className }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);

  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const uiContext = useContext(UiStoreContext);

  useEffect(() => {
    if (uiContext.scrolled && !scrolled) {
      setScrolled(true);
      document.body.classList.add("scrolled");
    } else if (!uiContext.scrolled && scrolled) {
      setScrolled(false);
      document.body.classList.remove("scrolled");
    }
  }, [uiContext.scrolled]);

  const handleScroll = useCallback(
    throttle(() => {
      const startStickyAt = 0;

      if (window.scrollY > startStickyAt || uiContext.scrolled) {
        if (!scrolled) {
          setScrolled(true);
          document.body.classList.add("scrolled");
        }
      } else {
        if (scrolled) {
          setScrolled(false);
          document.body.classList.remove("scrolled");
        }
      }
    }, 100),
    [scrolled, setScrolled, width]
  );

  useEventListener("scroll", handleScroll);

  useOnClickOutside(
    menuRef,
    useCallback(() => {
      setMenuOpened(false);
    }, [setMenuOpened])
  );

  return (
    <>
      <header className={cns(styles.header, className)} ref={headerRef}>
        <div>
          <div className={styles.wrapper}>
            <div className={cns(styles.left)}>
              <Link to="/" className={styles.logo}>
                <img src={logo} alt="CB" />
              </Link>
              <div className={styles.lineVertical} />
              <div className={styles.cta}>
                <Link
                  to="/dashboard"
                  className={cns(
                    location.pathname === "/dashboard" ? styles.active : ""
                  )}
                >
                  <i>Dashboard</i>
                </Link>
                <Link
                  to="/creatives"
                  className={cns(
                    location.pathname === "/creatives" ? styles.active : ""
                  )}
                >
                  <i>Creatives</i>
                </Link>
                <Link
                  to="/campaigns"
                  className={cns(
                    location.pathname === "/campaigns" ? styles.active : ""
                  )}
                >
                  <i>Campaigns</i>
                </Link>
                <Link
                  to="/notifications"
                  className={cns(
                    location.pathname === "/notifications" ? styles.active : "",
                    styles.notifications,
                    styles.icon
                  )}
                >
                  <i>
                    <NotificationsIcon />
                    <span>10</span>
                  </i>
                </Link>
              </div>
            </div>
            <div className={cns(styles.cta, styles.ctaRight)}>
              <a href="https://help.buzzier.com/" className={cns(styles.icon)}>
                <i>
                  <HelpIcon />
                </i>
              </a>
              <Link to="/profile" className={cns(styles.profile)}>
                <i>
                  <span
                    className={cns("profileImage", styles.headerProfileImage)}
                  >
                    <img
                      src={user?.imageUrl ? user.imageUrl : Avatar}
                      alt={user?.name || "Owner"}
                    />
                  </span>
                  <span className={cns(styles.name)}>
                    <i>{user?.name?.split(" ")[0] || "Owner"}</i>{" "}
                    {user?.name?.split(" ")[1] ? user?.name?.split(" ")[1] : user?.name ? "" : "Name"}
                  </span>
                </i>
              </Link>
              <span
                className={cns(styles.logout, styles.icon)}
                onClick={() => dispatch(logoutUser(token))}
              >
                <LogoutIcon />
              </span>
            </div>

            {/* <div className={styles.hamburger}>
              <div
                className={cns("hamburger", menuOpened && "is-active")}
                onClick={() => setMenuOpened(!menuOpened)}
              >
                <span />
                <span />
                <span />
              </div>
            </div> */}
          </div>
        </div>
      </header>

      {/* <div className={cns(styles.menu, menuOpened && styles._active)}>
        <div className={styles.menuWrapper} ref={menuRef}>
          <div
            className={cns("hamburger", menuOpened && "is-active")}
            onClick={() => setMenuOpened(!menuOpened)}
          >
            <span />
            <span />
            <span />
          </div>
          <Link
            to="/"
            onClick={() => setMenuOpened(!menuOpened)}
            className={styles.logo}
          >
            <img src={logo} alt="Flow SMB" />
          </Link>
          <div className={styles.menuCta}>
            <Link
              onClick={() => setMenuOpened(!menuOpened)}
              to="/dashboard"
              className={cns(
                location.pathname === "/dashboard" ? styles.active : ""
              )}
            >
              <i>Dashboard</i>
            </Link>
            <Link
              onClick={() => setMenuOpened(!menuOpened)}
              to="/creatives"
              className={cns(
                location.pathname === "/creatives" ? styles.active : ""
              )}
            >
              <i>Creatives</i>
            </Link>
            <Link
              onClick={() => setMenuOpened(!menuOpened)}
              to="/campaigns"
              className={cns(
                location.pathname === "/campaigns" ? styles.active : ""
              )}
            >
              <i>Campaigns</i>
            </Link>
          </div>
        </div>
      </div> */}
    </>
  );
});

export default Header;
