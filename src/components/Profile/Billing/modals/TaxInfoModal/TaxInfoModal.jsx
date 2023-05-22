import cns from "classnames";
import { useRef, useState, useCallback } from "react";
import { CloseIcon } from "@assets/images/sidebar";
import styles from "./TaxInfoModal.module.scss";

const entities = [
  ["amp", "&"],
  ["apos", "'"],
  ["#x27", "'"],
  ["#x2F", "/"],
  ["#39", "'"],
  ["#47", "/"],
  ["lt", "<"],
  ["gt", ">"],
  ["nbsp", " "],
  ["quot", '"'],
];

function decodeHTMLEntities(text) {
  for (var i = 0, max = entities.length; i < max; ++i)
    text = text.replace(
      new RegExp("&" + entities[i][0] + ";", "g"),
      entities[i][1]
    );

  return text;
}

const errorMsgs = {
  name: {
    empty: "Enter your full name",
  },
  address_line_one: {
    empty: "Enter your street address",
  },
  address_line_two: {
    empty: "Enter your address",
  },
};

const initialErrors = {
  name: "",
  address_line_one: "",
  address_line_two: "",
};

const initialBlurs = {
  name: false,
  address_line_one: false,
  address_line_two: false,
};

const TaxInfoModal = ({ setShowModal, taxInfo, save }) => {
  const modal = useRef(null);

  const [values, setValues] = useState({
    name: taxInfo?.name ?? "",
    address_line_one: taxInfo?.address_line_one ?? "",
    address_line_two: taxInfo?.address_line_two ?? "",
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
      return {
        state: true,
        errorMsg: "",
      };
    }
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
                <label htmlFor="name" className={cns("heading6")}>
                  Name on card
                </label>
                <input
                  className={cns("input", "bodyText2", {
                    "form-field-error": errors["name"] && true,
                  })}
                  id="name"
                  name="name"
                  placeholder="Full name"
                  type="text"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <span className="error-msg">{errors["name"]}</span>
              </div>
              <div className={styles.formInputContainer}>
                <label htmlFor="name" className={cns("heading6")}>
                  Address
                </label>
                <input
                  className={cns("input", "bodyText2", {
                    "form-field-error": errors["address_line_one"] && true,
                  })}
                  id="address_line_one"
                  name="address_line_one"
                  placeholder="Address line 1"
                  type="text"
                  value={decodeHTMLEntities(values.address_line_one)}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <span className="error-msg">{errors["address_line_one"]}</span>
                <input
                  className={cns("input", "bodyText2", {
                    "form-field-error": errors["address_line_two"] && true,
                  })}
                  id="address_line_two"
                  name="address_line_two"
                  placeholder="Address line 2"
                  type="text"
                  value={decodeHTMLEntities(values.address_line_two)}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <span className="error-msg">{errors["address_line_two"]}</span>
              </div>
              <div>
                <button type="submit" onClick={handleSubmit}>
                  {taxInfo?.name ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxInfoModal;
