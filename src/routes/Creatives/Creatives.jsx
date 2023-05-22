import { Helmet } from "react-helmet";

const Creatives = () => {
  return (
    <>
      <Helmet>
        <title>Campaign Builder - Careatives</title>
      </Helmet>
      <div style={{ minHeight: "90vh",  paddingTop:'120px', paddingBottom: '50px' }}>
        <h1 className="tw-text-blue-700 tw-ml-24">Creatives</h1>
      </div>
    </>
  );
};

export default Creatives;
