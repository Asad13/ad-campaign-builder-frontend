import { Link } from "react-router-dom";
import cns from "classnames"
import styles from "./ConfirmEmailComp.module.scss";

const ConfirmEmailComp = () => {
    return (
        <div className={styles.container}>
            <div>
                <h2 className={cns("heading2")}>Please verify your email address</h2>
                <p className={cns("heading5")}>Check your email account for the verification email we just sent you.</p>
                <Link to="/login" className={cns("buttonText")}>Login</Link>
            </div>
        </div>
    )
}

export default ConfirmEmailComp;