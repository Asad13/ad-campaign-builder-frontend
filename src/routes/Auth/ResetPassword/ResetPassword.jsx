import { Helmet } from "react-helmet";
import FormLayout from "../../../components/Authentication/FormLayout/FormLayout";
import Form from "../../../components/Authentication/Form";
import AuthContent from "../../../components/Authentication/content";
import formData from "../../../components/Authentication/formData";

const ResetPassword = () => {
  return (
    <>
      <Helmet>
        <title>Campaign Builder - Reset Password</title>
      </Helmet>
      <div>
        <FormLayout {...AuthContent.resetPassword}>
          <Form {...formData.resetPassword} />
        </FormLayout>
      </div>
    </>
  );
};

export default ResetPassword;
