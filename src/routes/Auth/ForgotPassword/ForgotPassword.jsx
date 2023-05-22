import { Helmet } from "react-helmet";
import FormLayout from "../../../components/Authentication/FormLayout/FormLayout";
import Form from "../../../components/Authentication/Form";
import AuthContent from "../../../components/Authentication/content";
import formData from "../../../components/Authentication/formData";

const ForgotPassword = () => {
  return (
    <>
      <Helmet>
        <title>Campaign Builder - Forgot Password</title>
      </Helmet>
      <div>
        <FormLayout {...AuthContent.forgotPassword}>
          <Form {...formData.forgotPassword} />
        </FormLayout>
      </div>
    </>
  );
};

export default ForgotPassword;
