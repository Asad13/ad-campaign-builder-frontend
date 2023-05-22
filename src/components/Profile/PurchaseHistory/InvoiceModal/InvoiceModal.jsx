import cns from "classnames";
import { useRef } from "react";
import ReactToPrint from "react-to-print";
import styles from "./InvoiceModal.module.scss";

const InvoiceModal = ({
  invoice,
  handleCloseInvoiceModal,
  getDateString,
  getCurrencyWithSymbol,
  shortenDescription,
}) => {
  const modal = useRef(null);

  const print = useRef(null);

  return (
    <div
      className={cns("modalContainer")}
      onClick={(event) => {
        if (modal.current && !modal.current.contains(event.target)) {
          handleCloseInvoiceModal();
        }
      }}
    >
      <div className={cns(styles.modal)} ref={modal}>
        <div className={styles.contentContainer} ref={print}>
          <div className={styles.item}>
            <h5 className={cns("heading5")}>Invoice/Receipt</h5>
            <p className={cns("bodyText2")}>Order ID: {invoice?.id}</p>
          </div>
          <div className={styles.item}>
            <div className={styles.addresses}>
              <div className={styles.addresseFrom}>
                <h6 className={cns("heading6")}>Billed from:</h6>
                {Object.entries(invoice?.billed_from).map(([key, value]) => (
                  <p
                    className={cns("bodyText2")}
                    dangerouslySetInnerHTML={{ __html: value }}
                  />
                ))}
              </div>
              <div className={styles.addresseTo}>
                <h6 className={cns("heading6")}>Billed to:</h6>
                {Object.entries(invoice?.billed_to).map(([key, value]) => (
                  <p
                    className={cns("bodyText2")}
                    dangerouslySetInnerHTML={{ __html: value }}
                  />
                ))}
              </div>
            </div>
            <div className={styles.vat_gst}>
              <p className={cns("bodyText2")}>VAT ID: {invoice?.vat_gst}</p>
            </div>
          </div>
          <div className={styles.item}>
            <div className={styles.invoiceInfos}>
              <div className={styles.invoiceInfosContent}>
                <div>
                  <h6 className={cns("heading6")}>Purchased Date</h6>
                  <p className={cns("bodyText2")}>
                    {getDateString(invoice?.date)}
                  </p>
                </div>
              </div>
              <div
                className={cns(
                  styles.invoiceInfosContent,
                  styles.invoiceInfosMethod
                )}
              >
                <div>
                  <h6 className={cns("heading6")}>Payment Method</h6>
                  <p
                    className={cns("bodyText2")}
                  >{`${invoice?.card_type} ending with ${invoice?.last4}`}</p>
                </div>
              </div>
              <div
                className={cns(
                  styles.invoiceInfosContent,
                  styles.invoiceInfosStatus
                )}
              >
                <div>
                  <h6 className={cns("heading6")}>Payment Status</h6>
                  <p className={cns("bodyText2")}>{`${invoice?.status}`}</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            {invoice?.items && invoice?.items.length > 0 && (
              <div className={cns(styles.invoiceItems)}>
                <div
                  className={cns(
                    styles.item,
                    styles.invoiceItemRows,
                    styles.invoiceItemHeadingFooter
                  )}
                >
                  <div>
                    <h6 className={cns("bodyText2")}>Qty</h6>
                  </div>
                  <div>
                    <h6 className={cns("bodyText2")}>Description</h6>
                  </div>
                  <div>
                    <h6 className={cns("bodyText2", styles.amount)}>Amount</h6>
                  </div>
                </div>
                {invoice?.items.map((item) => (
                  <div key={item?.id}>
                    <div className={cns(styles.item, styles.invoiceItemRows)}>
                      <div>
                        <p className={cns("bodyText2")}>{item?.quantity}</p>
                      </div>
                      <div>
                        <p className={cns("bodyText2", styles.description)}>
                          {`${shortenDescription(item?.description)}`}
                        </p>
                      </div>
                      <div>
                        <p
                          className={cns("bodyText2", styles.amount)}
                        >{`${getCurrencyWithSymbol(item?.currency)}${
                          item?.amount
                        }`}</p>
                      </div>
                    </div>
                    <div className={cns(styles.item, styles.invoiceItemRows)}>
                      <div>
                        <p className={cns("bodyText2")}>
                          {`${item?.tax_rate}% Tax:`}
                        </p>
                      </div>
                      <div></div>
                      <div>
                        <p
                          className={cns("bodyText2", styles.amount)}
                        >{`${getCurrencyWithSymbol(item?.currency)}${
                          item?.tax_amount
                        }`}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div
                  className={cns(
                    styles.item,
                    styles.invoiceItemRows,
                    styles.invoiceItemHeadingFooter
                  )}
                >
                  <div>
                    <p className={cns("bodyText2")}>Total</p>
                  </div>
                  <div></div>
                  <div>
                    <p
                      className={cns("bodyText2", styles.amount)}
                    >{`${getCurrencyWithSymbol(invoice?.currency)}${
                      invoice?.total
                    }`}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={cns(styles.btnContainer)}>
          <ReactToPrint
            trigger={() => <button type="button">Print</button>}
            content={() => print.current}
          />
          <button
            className={cns(styles.noBtn)}
            type="button"
            onClick={() => {
              handleCloseInvoiceModal();
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
