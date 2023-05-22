import cns from "classnames";
import { useRef, useState, useCallback } from "react";
import { CloseIcon } from "@assets/images/sidebar";
import styles from "./InviteUserModal.module.scss";

const initialValues = {
  email: "",
  name: "",
  role_id: null,
};

const initialErrors = {
  name: "",
  email: "",
  role_id: "",
};

const initialBlur = {
  name: false,
  email: false,
};

const errorMsgs = {
  name: {
    empty: "Please enter Fullname",
  },
  email: {
    empty: "Please enter a email",
    invalid: "Please enter a valid email address",
  },
  role_id: {
    empty: "Please assign a role",
  },
};

const InviteUserModal = ({ setShowModal, roles, sendInvite }) => {
  const [values, setValues] = useState({ ...initialValues });
  const [errors, setErrors] = useState({ ...initialErrors });
  const [hasBlurred, setHasBlurred] = useState({ ...initialBlur });

  const modal = useRef(null);

  const findError = useCallback((name, value) => {
    if (!value) {
      return {
        state: false,
        errorMsg: errorMsgs[name].empty,
      };
    } else if (name === "email") {
      const regExp =
        /^[a-z0-9!#$%&'*+/=?^_‘{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_‘{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/;

      if (!regExp.test(value)) {
        return {
          state: false,
          errorMsg: errorMsgs[name].invalid,
        };
      } else {
        return {
          state: true,
          errorMsg: "",
        };
      }
    }

    return {
      state: true,
      errorMsg: "",
    };
  }, []);

  const handleError = useCallback(
    (name, value) => {
      const { errorMsg } = findError(name, value);

      setErrors((errors) => ({
        ...errors,
        [name]: errorMsg,
      }));
    },
    [findError]
  );

  const handleBlur = useCallback(
    (event) => {
      setHasBlurred((hasBlurred) => ({
        ...hasBlurred,
        [event.target.name]: true,
      }));
      handleError(event.target.name, event.target.value);
    },
    [handleError]
  );

  const handleChange = useCallback((event) => {
    const value =
      event.target.type === "radio"
        ? parseInt(event.target.id.split("-")[1])
        : event.target.value;

    setValues((values) => ({
      ...values,
      [event.target.name]: value,
    }));

    if (event.target.type !== "radio" && hasBlurred[event.target.name]) {
      handleError(event.target.name, event.target.value);
    }
  },[handleError, hasBlurred]);

  const validate = useCallback(() => {
    let isValid = true;
    const newErrors = { ...initialErrors };

    for (const property in values) {
      const { state, errorMsg } = findError(property, values[property]);
      isValid = isValid && state;
      newErrors[property] = errorMsg;
    }

    if (!isValid) {
      setErrors({ ...newErrors });
    }

    return isValid;
  },[values, findError]);

  const handleSubmit = useCallback((event) => {
    event.stopPropagation();
    event.preventDefault();
    if (validate()) {
      sendInvite(values);
      setShowModal(false);
    }
  },[sendInvite, setShowModal, validate, values]);

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
        <div className={cns(styles.content)}>
          <h5 className={cns("heading5")}>Add New User</h5>
          <form
            method="post"
            autoComplete="off"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className={cns(styles.formContentContainer)}>
              <div className={cns(styles.inputsContainer)}>
                <div>
                  <label
                    htmlFor="email"
                    className={cns("heading6", "topLabel")}
                  >
                    E-mail address
                  </label>
                  <input
                    type="email"
                    className={cns("input", "bodyText2", styles.field, {
                      "form-field-error": errors["email"] && true,
                    })}
                    id="email"
                    name="email"
                    placeholder="New user’s e-mail address"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <span className="error-msg">{errors["email"]}</span>
                </div>
                <div>
                  <label htmlFor="name" className={cns("heading6", "topLabel")}>
                    Full name
                  </label>
                  <input
                    type="text"
                    className={cns("input", "bodyText2", styles.field, {
                      "form-field-error": errors["name"] && true,
                    })}
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <span className="error-msg">{errors["name"]}</span>
                </div>
              </div>
              <div className={cns(styles.rolesContainer)}>
                <h6 className={cns("heading6", "topLabel")}>Role</h6>
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
                          name="role_id"
                          checked={values.role_id === role?.id}
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
                                "custom-radio-selected":
                                  values.role_id === role?.id,
                              })}
                            >
                              {values.role_id === role?.id && (
                                <span
                                  className={cns("custom-radio-inner")}
                                ></span>
                              )}
                            </span>
                          </div>
                          <div
                            className={cns(
                              "bodyText2",
                              styles.radioTextContainer
                            )}
                          >
                            <h6>{role?.name}</h6>
                            <p>{role?.desc}</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}
                <span className="error-msg">{errors["role_id"]}</span>
              </div>
            </div>
            <div>
              <button type="submit">Send Invite</button>
              <button
                className={cns(styles.noBtn)}
                type="button"
                onClick={() => {
                  setShowModal(false);
                }}
              >
                Go Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InviteUserModal;
