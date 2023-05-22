import { useState, useEffect, useRef, useCallback } from "react";
import FormField from "../FormField";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signUpUser,
  logInUser,
  updateMessage,
  updateStatus,
  forgotPassword,
  setPassword,
  resetPassword
} from "../../../redux/features/auth/authSlice";
import { ToastContainer, toast } from "react-toastify";

const Form = ({ formType, fields, submitBtnText, bottomLink }) => {
  const { status, message } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const initialFormState = {};
  const initialErrorState = {};

  for (const field in fields) {
    initialFormState[fields[field].id] = fields[field].value;
    initialErrorState[fields[field].id] = "";
  }

  const [values, setValues] = useState(initialFormState);
  const [errors, setErrors] = useState(initialErrorState);

  if (status) {
    setValues({ ...initialFormState });
    setErrors({ ...initialErrorState });
    if (formType !== "login") {
      dispatch(updateMessage());
      dispatch(updateStatus());
    }

    if (formType === "signup") {
      navigate("/confirm-email");
    } else if (formType === "forgotPassword") {
      navigate("/reset-password-email");
    } else if (formType === "resetPassword" || formType === "setPassword") {
      navigate("/login");
    }
  }

  const toastId = useRef(null);

  const notifyError = () => {
    if (message) {
      return (toastId.current = toast.error(message, {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        onClose: () => dispatch(updateMessage()),
      }));
    }
  };

  useEffect(() => {
    if (status === false && toastId) {
      notifyError();
      dispatch(updateMessage());
      dispatch(updateStatus());
    }
  }, [status, message]);

  const checkError = (id, value) => {
    let passed = true;
    const field = fields.find((field) => field.id === id);

    if (!value && field?.required) {
      setErrors({
        ...errors,
        [id]: field.errorMsg.empty,
      });
      passed = false;
      return false;
    }

    if (id === "email") {
      const regExp =
        /^[a-z0-9!#$%&'*+/=?^_‘{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_‘{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/;

      if (!regExp.test(value)) {
        setErrors({
          ...errors,
          [id]: field.errorMsg.invalid,
        });
        passed = false;
        return false;
      }
    }

    if (id === "password" && value.length < 8) {
      setErrors({
        ...errors,
        [id]: field.errorMsg.invalid,
      });
      passed = false;
      return false;
    }

    if (id === "confirmPassword" && values["password"] !== value) {
      setErrors({
        ...errors,
        [id]: field.errorMsg.mismatch,
      });
      passed = false;
      return false;
    }

    if (passed) {
      setErrors({
        ...errors,
        [id]: "",
      });
      return true;
    }
  };

  const updateForm = (value) => {
    setValues({
      ...values,
      ...value,
    });
  };

  const updateError = (id, value) => {
    checkError(id, value);
  };

  const validate = () => {
    let canSubmit = true;
    const errorMsgs = {};
    for (const field in fields) {
      errorMsgs[fields[field].id] = "";
    }

    for (const property in values) {
      const field = fields.find((field) => field.id === property);
      if (!values[property] && field?.required) {
        errorMsgs[property] = field.errorMsg.empty;
        canSubmit = canSubmit && false;
      }
    }

    if (values["email"]) {
      const regExp =
        /^[a-z0-9!#$%&'*+/=?^_‘{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_‘{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/;

      if (!regExp.test(values["email"])) {
        errorMsgs["email"] = fields["email"].errorMsg.invalid;
        canSubmit = canSubmit && false;
      }
    }

    if (values["password"] && values["password"].length < 8) {
      errorMsgs["password"] = fields["password"].errorMsg.invalid;
      canSubmit = canSubmit && false;
    }

    if (
      values["confirmPassword"] &&
      values["password"] !== values["confirmPassword"]
    ) {
      errorMsgs["confirmPassword"] =
        fields["confirmPassword"].errorMsg.mismatch;
      canSubmit = canSubmit && false;
    }

    return canSubmit;
  };

  const handleSubmit = (event) => {
    event.stopPropagation();
    event.preventDefault();
    toast.dismiss();

    if (validate()) {
      if (formType === "signup") {
        dispatch(
          signUpUser({
            ...values,
          })
        );
      } else if (formType === "login") {
        dispatch(
          logInUser({
            ...values,
          })
        );
      } else if (formType === "forgotPassword") {
        dispatch(
          forgotPassword({
            ...values,
          })
        );
      } else if (formType === "setPassword") {
        const token = location.pathname.split("/")[2];
        dispatch(
          setPassword({
            token,
            values,
          })
        );
      } else {
        const token = location.pathname.split("/")[2];
        dispatch(
          resetPassword({
            token,
            values,
          })
        );
      }
    }
  };

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        theme="colored"
      />
      <form method="post" autoComplete="off" noValidate onSubmit={handleSubmit}>
        {fields &&
          fields.length &&
          fields.map((formField) => (
            <FormField
              key={formField.id}
              {...formField}
              error={errors[formField.id]}
              updateError={updateError}
              updateForm={updateForm}
              errorr={errors}
              values={values}
            />
          ))}
        <div className="tw-flex tw-justify-center tw-mt-4">
          {submitBtnText && (
            <button
              type="submit"
              className="tw-inline-block tw-bg-primary tw-w-[254px] tw-max-w-full tw-text-lg tw-leading-6 tw-px-[30px] tw-py-[18px] tw-mt-6 tw-font-bold tw-font-bodyText1 tw-text-white tw-text-center tw-rounded"
            >
              {submitBtnText}
            </button>
          )}
        </div>
      </form>
      {bottomLink && (
        <div className="tw-text-center tw-font-bodyText2 tw-font-inter tw-mt-1 tw-font-medium">
          <span className="tw-text-textDisabled">{bottomLink.desc ?? ""}</span>
          <Link to={bottomLink.linkHref ?? ""} className="tw-text-primary">
            {" "}
            {bottomLink.linkText ?? ""}
          </Link>
        </div>
      )}
    </div>
  );
};

export default Form;
