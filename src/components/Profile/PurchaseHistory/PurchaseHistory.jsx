import { Helmet } from "react-helmet";
import cns from "classnames";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactPaginate from "react-paginate";
import CurrencyList from 'currency-list'
import styles from "../Profile.module.scss";
import stylesPurchase from "./PurchaseHistory.module.scss";
import Loader from "@components/UI/Loader";
import InvoiceModal from "./InvoiceModal";
import {
  getAllInvoices,
  getInvoice,
  updateStatusInvoice,
  updateMessageInvoice,
  updateInvoice,
} from "@redux/features/finance/financeSlice";
import {
  INVOICES_PER_PAGE,
  PAGINATION_RANGE_DISPLAYED,
} from "@config/constants";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getDateString(dateValue = Date.now()) {
  const date = new Date(dateValue);
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function getCurrencyWithSymbol(currency = "usd"){
  const currencyObj = CurrencyList.get(currency.toUpperCase());
  return currencyObj.code + " " + currencyObj.symbol;
}

function shortenDescription(description){
  return description.length > 50 ? description.substring(0,47) + "..." : description;
}

function shortenInvoiceId(invoiceId){
  return invoiceId.substring(3);
}

const PurchaseHistory = () => {
  const { token } = useSelector((state) => state.auth);
  const {
    numberOfInvoices,
    invoices,
    statusAllInvoices,
    invoice,
    statusInvoice,
  } = useSelector((state) => state.finance);

  const dispatch = useDispatch();
  const [showInvoiceModalLoader, setShowInvoiceModalLoader] = useState(false);

  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(
    Math.ceil(numberOfInvoices / INVOICES_PER_PAGE)
  );

  useEffect(() => {
    dispatch(getAllInvoices({ token, page }));
  }, [dispatch, token, page]);

  useEffect(() => {
    if (statusInvoice !== null && invoice !== null) {
      setShowInvoiceModalLoader(false);
    }
  }, [statusInvoice, invoice]);

  useEffect(() => {
    setPageCount(Math.ceil(numberOfInvoices / INVOICES_PER_PAGE));
  }, [numberOfInvoices]);

  const handlePageClick = useCallback((event) => {
    setPage(event.selected + 1);
  }, []);

  const handleInvoice = useCallback(
    (id) => {
      setShowInvoiceModalLoader(true);
      dispatch(getInvoice({ token, id }));
    },
    [dispatch, token]
  );

  const handleCloseInvoiceModal = useCallback(() => {
    dispatch(updateStatusInvoice());
    dispatch(updateMessageInvoice());
    dispatch(updateInvoice());
  }, [dispatch]);

  return (
    <>
      <Helmet>
        <title>Campaign Builder - Purchase History</title>
      </Helmet>
      {showInvoiceModalLoader && (
        <div className={cns("dataLoadingLoaderConatiner")}>
          <Loader />
        </div>
      )}
      {statusInvoice && (
        <InvoiceModal
          invoice={invoice}
          handleCloseInvoiceModal={handleCloseInvoiceModal}
          getDateString={getDateString}
          getCurrencyWithSymbol={getCurrencyWithSymbol}
          shortenDescription={shortenDescription}
        />
      )}
      <div className={cns(styles.container,stylesPurchase.outerContainer)}>
        <h4 className={cns("heading4")}>Purchase History</h4>
        {statusAllInvoices === null ? (
          <Loader />
        ) : (
          <div
            className={cns(
              "section-container",
              stylesPurchase.contentContainer
            )}
          >
            {invoices.length === 0 && (
              <p className={cns("bodyText1", "empty")}>
                No purchase is made yet
              </p>
            )}
            {invoices.length > 0 && (
              <div>
                <div className={cns(stylesPurchase.purchases)}>
                  <div
                    className={cns(styles.item, stylesPurchase.purchaseRows)}
                  >
                    <div>
                      <h6 className={cns("bodyText2")}>Date</h6>
                    </div>
                    <div>
                      <h6 className={cns("bodyText2")}>Description</h6>
                    </div>
                    <div>
                      <h6 className={cns("bodyText2")}>Total</h6>
                    </div>
                    <div>
                      <h6 className={cns("bodyText2")}>Receipt</h6>
                    </div>
                  </div>
                  {invoices.map((item) => (
                    <div
                      className={cns(styles.item, stylesPurchase.purchaseRows)}
                      key={item?.id}
                    >
                      <div>
                        <p className={cns("bodyText2")}>
                          {getDateString(item?.date)}
                        </p>
                      </div>
                      <div>
                        <p
                          className={cns(
                            "bodyText2",
                            stylesPurchase.description
                          )}
                        >
                          {`${shortenDescription(item?.description)}`}
                        </p>
                      </div>
                      <div>
                        <p className={cns("bodyText2")}>{`${getCurrencyWithSymbol(item?.currency)}${item?.total}`}</p>
                      </div>
                      <div>
                        <button
                          type="button"
                          className={cns("bodyText2", stylesPurchase.receipt)}
                          onClick={() => {
                            handleInvoice(item?.id);
                          }}
                        >
                          {`${shortenInvoiceId(item?.id)}`}
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className={cns(stylesPurchase.paginationContainer)}>
                    <ReactPaginate
                      containerClassName={cns("pagination")}
                      previousLinkClassName={cns(
                        "pagination__link",
                        "pagination__link--prev"
                      )}
                      nextLinkClassName={cns(
                        "pagination__link",
                        "pagination__link--next"
                      )}
                      pageClassName={"pagination__link--page"}
                      breakClassName={cns(
                        "pagination__link--page",
                        "pagination__link--break"
                      )}
                      activeClassName={"pagination__link--active"}
                      breakLabel="..."
                      nextLabel="next &rarr;"
                      onPageChange={handlePageClick}
                      pageRangeDisplayed={PAGINATION_RANGE_DISPLAYED}
                      marginPagesDisplayed={PAGINATION_RANGE_DISPLAYED}
                      pageCount={pageCount}
                      previousLabel="&larr; previous"
                      renderOnZeroPageCount={null}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default PurchaseHistory;
