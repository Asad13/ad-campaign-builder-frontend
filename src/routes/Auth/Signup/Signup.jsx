import { Helmet } from "react-helmet";
import FormLayout from "../../../components/Authentication/FormLayout/FormLayout";
import Form from "../../../components/Authentication/Form";
import AuthContent from "../../../components/Authentication/content";
import formData from "../../../components/Authentication/formData";

const Signup = () => {
  return (
    <>
      <Helmet>
        <title>Campaign Builder - Signup</title>
      </Helmet>
      <FormLayout {...AuthContent.signup}>
        <Form {...formData.signup} />
      </FormLayout>
    </>
  );
};

export default Signup;
