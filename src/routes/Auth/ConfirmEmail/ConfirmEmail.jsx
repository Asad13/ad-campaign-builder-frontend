import { Helmet } from "react-helmet";
import ConfirmEmailComp from "@components/Authentication/ConfirmEmailComp";

const ConfirmEmail = () => {
  return (
    <>
      <Helmet>
        <title>Campaign Builder - Confirm Email</title>
      </Helmet>
      <ConfirmEmailComp />
    </>
  );
};

export default ConfirmEmail;
