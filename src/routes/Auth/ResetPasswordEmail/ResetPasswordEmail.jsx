import { Helmet } from "react-helmet";
import ResetPasswordEmailComp from "@components/Authentication/ResetPasswordEmailComp";

const ResetPasswordEmail = () => {
  return (
    <>
      <Helmet>
        <title>Campaign Builder - Reset Password Email</title>
      </Helmet>
      <ResetPasswordEmailComp />
    </>
  );
};

export default ResetPasswordEmail;
