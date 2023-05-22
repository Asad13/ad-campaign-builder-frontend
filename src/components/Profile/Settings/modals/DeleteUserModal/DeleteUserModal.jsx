import cns from "classnames";
import { useRef } from "react";
import { CloseIcon } from "@assets/images/sidebar";
import styles from "./DeleteUserModal.module.scss";

const DeleteUserModal = ({ setShowModal, id, setDeleteUserId, confirmDeleteUser }) => {
  const modal = useRef(null);
  return (
    <div
      className={cns("modalContainer")}
      onClick={(event) => {
        if (modal.current && !modal.current.contains(event.target)) {
          setDeleteUserId(null);
          setShowModal(false);
        }
      }}
    >
      <div className={cns(styles.modal)} ref={modal}>
        <div className={cns(styles.icon)}>
          <span
            onClick={() => {
              setDeleteUserId(null);
              setShowModal(false);
            }}
          >
            <CloseIcon />
          </span>
        </div>
        <p className={cns("heading3")}>
          Are you sure you want to delete this user. This actions cannot be
          undone!
        </p>
        <div>
          <button
            type="button"
            onClick={() => {
              confirmDeleteUser(id);
              setDeleteUserId(null);
              setShowModal(false);
            }}
          >
            Yes
          </button>
          <button
            className={cns(styles.noBtn)}
            type="button"
            onClick={() => {
              setDeleteUserId(null);
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

export default DeleteUserModal;
