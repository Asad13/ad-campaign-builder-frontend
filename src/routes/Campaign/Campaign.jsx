import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";

const Campaign = () => {
  return (
    <>
      <Helmet>
        <title>Campaign Builder - Campaigns</title>
      </Helmet>
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default Campaign;
