import { Helmet } from "react-helmet";
import FormLayout from "../../../components/Authentication/FormLayout/FormLayout";
import Form from "../../../components/Authentication/Form";
import AuthContent from "../../../components/Authentication/content";
import formData from "../../../components/Authentication/formData";

const SetPassword = () => {
  return (
    <>
      <Helmet>
        <title>Campaign Builder - Set Password</title>
      </Helmet>
      <div>
        <FormLayout {...AuthContent.setPassword}>
          <Form {...formData.setPassword} />
        </FormLayout>
      </div>
    </>
  );
};

export default SetPassword;
