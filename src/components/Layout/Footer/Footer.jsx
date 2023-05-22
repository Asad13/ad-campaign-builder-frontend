import React from "react";
import styles from "./Footer.module.scss";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const shrink = location.pathname.includes('profile') || location.pathname.includes('campaigns/new');
  let width = shrink ? window.screen.width - 100 : window.screen.width;
  return (
    <footer className={styles.footer} style={{
      marginLeft: shrink ? '0' : null,border: "1px solid #ffffff"}}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.col}>
            <div>
              <a href="https://buzzier.com">
                <img
                  className={styles.logoSmall}
                  src="/img/flash.png"
                  alt="Buzzier"
                />
              </a>
              <p>
                Turn any TV or Display into a digital billboard connected to the
                world of advertisers.
              </p>
            </div>
          </div>

          <div className={styles.col}>
            <div className={styles.title}>Contributors</div>
            <ul>
              <a href="https://buzzier.com">Media Partner</a>
              <Link to="/">Device Partners</Link>
              <Link to="/">Advertisers</Link>
              <a href="https://buzzier.com/analytics">Data Analytics</a>
            </ul>
          </div>

          <div className={styles.col}>
            <div className={styles.title}>Company</div>
            <ul>
              <a href="https://buzzier.com/what">About Us</a>
              <a href="https://buzzier.com/invest" className={styles.invest}>
                Invest
              </a>
              <a href="https://buzzier.com/contact">Contact</a>
            </ul>
          </div>

          <div className={styles.col}>
            <div className={styles.title}>Resources</div>
            <ul>
              <Link to={`/`}>Ad Builder</Link>
              <a
                target="_blank"
                href="https://help.buzzier.com"
                rel="noreferrer noopener"
              >
                Help Center
              </a>
              <a
                target="_blank"
                href="https://help.buzzier.com"
                rel="noreferrer noopener"
              >
                Tutorials
              </a>
              <a
                target="_blank"
                href="https://help.buzzier.com"
                rel="noreferrer noopener"
              >
                Support
              </a>
            </ul>
          </div>

          <div className={styles.col}>
            <div className={styles.title}>Legal</div>
            <ul>
              <a href="https://buzzier.com/terms">Terms</a>
              <a href="https://buzzier.com/privacy">Privacy</a>
              <a href="https://buzzier.com/billing">Billing</a>
            </ul>
          </div>
        </div>
        <div className={styles.copy}>© 2022 FlowSMB. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;
