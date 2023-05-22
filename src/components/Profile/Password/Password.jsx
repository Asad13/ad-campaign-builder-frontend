import { Helmet } from "react-helmet";
import cns from "classnames";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import {
  updatePassword,
  updateProfileMessage,
} from "@redux/features/auth/authSlice";
import styles from "../Profile.module.scss";
import stylesPassword from "./Password.module.scss";
import { TOAST_AUTO_CLOSE_DURATION } from "@config/constants";

const formFields = [
  {
    id: "password",
    label: "Current password",
    type: "password",
    errorMsgs: {
      empty: "Please enter your current password",
    },
  },
  {
    id: "newPassword",
    label: "New password",
    type: "password",
    errorMsgs: {
      empty: "Please enter a password",
      invalid: "Password must be at least 8 characters long",
    },
  },
  {
    id: "confirmNewPassword",
    label: "Confirm new password",
    type: "password",
    hint: "Your new password must be more than 8 characters.",
    errorMsgs: {
      empty: "Please confirm your password",
      invalid: "Password must be at least 8 characters long",
      mismatch: "Password doesn't match",
    },
  },
];

const toastOptions = {
  position: "top-right",
  autoClose: TOAST_AUTO_CLOSE_DURATION,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
};

const Password = () => {
  const { token, status, profileMessage } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [passwordData, setPasswordData] = useState({
    password: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [errors, setErrors] = useState({
    password: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [blurs, setBlurs] = useState({
    password: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const toastId = useRef(null);

  const notify = (message, type = "success") => {
    if (type === "success") {
      return (toastId.current = toast.success(message, toastOptions));
    } else {
      return (toastId.current = toast.error(message, toastOptions));
    }
  };

  useEffect(() => {
    if (profileMessage) {
      if (status) {
        notify(profileMessage);

        setPasswordData({
          password: "",
          newPassword: "",
          confirmNewPassword: "",
        });

        setErrors({
          password: "",
          newPassword: "",
          confirmNewPassword: "",
        });

        setBlurs({
          password: false,
          newPassword: false,
          confirmNewPassword: false,
        });
      } else {
        notify(profileMessage, "error");
      }
      dispatch(updateProfileMessage());
    }
  }, [profileMessage]);

  const showErrorMsg = (name, value) => {
    const field = formFields.find((item) => item.id === name);
    if (!value) {
      setErrors({
        ...errors,
        [name]: field.errorMsgs.empty,
      });
      return;
    } else if (name === "newPassword" && value.length < 8) {
      setErrors({
        ...errors,
        [name]: field.errorMsgs.invalid,
      });
    } else if (
      name === "confirmNewPassword" &&
      passwordData["newPassword"] !== value
    ) {
      setErrors({
        ...errors,
        [name]: field.errorMsgs.mismatch,
      });
    } else {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleBlur = (event) => {
    if (!blurs[event.target.name]) {
      setBlurs({
        ...blurs,
        [event.target.name]: true,
      });
    }
    showErrorMsg(event.target.name, event.target.value);
  };

  const handleChange = (event) => {
    setPasswordData({
      ...passwordData,
      [event.target.name]: event.target.value,
    });

    if (blurs[event.target.name] || errors[[event.target.name]]) {
      showErrorMsg(event.target.name, event.target.value);
    }
  };

  const validate = () => {
    let isValid = true;
    const newErrors = {};
    for (const property in passwordData) {
      if (!passwordData[property]) {
        const field = formFields.find((item) => item.id === property);
        newErrors[property] = field.errorMsgs.empty;
        isValid = isValid && false;
      }
    }

    if (passwordData.newPassword && passwordData.newPassword.length < 8) {
      newErrors["newPassword"] = formFields[1].errorMsgs.invalid;
      isValid = isValid && false;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      newErrors["confirmNewPassword"] = formFields[2].errorMsgs.mismatch;
      isValid = isValid && false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCancel = () => {
    setPasswordData({
      password: "",
      newPassword: "",
      confirmNewPassword: "",
    });

    setErrors({
      password: "",
      newPassword: "",
      confirmNewPassword: "",
    });

    setBlurs({
      password: false,
      newPassword: false,
      confirmNewPassword: false,
    });
  };

  const handleSubmit = (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (validate()) {
      dispatch(
        updatePassword({
          body: passwordData,
          token,
        })
      );
    }
  };

  return (
    <>
      <Helmet>
        <title>Campaign Builder - Password</title>
      </Helmet>
      <div className={cns(styles.container)}>
        <ToastContainer
          position="top-right"
          autoClose={TOAST_AUTO_CLOSE_DURATION}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <h4 className={cns("heading4", styles.item)}>Password</h4>
        <div className={cns(styles.item)}>
          <h6 className={cns("heading6")}>Password</h6>
          <p className={cns("bodyText2")}>
            Please enter your current password to change your password.
          </p>
        </div>
        <form
          method="post"
          autoComplete="off"
          noValidate
          onSubmit={handleSubmit}
        >
          {formFields.map((field) => (
            <div
              key={field.id}
              className={cns(stylesPassword.item, styles.formItem)}
            >
              <div className={styles.left}>
                <label htmlFor={field.id} className={cns("heading6")}>
                  {field.label}
                </label>
              </div>
              <div className={styles.right}>
                <input
                  type={field.type}
                  className={cns("input", "bodyText2")}
                  id={field.id}
                  name={field.id}
                  value={passwordData[field.id]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {field.hint ?? (
                  <p className={cns("bodyText2", "hint")}>{field.hint}</p>
                )}
                <span className="error-msg">{errors[field.id]}</span>
              </div>
            </div>
          ))}
          <div className={cns(styles.formBtns)}>
            <button
              type="reset"
              className={cns("buttonText", "formBtn")}
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={cns("buttonText", "formBtn")}
              onSubmit={handleSubmit}
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Password;
