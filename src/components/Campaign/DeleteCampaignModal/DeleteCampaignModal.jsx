import cns from "classnames";
import { useRef } from "react";
import { CloseIcon } from "@assets/images/sidebar";
import styles from "./DeleteCampaignModal.module.scss";

const DeleteCampaignModal = ({ setShowModal, id, confirmDelCampaign }) => {
  const modal = useRef(null);
  return (
    <div
      className={cns("modalContainer")}
      onClick={(event) => {
        if (modal.current && !modal.current.contains(event.target)) {
          setShowModal(false);
        }
      }}
    >
      <div className={cns(styles.modal)} ref={modal}>
        <div className={cns(styles.icon)}>
          <span
            onClick={() => {
              setShowModal(false);
            }}
          >
            <CloseIcon />
          </span>
        </div>
        <p className={cns("heading3")}>
          Do you want to delete campaign {`${id}`} permanently ?
        </p>
        <button
          type="button"
          onClick={() => {
            confirmDelCampaign();
            setShowModal(false);
          }}
        >
          Delete Campaign
        </button>
      </div>
    </div>
  );
};

export default DeleteCampaignModal;