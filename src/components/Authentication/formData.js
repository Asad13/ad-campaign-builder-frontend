const formData = {
  signup: {
    formType: "signup",
    fields: [
      // {
      //     id: "fname",
      //     type: "text",
      //     label: "First Name",
      //     placeholder: "Enter your first name",
      //     errorMsg: "",
      //     required: true,
      //     value: ""
      // },
      // {
      //     id: "lname",
      //     type: "text",
      //     label: "Last Name",
      //     placeholder: "Enter your last name",
      //     errorMsg: "",
      //     required: true,
      //     value: ""
      // },
      {
        id: "company_name",
        type: "text",
        label: "Company Name",
        placeholder: "Enter your company name",
        errorMsg: {
          empty: "Please enter your company's name"
        },
        required: true,
        value: "",
      },
      {
        id: "email",
        type: "email",
        label: "Email",
        placeholder: "Enter your email",
        errorMsg: {
          empty: "Please enter a email",
          invalid: "Please enter a valid email address"
        },
        required: true,
        value: "",
      },
      {
        id: "password",
        type: "password",
        label: "Password",
        placeholder: "Create a password",
        errorMsg: {
          empty: "Please enter a password",
          invalid: "Password must be at least 8 characters."
        },
        required: true,
        value: "",
        suggestion: "Must be at least 8 characters.",
      },
    ],
    submitBtnText: "GET STARTED",
    bottomLink: {
      desc: "Already have an account?",
      linkText: "Login",
      linkHref: "/login",
    },
  },
  login: {
    formType: "login",
    fields: [
      {
        id: "email",
        type: "email",
        label: "Email",
        placeholder: "Enter your email",
        errorMsg: {
          empty: "Please enter your email",
          invalid: "Please enter a valid email address"
        },
        value: "",
      },
      {
        id: "password",
        type: "password",
        label: "Password",
        placeholder: "Password",
        errorMsg: {
          empty: "Please enter your password",
        },
        value: "",
        bottomLink: {
          desc: "Forgot Password?",
          linkText: "Reset Here",
          linkHref: "/forgot-password",
        },
      },
    ],
    submitBtnText: "LOGIN",
    bottomLink: {
      desc: "Do not have an account?",
      linkText: "Signup",
      linkHref: "/signup",
    },
  },
  forgotPassword: {
    formType: "forgotPassword",
    fields: [
      {
        id: "email",
        type: "email",
        label: "Email",
        placeholder: "Enter your email",
        errorMsg: {
          empty: "Please enter your email",
          invalid: "Please enter a valid email address"
        },
        value: "",
      },
    ],
    submitBtnText: "SEND",
  },
  resetPassword: {
    formType: "resetPassword",
    fields: [
      {
        id: "password",
        type: "password",
        label: "Password",
        placeholder: "Create a password",
        errorMsg: {
          empty: "Please enter a password",
          invalid: "Password must be at least 8 characters."
        },
        required: true,
        value: "",
      },
      {
        id: "confirmPassword",
        type: "password",
        label: "Confirm Password",
        placeholder: "Confirm your password",
        errorMsg: {
          empty: "Please confirm your password",
          invalid: "Password must be at least 8 characters.",
          mismatch: "Password not matching"
        },
        required: true,
        value: "",
      },
    ],
    submitBtnText: "Update now",
  },
  setPassword: {
    formType: "setPassword",
    fields: [
      {
        id: "password",
        type: "password",
        label: "Password",
        placeholder: "Create a password",
        errorMsg: {
          empty: "Please enter a password",
          invalid: "Password must be at least 8 characters."
        },
        required: true,
        value: "",
      },
      {
        id: "confirmPassword",
        type: "password",
        label: "Confirm Password",
        placeholder: "Confirm your password",
        errorMsg: {
          empty: "Please confirm your password",
          invalid: "Password must be at least 8 characters.",
          mismatch: "Password not matching"
        },
        required: true,
        value: "",
      },
    ],
    submitBtnText: "Set password",
  }
};

export default formData;
