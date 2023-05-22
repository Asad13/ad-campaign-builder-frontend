import { Helmet } from "react-helmet";
import cns from "classnames";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { PaymentInputsWrapper, usePaymentInputs } from "react-payment-inputs";
import ReactFlagsSelect from "react-flags-select";
import images from "react-payment-inputs/images";
import styles from "../Profile.module.scss";
import stylesCard from "./Card.module.scss";
import { ToastContainer, toast } from "react-toastify";
import { TOAST_AUTO_CLOSE_DURATION, TOAST_OPTIONS } from "@config/constants";
import { EmailIcon } from "@assets/images/profile";
import { SelectIcon, TrashIcon } from "../../../assets/images/misc";
import {
  addCard,
  updateCard,
  updateStatus,
  updateMessage,
} from "@redux/features/finance/financeSlice";

const errorMsgs = {
  name: {
    empty: "Enter your name on card",
  },
  number: {
    empty: "Enter a card number",
  },
  exp: {
    empty: "Enter expiry date",
    invalid: "Invalid expiry date",
    expired: "Card is expired",
  },
  cvc: {
    empty: "Enter CVC",
    invalid: "Invalid CVC",
  },
  emails: {
    empty: "Enter your email",
    invalid: "Invalid email",
  },
  address_line1: {
    empty: "Enter your street address",
  },
  address_city: {
    empty: "Enter the name of your city",
  },
  address_state: {
    empty: "Enter the name of your state/province",
  },
  address_zip: {
    empty: "Enter your zip",
  },
  address_country: {
    empty: "Select your country",
  },
};

const initialValues = {
  name: "",
  number: "",
  exp: "",
  cvc: "",
  emails: [""],
  address_line1: "",
  address_city: "",
  address_state: "",
  address_zip: "",
  address_country: "",
  isDefault: false,
};

const initialErrors = {
  name: "",
  number: "",
  exp: "",
  cvc: "",
  emails: [""],
  address_line1: "",
  address_city: "",
  address_state: "",
  address_zip: "",
  address_country: "",
};

const initialBlurs = {
  name: false,
  number: false,
  exp: false,
  cvc: false,
  emails: [false],
  address_line1: false,
  address_city: false,
  address_state: false,
  address_zip: false,
  address_country: false,
};

const cardFieldsStyle = {
  fieldWrapper: {
    base: {
      width: "100%",
    },
  },
  inputWrapper: {
    base: {
      background: "#f1f1f1",
      borderRadius: "10px",
      outline: "none",
      height: "50px",
      border: "none",
      boxShadow: "none",
    },
    focused: {
      border: "1px solid transparent",
      outline: "2px solid #B69538",
    },
  },
  input: {
    base: {
      background: "#f1f1f1",
      fontFamily: "'Circular Std', 'sans-serif'",
      fontSize: "14px",
      fontWeight: "450",
      lineHeight: "120%",
    },
  },
  errorText: {
    base: {
      fontSize: "14px",
      color: "#dc3545",
      paddingLeft: "2px",
    },
  },
};

function checkExpiryDate(value) {
  const name = 'exp';
  const regExp = /^(0[1-9]|1[0-2]) \/? ([0-9]{2})$/;

  if (!regExp.test(value)) {
    return {
      state: false,
      errorMsg: errorMsgs[name].invalid,
    };
  }

  const [month, year] = value.split("/").map((item) => item.trim());
  const presentDate = new Date();
  const presentMonth = presentDate.getMonth() + 1;
  const presentYear =
    year.length === 2
      ? presentDate.getFullYear() % 100
      : presentDate.getFullYear();
  if (year && month) {
    if (parseInt(year) < presentYear) {
      return {
        state: false,
        errorMsg: errorMsgs[name].expired,
      };
    } else if (parseInt(year) === presentYear) {
      if (parseInt(month) >= presentMonth) {
        return {
          state: true,
          errorMsg: "",
        };
      } else {
        return {
          state: false,
          errorMsg: errorMsgs[name].expired,
        };
      }
    } else {
      return {
        state: true,
        errorMsg: "",
      };
    }
  } else {
    return {
      state: false,
      errorMsg: errorMsgs[name].invalid,
    };
  }
}

const Card = () => {
  const { token } = useSelector((state) => state.auth);
  const { status, message, card } = useSelector((state) => state.finance);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { wrapperProps, getCardImageProps, getCardNumberProps } =
    usePaymentInputs();

  const [values, setValues] = useState({ ...initialValues });

  const [errors, setErrors] = useState({ ...initialErrors });

  const [blurred, setBlurred] = useState({ ...initialBlurs });

  const toastId = useRef(null);
  const notify = (message, type = "success") => {
    if (type === "success") {
      return (toastId.current = toast.success(message, TOAST_OPTIONS));
    } else {
      return (toastId.current = toast.error(message, TOAST_OPTIONS));
    }
  };

  const setCard = useCallback((card) => {
    setValues({
      name: card?.name ?? "",
      number: card?.number ?? "",
      exp: card?.exp ?? "",
      cvc: card?.cvc ?? "",
      emails: card?.emails ?? [""],
      address_line1: card?.address_line1 ?? "",
      address_city: card?.address_city ?? "",
      address_state: card?.address_state ?? "",
      address_zip: card?.address_zip ?? "",
      address_country: card?.address_country ?? "",
      isDefault: card?.isDefault ?? false,
    });

    const newBlurred = { ...initialBlurs };
    newBlurred.emails = card.emails.map((email) => false);
    setBlurred(newBlurred);
    const newErrors = { ...initialErrors };
    newErrors.emails = card.emails.map((email) => "");
    setErrors(newErrors);
  }, []);

  useEffect(() => {
    if (card) {
      setCard(card);
    }
  }, [card, setCard]);

  useEffect(() => {
    if (status) {
      notify(message);
      dispatch(updateStatus());
      dispatch(updateMessage());
      navigate("/profile/billing"); // Will be updated to use modal
    } else if (status === false) {
      notify(message, "error");
      dispatch(updateStatus());
      dispatch(updateMessage());
    }
  }, [status, message, dispatch, navigate]);

  const findError = useCallback((name, value) => {
    if (!value && !name.includes("email")) {
      return {
        state: false,
        errorMsg: errorMsgs[name].empty,
      };
    }

    if (name.includes("email")) {
      if (!value) {
        return {
          state: false,
          errorMsg: errorMsgs["emails"].empty,
        };
      }

      const regExp =
        /^[a-z0-9!#$%&'*+/=?^_‘{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_‘{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/;
      if (!regExp.test(value)) {
        return {
          state: false,
          errorMsg: errorMsgs["emails"].invalid,
        };
      }
    }

    if (name === "exp") {
      return checkExpiryDate(value);
    }

    if (name === "cvc") {
      const regExp = /^[0-9]{3,4}$/;
      if (value.length < 3 || !regExp.test(value)) {
        return {
          state: false,
          errorMsg: errorMsgs[name].invalid,
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
      if (name.includes("email")) {
        const index = name.split("-")[1];
        const newErrorEmails = [...errors.emails];
        newErrorEmails[index] = errorMsg;
        setErrors((errors) => ({
          ...errors,
          emails: newErrorEmails,
        }));
      } else {
        setErrors((errors) => ({
          ...errors,
          [name]: errorMsg,
        }));
      }
    },
    [findError, errors.emails]
  );

  const addEmail = useCallback(() => {
    const newEmails = [...values.emails];
    newEmails.push("");
    setValues((errors) => ({
      ...errors,
      emails: newEmails,
    }));
    const newErrorEmails = [...errors.emails];
    newErrorEmails.push("");
    setErrors((errors) => ({
      ...errors,
      emails: newErrorEmails,
    }));
    const newBlurredEmails = [...blurred.emails];
    newBlurredEmails.push(false);
    setBlurred((errors) => ({
      ...errors,
      emails: newBlurredEmails,
    }));
  }, [values.emails, blurred.emails, errors.emails]);

  const deleteEmail = useCallback(
    (index) => {
      const newEmails = [...values.emails];
      newEmails.splice(index, 1);
      setValues((errors) => ({
        ...errors,
        emails: newEmails,
      }));
      const newErrorEmails = [...errors.emails];
      newErrorEmails.splice(index, 1);
      setErrors((errors) => ({
        ...errors,
        emails: newErrorEmails,
      }));
      const newBlurredEmails = [...blurred.emails];
      newBlurredEmails.splice(index, 1);
      setBlurred((errors) => ({
        ...errors,
        emails: newBlurredEmails,
      }));
    },
    [values.emails, blurred.emails, errors.emails]
  );

  const handleChange = useCallback(
    (event) => {
      if (event.target.type === "checkbox") {
        setValues((values) => ({
          ...values,
          [event.target.name]: !values[event.target.name],
        }));
      } else if (event.target.name === "exp") {
        let value = event.target.value;
        if (parseInt(value[0]) > 1) {
          value = `0${value} / `;
        }
        if (parseInt(value[0]) === 1 && parseInt(value[1]) > 2) {
          value = value[0];
        }

        if (value.length === 2 && values.exp.length === 1) {
          value += " / ";
        }
        setValues((values) => ({
          ...values,
          [event.target.name]: value,
        }));
      } else if (event.target.name.includes("email")) {
        const index = event.target.name.split("-")[1];
        const newEmails = [...values.emails];
        newEmails[index] = event.target.value;
        if (blurred["emails"][index]) {
          handleError(event.target.name, event.target.value);
        }
        setValues((values) => ({
          ...values,
          emails: newEmails,
        }));
      } else {
        setValues((values) => ({
          ...values,
          [event.target.name]: event.target.value,
        }));
      }

      if (!event.target.name.includes("email")) {
        if (blurred[event.target.name] || event.target.name === "number") {
          handleError(event.target.name, event.target.value);
        }
      }
    },
    [blurred, handleError, values.emails, values.exp]
  );

  const handleBlur = useCallback(
    (event) => {
      if (
        event.target.name !== "number" &&
        !event.target.name.includes("email")
      ) {
        setBlurred((blurred) => ({
          ...blurred,
          [event.target.name]: true,
        }));
      } else if (event.target.name.includes("email")) {
        const index = event.target.name.split("-")[1];
        const newBlurredEmails = [...blurred.emails];
        newBlurredEmails[index] = true;
        setBlurred((blurred) => ({
          ...blurred,
          emails: newBlurredEmails,
        }));
      }
      handleError(event.target.name, event.target.value);
    },
    [handleError, blurred.emails]
  );

  const handleReset = useCallback(
    (event) => {
      event.stopPropagation();
      event.preventDefault();

      if (!card) {
        setValues({ ...initialValues });
        const newBlurred = { ...initialBlurs };
        newBlurred.emails = [false];
        setBlurred(newBlurred);
        const newErrors = { ...initialErrors };
        newErrors.emails = [""];
        setErrors(newErrors);
      } else {
        setCard(card);
      }
    },
    [card, setCard]
  );

  const validate = useCallback(() => {
    let isValid = true;
    const newErrors = { ...initialErrors };
    for (const property in values) {
      if (property !== "isDefault" && property !== "emails") {
        const { state, errorMsg } = findError(property, values[property]);
        isValid = isValid && state;
        newErrors[property] = errorMsg;
      } else if (property === "emails") {
        for (let i = 0; i < values.emails.length; i++) {
          const { state, errorMsg } = findError(
            `email-${i}`,
            values[property][i]
          );
          isValid = isValid && state;
          if (i === 0) {
            newErrors[property][i] = errorMsg;
          } else {
            newErrors[property].push(errorMsg);
          }
        }
      }
    }

    if (!isValid) {
      setErrors({ ...newErrors });
    }

    return isValid;
  }, [values, findError]);

  const handleSubmit = useCallback(
    (event) => {
      event.stopPropagation();
      event.preventDefault();

      if (validate()) {
        const data = { ...values };
        const exps = values.exp.split("/");
        data.exp_month = parseInt(exps[0].trim());
        data.exp_year = parseInt(exps[1].trim());
        data.cvc = parseInt(data.cvc);
        delete data.exp;

        if (!card) {
          dispatch(addCard({ data, token }));
        } else {
          const id = card?.id;
          dispatch(updateCard({ data, token, id }));
        }
      }
    },
    [validate, values, dispatch, token, card]
  );

  return (
    <>
      <Helmet>
        <title>
          Campaign Builder -{" "}
          {location.pathname.includes("add-card") ? "Add Card" : "Edit Card"}
        </title>
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
        <h4 className={cns("heading4", styles.item)}>
          {location.pathname.includes("add-card") ? "Add" : "Edit"} Payment
          Method
        </h4>
        <div className={cns(styles.item)}>
          <h6 className={cns("heading6")}>Payment Method</h6>
          <p className={cns("bodyText2")}>
            Update your billing details and address.
          </p>
        </div>
        <form
          method="post"
          autoComplete="off"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className={cns(styles.formItem, stylesCard.formItemRoot)}>
            <div className={styles.left}>
              <h6 className={cns("heading6")}>Card details</h6>
            </div>
            <div className={styles.right}>
              <div className={cns(stylesCard.cardFieldsContainer)}>
                <div className={cns(stylesCard.cardFieldsLeft)}>
                  <div className={stylesCard.formInputContainer}>
                    <label htmlFor="name" className={cns("heading6")}>
                      Name on card
                    </label>
                    <input
                      className={cns("input", "bodyText2", {
                        "form-field-error": errors["name"] && true,
                      })}
                      id="name"
                      name="name"
                      placeholder="Name on card"
                      type="text"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <span className="error-msg">{errors["name"]}</span>
                  </div>
                  <div className={stylesCard.formInputContainer}>
                    <label htmlFor="number" className={cns("heading6")}>
                      Card number
                    </label>
                    {location.pathname.includes("add-card") ? (
                      <PaymentInputsWrapper
                        {...wrapperProps}
                        styles={cardFieldsStyle}
                        id="numberContainer"
                      >
                        <svg {...getCardImageProps({ images })} />
                        <input
                          {...getCardNumberProps({
                            onChange: handleChange,
                            id: "number",
                            name: "number",
                          })}
                        />
                      </PaymentInputsWrapper>
                    ) : (
                      <div
                        className={cns(
                          "input",
                          "bodyText2",
                          "notAllowed",
                          "notAllowedTextColor",
                          {
                            "form-field-error": errors["number"] && true,
                          }
                        )}
                        id="number"
                        name="number"
                        //placeholder="Card number"
                        //type="text"
                        dangerouslySetInnerHTML={{
                          __html: `&#x2022;&#x2022;&#x2022;&#x2022; &#x2022;&#x2022;&#x2022;&#x2022; &#x2022;&#x2022;&#x2022;&#x2022; ${values.number}`,
                        }}
                        //value={`&#x2022; ${values.number}`}
                        disabled={true}
                        tabIndex={-1}
                      ></div>
                    )}
                    {errors["number"] && (
                      <span className="error-msg">{errors["number"]}</span>
                    )}
                  </div>
                </div>
                <div className={cns(stylesCard.cardFieldsRight)}>
                  <div className={stylesCard.formInputContainer}>
                    <label htmlFor="exp" className={cns("heading6")}>
                      Expiry
                    </label>
                    <input
                      className={cns("input", "bodyText2", {
                        "form-field-error": errors["exp"] && true,
                      })}
                      maxLength="7"
                      id="exp"
                      name="exp"
                      pattern="^(0[1-9]|1[0-2])\/?([0-9]{2})$"
                      placeholder="MM / YY"
                      type="tel"
                      value={values.exp}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <span className="error-msg">{errors["exp"]}</span>
                  </div>
                  <div className={stylesCard.formInputContainer}>
                    <label htmlFor="cvc" className={cns("heading6")}>
                      CVV
                    </label>
                    <input
                      className={cns("input", "bodyText2", {
                        "form-field-error": errors["cvc"] && true,
                      })}
                      maxLength="4"
                      id="cvc"
                      name="cvc"
                      pattern="^[0-9]{3,4}$"
                      placeholder="CVV"
                      type="password"
                      value={values.cvc}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <span className="error-msg">{errors["cvc"]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={cns(styles.formItem, stylesCard.formItemRoot)}>
            <div className={styles.left}>
              <h6 className={cns("heading6")}>Email address</h6>
              <p className={cns("bodyText2")}>
                Invoices will be sent to this email address.
              </p>
            </div>
            <div className={styles.right}>
              <div className={stylesCard.emails}>
                {values.emails.length > 0 &&
                  values.emails.map((email, index) => {
                    return (
                      <div
                        key={index}
                        className={cns(
                          stylesCard.formInputContainer,
                          stylesCard.emailInputContainer
                        )}
                      >
                        <span className={cns("inputIcon")}>
                          <EmailIcon />
                        </span>
                        <input
                          className={cns(
                            "input",
                            "bodyText2",
                            "inputWithIcon",
                            {
                              "form-field-error":
                                errors["emails"][index] && true,
                            }
                          )}
                          id={`email-${index}`}
                          name={`email-${index}`}
                          placeholder={`Email ${index + 1}`}
                          type="email"
                          value={values.emails[index]}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            className={cns(
                              "inputIcon",
                              stylesCard.emailDeleteBtn
                            )}
                            onClick={() => {
                              deleteEmail(index);
                            }}
                          >
                            <span>
                              <TrashIcon />
                            </span>
                          </button>
                        )}
                        <span className="error-msg">
                          {errors["emails"][index]}
                        </span>
                      </div>
                    );
                  })}
                <div className={stylesCard.addEmailBtnContainer}>
                  <button
                    type="button"
                    className={cns("bodyText2", stylesCard.addEmailBtn)}
                    onClick={addEmail}
                  >
                    <span>+</span> Add another
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className={cns(styles.formItem, stylesCard.formItemRoot)}>
            <div className={styles.left}>
              <h6 className={cns("heading6")}>Street address</h6>
            </div>
            <div className={styles.right}>
              <div className={stylesCard.formInputContainer}>
                <input
                  className={cns("input", "bodyText2", {
                    "form-field-error": errors["address_line1"] && true,
                  })}
                  id="address_line1"
                  name="address_line1"
                  placeholder="Street address"
                  type="text"
                  value={values.address_line1}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <span className="error-msg">{errors["address_line1"]}</span>
              </div>
            </div>
          </div>
          <div className={cns(styles.formItem, stylesCard.formItemRoot)}>
            <div className={styles.left}>
              <h6 className={cns("heading6")}>City</h6>
            </div>
            <div className={styles.right}>
              <div className={stylesCard.formInputContainer}>
                <input
                  className={cns("input", "bodyText2", {
                    "form-field-error": errors["address_city"] && true,
                  })}
                  id="address_city"
                  name="address_city"
                  placeholder="City"
                  type="text"
                  value={values.address_city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <span className="error-msg">{errors["address_city"]}</span>
              </div>
            </div>
          </div>
          <div className={cns(styles.formItem, stylesCard.formItemRoot)}>
            <div className={styles.left}>
              <h6 className={cns("heading6")}>State / Province</h6>
            </div>
            <div className={styles.right}>
              <div className={stylesCard.statesFieldsContainer}>
                <div className={stylesCard.statesFieldsLeft}>
                  <div className={stylesCard.formInputContainer}>
                    <input
                      className={cns("input", "bodyText2", {
                        "form-field-error": errors["address_state"] && true,
                      })}
                      id="address_state"
                      name="address_state"
                      placeholder="State / Province"
                      type="text"
                      value={values.address_state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <span className="error-msg">{errors["address_state"]}</span>
                  </div>
                </div>
                <div className={stylesCard.statesFieldsRight}>
                  <div className={stylesCard.formInputContainer}>
                    <input
                      className={cns("input", "bodyText2", {
                        "form-field-error": errors["address_zip"] && true,
                      })}
                      id="address_zip"
                      name="address_zip"
                      placeholder="Zip"
                      type="text"
                      value={values.address_zip}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <span className="error-msg">{errors["address_zip"]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={cns(styles.formItem, stylesCard.formItemRoot)}>
            <div className={styles.left}>
              <h6 className={cns("heading6")}>Country</h6>
            </div>
            <div className={styles.right}>
              <div
                className={cns(
                  stylesCard.formInputContainer,
                  stylesCard.countrySelectContainer
                )}
              >
                <ReactFlagsSelect
                  selectButtonClassName={cns(stylesCard.countrySelect)}
                  selected={values.address_country}
                  searchable
                  onSelect={(code) => {
                    setValues((values) => ({
                      ...values,
                      address_country: code,
                    }));
                    setErrors((errors) => ({
                      ...errors,
                      address_country: "",
                    }));
                  }}
                />
                <span className="error-msg">{errors["address_country"]}</span>
              </div>
            </div>
          </div>
          <div className={cns(stylesCard.formBtnsContainer)}>
            <div>
              <input
                type="checkbox"
                className={cns("custom-checkbox")}
                id="isDefault"
                name="isDefault"
                checked={values.isDefault}
                onChange={handleChange}
              />
              <label
                htmlFor="isDefault"
                className={cns(stylesCard.default, {
                  [stylesCard.defaultCard]: values.isDefault,
                })}
              >
                <span
                  className={cns("custom-checkbox-box", {
                    "custom-checkbox-selected": values.isDefault,
                  })}
                >
                  {values.isDefault ? <SelectIcon /> : null}
                </span>
                <span className={cns(stylesCard.defaultText)}>
                  {values.isDefault ? "Default Card" : "Save as Default"}
                </span>
              </label>
            </div>
            <div className={cns(styles.formBtns, stylesCard.btnsContainer)}>
              <button
                type="reset"
                className={cns("buttonText", "formBtn")}
                onClick={handleReset}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={cns("buttonText", "formBtn")}
                onSubmit={handleSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default Card;
