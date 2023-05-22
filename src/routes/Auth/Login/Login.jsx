import { Helmet } from "react-helmet";
import FormLayout from "../../../components/Authentication/FormLayout/FormLayout";
import Form from "../../../components/Authentication/Form";
import AuthContent from "../../../components/Authentication/content";
import formData from "../../../components/Authentication/formData";

const Login = () => {
  return (
    <>
      <Helmet>
        <title>Campaign Builder - Login</title>
      </Helmet>
      <div>
        <FormLayout {...AuthContent.login}>
          <Form {...formData.login} />
        </FormLayout>
      </div>
    </>
  );
};

export default Login;
