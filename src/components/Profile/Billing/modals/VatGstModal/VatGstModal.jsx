import cns from "classnames";
import { useRef, useState, useCallback } from "react";
import { CloseIcon } from "@assets/images/sidebar";
import styles from "./VatGstModal.module.scss";

const errorMsgs = {
  vat_gst: {
    empty: "Enter your VAT/GST number",
    invalid: "Invalid VAT/GST number",
  },
};

const initialErrors = {
  vat_gst: "",
};

const initialBlurs = {
  vat_gst: false,
};

const VatGstModal = ({ setShowModal, taxInfo, save }) => {
  const modal = useRef(null);

  const [values, setValues] = useState({
    vat_gst: taxInfo?.vat_gst ?? "",
  });

  const [errors, setErrors] = useState({ ...initialErrors });

  const [blurred, setBlurred] = useState({ ...initialBlurs });

  const findError = useCallback((name, value) => {
    if (!value) {
      return {
        state: false,
        errorMsg: errorMsgs[name].empty,
      };
    } else {
      const regExp = /^([0-9]{9,15})$/;

      if (!regExp.test(value)) {
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

      setErrors((errors) => ({
        ...errors,
        [name]: errorMsg,
      }));
    },
    [findError]
  );

  const handleChange = useCallback(
    (event) => {
      setValues((values) => ({
        ...values,
        [event.target.name]: event.target.value,
      }));

      if (blurred[event.target.name]) {
        handleError(event.target.name, event.target.value);
      }
    },
    [blurred, handleError]
  );

  const handleBlur = useCallback(
    (event) => {
      setBlurred((blurred) => ({
        ...blurred,
        [event.target.name]: true,
      }));
      handleError(event.target.name, event.target.value);
    },
    [handleError]
  );

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
  }, [values, findError]);

  const handleSubmit = useCallback(
    (event) => {
      event.stopPropagation();
      event.preventDefault();

      if (validate()) {
        save(values);
        setShowModal(false);
      }
    },
    [setShowModal, validate, save, values]
  );

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
        <div className={styles.contentContainer}>
          <h5 className={cns("campaignSubHeading")}>Tax Information</h5>
          <div>
            <form
              method="post"
              autoComplete="off"
              noValidate
              onSubmit={handleSubmit}
            >
              <div className={styles.formInputContainer}>
                <label htmlFor="vat_gst" className={cns("heading6")}>
                  Enter the tax ID you want on your invoice
                </label>
                <input
                  className={cns("input", "bodyText2", {
                    "form-field-error": errors["vat_gst"] && true,
                  })}
                  id="vat_gst"
                  name="vat_gst"
                  placeholder="Your VAT/GST number"
                  pattern="^([0-9]{9,15})$"
                  maxLength="15"
                  type="tel"
                  value={values.vat_gst}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <span className="error-msg">{errors["vat_gst"]}</span>
              </div>
              <div>
                <button type="submit" onClick={handleSubmit}>
                  {taxInfo?.vat_gst ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VatGstModal;
