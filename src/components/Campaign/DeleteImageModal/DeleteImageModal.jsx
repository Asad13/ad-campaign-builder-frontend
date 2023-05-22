import cns from "classnames";
import { useRef } from "react";
import { CloseIcon } from "@assets/images/sidebar";
import styles from "./DeleteImageModal.module.scss";

function shortenFileName(name) {
  if (name.length > 30) {
    const extDotIndex = name.lastIndexOf(".");
    return name.substring(0, 27) + "..." + name.substring(extDotIndex - 3);
  }
  return name;
}

const DeleteImageModal = ({ setShowModal, creative, id, setCreativeDeleteId, confirmDeleteCreative }) => {
  const modal = useRef(null);
  return (
    <div
      className={cns("modalContainer")}
      onClick={(event) => {
        if (modal.current && !modal.current.contains(event.target)) {
          setShowModal(false);
          setCreativeDeleteId(null);
        }
      }}
    >
      <div className={cns(styles.modal)} ref={modal}>
        <div className={cns(styles.icon)}>
          <span
            onClick={() => {
              setShowModal(false);
              setCreativeDeleteId(null);
            }}
          >
            <CloseIcon />
          </span>
        </div>
        <p className={cns("heading3")}>
          Do you want to delete {shortenFileName(creative.name)} permanently ?
        </p>
        <button
          type="button"
          onClick={() => {
            confirmDeleteCreative(id);
            setCreativeDeleteId(null);
            setShowModal(false);
          }}
        >
          Delete Creative
        </button>
      </div>
    </div>
  );
};

export default DeleteImageModal;
