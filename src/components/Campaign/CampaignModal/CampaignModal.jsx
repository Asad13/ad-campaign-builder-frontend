import cns from "classnames";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CloseIcon } from "@assets/images/sidebar";
import styles from "./CampaignModal.module.scss";

const CampaignModal = ({ type, modalText, setShowModal, resetAll }) => {
  const navigate = useNavigate();
  const modal = useRef(null);
  return (
    <div
      className={cns("modalContainer")}
      onClick={(event) => {
        if (modal.current && !modal.current.contains(event.target)) {
          if(type !== "edit"){
            resetAll();
          }
          setShowModal(false);
        }
      }}
    >
      <div className={cns(styles.modal)} ref={modal}>
        <div className={cns(styles.icon)}>
          <span
            onClick={() => {
              if(type !== "edit"){
                resetAll();
              }
              setShowModal(false);
            }}
          >
            <CloseIcon />
          </span>
        </div>
        <h3 className={cns("heading3")}>Thank you so much!</h3>
        <p className={cns("heading3")}>
          {modalText}
        </p>
        <button
          type="button"
          onClick={() => {
            resetAll();
            navigate("/campaigns");
          }}
        >
          Go To Campaigns
        </button>
      </div>
    </div>
  );
};

export default CampaignModal;
