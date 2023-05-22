import cns from "classnames";
import { useRef } from "react";
import { CloseIcon } from "@assets/images/sidebar";
import styles from "./DeleteCardModal.module.scss";

const DeleteCardModal = ({ setShowModal, id, setDeleteCardId, confirmDeleteCard }) => {
  const modal = useRef(null);
  return (
    <div
      className={cns("modalContainer")}
      onClick={(event) => {
        if (modal.current && !modal.current.contains(event.target)) {
          setDeleteCardId(null);
          setShowModal(false);
        }
      }}
    >
      <div className={cns(styles.modal)} ref={modal}>
        <div className={cns(styles.icon)}>
          <span
            onClick={() => {
              setDeleteCardId(null);
              setShowModal(false);
            }}
          >
            <CloseIcon />
          </span>
        </div>
        <p className={cns("heading3")}>
          Are you sure you want to delete this card ? This actions cannot be
          undone!
        </p>
        <div>
          <button
            type="button"
            onClick={() => {
              confirmDeleteCard(id);
              setDeleteCardId(null);
              setShowModal(false);
            }}
          >
            Yes
          </button>
          <button
            className={cns(styles.noBtn)}
            type="button"
            onClick={() => {
              setDeleteCardId(null);
              setShowModal(false);
            }}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCardModal;
