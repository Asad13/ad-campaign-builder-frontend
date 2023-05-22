import cns from "classnames"
import styles from "./ResetPasswordEmailComp.module.scss";

const ResetPasswordEmailComp = () => {
    return (
        <div className={styles.container}>
            <div>
                <h2 className={cns("heading2")}>An email is sent to you to reset your password</h2>
                <p className={cns("heading5")}>Check your email account and click on th link to reset your password</p>
            </div>
        </div>
    )
}

export default ResetPasswordEmailComp;