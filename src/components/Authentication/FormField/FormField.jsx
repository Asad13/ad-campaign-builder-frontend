import cns from 'classnames';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const FormField = ({
  type,
  id,
  label,
  placeholder,
  error,
  updateError,
  required,
  value,
  suggestion,
  bottomLink,
  updateForm,
  values,
  errors
}) => {
  const [fieldValue, setFieldValue] = useState(value);
  const [errorMsg, setErrorMsg] = useState(error);
  const [hasBlurred, setHasBlurred] = useState(false);

  const handleBlur = event => {
    setHasBlurred(true);
    updateError(event.target.name, event.target.value);
  }

  const handleChange = (event) => {
    setFieldValue(event.target.value);
    updateForm({
      [event.target.name]: event.target.value,
    });
    if(hasBlurred) updateError(event.target.name, event.target.value);
  };

  useEffect(() => {
    if (!values[id]) setFieldValue("");
  }, [id, values]);

  useEffect(() => {
    setErrorMsg(error);
  },[error,errors]);

  return (
    <div className="tw-mb-4">
      <label
        htmlFor={id}
        className="tw-w-full tw-text-textPrimary tw-font-medium tw-font-bodyText2"
      >
        <span className="tw-ml-1 tw-mb-1">
          {label}
          {required ? "*" : null}
        </span>
        <input
          type={type}
          name={id}
          id={id}
          value={fieldValue}
          placeholder={placeholder}
          required={required}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cns('input', 'bodyText2', errorMsg ? 'form-field-error' : '')}
        />
      </label>
      {
        errorMsg && (
          <span className='error-msg'>{errorMsg}</span>
        )
      }
      {suggestion && (
        <span className="tw-text-textDisabled tw-font-bodyText2 tw-ml-1">
          {suggestion}
        </span>
      )}
      {bottomLink && (
        <div className="tw-ont-bodyText2 tw-font-inter tw-ml-1 tw-font-medium">
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

export default FormField;
