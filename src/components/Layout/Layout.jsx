import Header from "./Header/Header";
import Footer from "./Footer/Footer";

const Layout = ({ user, token, children }) => {
  return (
    <>
      {token && <Header user={user} token={token} />}
      <main style={{paddingTop: token ? '0' : null}}>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
