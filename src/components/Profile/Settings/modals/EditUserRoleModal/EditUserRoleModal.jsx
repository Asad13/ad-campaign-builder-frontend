import cns from "classnames";
import { useEffect, useRef, useState } from "react";
import styles from "./EditUserRoleModal.module.scss";

const EditUserRoleModal = ({
  showModal,
  setShowModal,
  id,
  roles,
  role_id,
  setEditUserRole_UserId,
  setEditUserRole_RoleId,
  confirmUpdateUserRole,
}) => {
  const [selectedRoleId, setselectedRoleId] = useState(role_id);
  const [clickedOutside, setClickedOutside] = useState(false);

  const modal = useRef(null);

  useEffect(() => {
    if(!clickedOutside){
      setClickedOutside(true);
      return;
    }else{
      function hideDropdown(event) {
        if (modal.current && !modal.current.contains(event.target)) {
          setEditUserRole_UserId(null);
          setEditUserRole_RoleId(null);
          setShowModal(false);
        }
      }

      document.addEventListener("click", hideDropdown);

      return () => document.removeEventListener("click", hideDropdown);
    }
  },[clickedOutside]);

  const handleChange = (event) => {
    setselectedRoleId(parseInt(event.target.id.split("-")[1]));
    confirmUpdateUserRole(id,parseInt(event.target.id.split("-")[1]));
    setEditUserRole_UserId(null);
    setEditUserRole_RoleId(null);
    setShowModal(false);
  };

  return (
    <div
      className={cns("dropdownContainer", styles.editDropdownContainer)}
      onClick={(event) => {}}
    >
      <div className={cns(styles.modal)} ref={modal}>
        {roles &&
          roles.length > 0 &&
          roles.map((role) => (
            <div
              key={role?.id}
              className={cns("bodyText2", styles.dropdownRoleContainer)}
            >
              <div>
                <input
                  type="radio"
                  className={cns("custom-radio")}
                  id={`roleId-${role?.id}`}
                  name="roleId"
                  checked={selectedRoleId === role?.id}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor={`roleId-${role?.id}`}
                  className={cns(
                    "bodyText2",
                    styles.dropdownRoleContainerLabel
                  )}
                >
                  <div className={cns(styles.radioInputContainer)}>
                    <span
                      className={cns("custom-radio-outer", {
                        "custom-radio-selected": selectedRoleId === role?.id,
                      })}
                    >
                      {selectedRoleId === role?.id && (
                        <span className={cns("custom-radio-inner")}></span>
                      )}
                    </span>
                  </div>
                  <div className={cns("bodyText2", styles.radioTextContainer)}>
                    <h6>{role?.name}</h6>
                    <p>{role?.desc}</p>
                  </div>
                </label>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default EditUserRoleModal;
