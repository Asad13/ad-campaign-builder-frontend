import { Helmet } from "react-helmet";

const Dashboard = () => {
  return (
    <>
      <Helmet>
        <title>Campaign Builder - Dashboard</title>
      </Helmet>
      <div style={{ minHeight: "90vh",  paddingTop:'120px', paddingBottom: '50px' }}>
        <h1 className="tw-text-blue-700 tw-ml-24"> Dashboard</h1>
      </div>
    </>
  );
};

export default Dashboard;
