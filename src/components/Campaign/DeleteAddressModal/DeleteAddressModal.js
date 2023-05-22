import cns from "classnames";
import { useRef } from "react";
import { CloseIcon } from "@assets/images/sidebar";
import styles from "./DeleteAddressModal.module.scss";

const DeleteAddressModal = ({
  setShowModal,
  id,
  confirmDelCampaign,
  showModal,
  address,
  deleteAddres,
}) => {
  const modal = useRef(null);
  return (
    <>
      {showModal && (
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
              Are you sure you want to delete <br />
              Address {`${id}`} {`(${address})`}?
            </p>
            <div className={cns(styles.buttonBox)}>
              <button
                type="button"
                onClick={() => {
                  deleteAddres();
                  setShowModal(false);
                }}
              >
                Yes
              </button>
              <button
                className={cns(styles.noButton)}
                type="button"
                onClick={() => {
                  setShowModal(false);
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteAddressModal;
