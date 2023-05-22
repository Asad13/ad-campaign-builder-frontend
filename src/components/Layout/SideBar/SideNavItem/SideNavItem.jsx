import cns from "classnames";
import { Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import ReactTooltip from "react-tooltip";
import styles from "../SideBar.module.scss";

const SideNavItem = ({ value, path, Icon, expanded, isHash }) => {
  const location = useLocation();

  if (isHash) {
    return (
      <HashLink
        to={path}
        smooth
        scroll={(el) =>
          el.scrollIntoView({ behavior: "smooth", block: "start" })
        }
        className={cns(
          styles.iconContainer,
          (location.hash === path) ? styles.active : ""
        )}
      >
        <span className={cns(styles.icon)} data-tip={value}>
          <Icon />
        </span>
        {!expanded && (
          <ReactTooltip
            place="right"
            effect="solid"
            textColor={styles.white}
            backgroundColor={styles.backgroundColor}
          />
        )}
        <span className={cns(styles.value)}>{value}</span>
      </HashLink>
    );
  } else {
    return (
      <Link
        to={path}
        className={cns(
          styles.iconContainer,
          location.pathname === path ? styles.active : ""
        )}
      >
        <span className={cns(styles.icon)} data-tip={value}>
          <Icon />
        </span>
        {!expanded && (
          <ReactTooltip
            place="right"
            effect="solid"
            textColor={styles.white}
            backgroundColor={styles.backgroundColor}
          />
        )}
        <span className={cns(styles.value)}>{value}</span>
      </Link>
    );
  }
};

export default SideNavItem;
