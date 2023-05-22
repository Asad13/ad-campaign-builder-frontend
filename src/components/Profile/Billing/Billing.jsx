import { Helmet } from "react-helmet";
import cns from "classnames";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import styles from "../Profile.module.scss";
import stylesBilling from "./Billing.module.scss";
import { ToastContainer, toast } from "react-toastify";
import { TOAST_AUTO_CLOSE_DURATION, TOAST_OPTIONS } from "@config/constants";
import Loader from "@components/UI/Loader";
import { EditIcon, TrashIcon } from "@assets/images/misc";
import { MastercardIcon, AmexIcon, VisaIcon, JCBIcon, DiscoverIcon, DinersClubIcon, UnionPayIcon } from "@assets/images/cards";
import { DeleteCardModal, TaxInfoModal, VatGstModal } from "./modals";
import {
  getAllCards,
  getCard,
  updateCardToNull,
  deleteCard,
  updateStatus,
  updateMessage,
  getTaxInfo,
  saveTaxInfo,
  saveVAT_GST,
  updateStatusTaxInfo,
  updateMessageTaxInfo,
  updateStatusVatGst,
  updateMessageVatGst,
} from "@redux/features/finance/financeSlice";

const BrandIcon = ({brand}) => {
  if(brand.toLowerCase().includes("mastercard")){
    return <MastercardIcon />
  }else if(brand.toLowerCase().includes("visa")){
    return <VisaIcon />
  }else if(brand.toLowerCase().includes("american")){
    return <AmexIcon />
  }else if(brand.toLowerCase().includes("discover")){
    return <DiscoverIcon />
  }else if(brand.toLowerCase().includes("diners")){
    return <DinersClubIcon />
  }else if(brand.toLowerCase().includes("jcb")){
    return <JCBIcon />
  }else if(brand.toLowerCase().includes("unionpay")){
    return <UnionPayIcon />
  }
}

const Billing = () => {
  const { token } = useSelector((state) => state.auth);
  const {
    cards,
    status,
    message,
    statusAllCards,
    taxInfo,
    statusTaxInfo,
    messageTaxInfo,
    statusVatGst,
    messageVatGst,
  } = useSelector((state) => state.finance);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [deleteCardId, setDeleteCardId] = useState(null);
  const [showDeleteCardModal, setShowDeleteCardModal] = useState(false);
  const [showTaxInfoModal, setShowTaxInfoModal] = useState(false);
  const [showVatGstModal, setShowVatGstModal] = useState(false);

  const toastId = useRef(null);
  const notify = (message, type = "success") => {
    if (type === "success") {
      return (toastId.current = toast.success(message, TOAST_OPTIONS));
    } else {
      return (toastId.current = toast.error(message, TOAST_OPTIONS));
    }
  };

  useEffect(() => {
    dispatch(getAllCards({ token }));
    dispatch(getTaxInfo({ token }));
    dispatch(updateCardToNull());
  }, [dispatch, token]);

  useEffect(() => {
    if (status) {
      notify(message);
    } else if (status === false) {
      notify(message, "error");
    }
    dispatch(updateStatus());
    dispatch(updateMessage());
  }, [status, message, dispatch]);

  useEffect(() => {
    if (statusTaxInfo) {
      notify(messageTaxInfo);
    } else if (statusTaxInfo === false) {
      notify(messageTaxInfo, "error");
    }
    dispatch(updateStatusTaxInfo());
    dispatch(updateMessageTaxInfo());
  }, [statusTaxInfo, messageTaxInfo, dispatch]);

  useEffect(() => {
    if (statusVatGst) {
      notify(messageVatGst);
    } else if (statusVatGst === false) {
      notify(messageVatGst, "error");
    }
    dispatch(updateStatusVatGst());
    dispatch(updateMessageVatGst());
  }, [statusVatGst, messageVatGst, dispatch]);

  const confirmDeleteCard = useCallback(
    (id) => {
      dispatch(deleteCard({ token, id }));
    },
    [dispatch, token]
  );

  const isDeleteCard = useCallback((id) => {
    setDeleteCardId(id);
    setShowDeleteCardModal(true);
  }, []);

  const editCard = useCallback(
    (id) => {
      dispatch(getCard({ token, id }));
      navigate(`/profile/edit-card/${id}`);
    },
    [dispatch, token, navigate]
  );

  const handleTaxInfo = useCallback(
    (data) => {
      dispatch(saveTaxInfo({ data, token }));
    },
    [dispatch, token]
  );

  const handleVAT_GST = useCallback(
    (data) => {
      dispatch(saveVAT_GST({ data, token }));
    },
    [dispatch, token]
  );

  return (
    <>
      <Helmet>
        <title>Campaign Builder - Billing</title>
      </Helmet>
      {showDeleteCardModal && (
        <DeleteCardModal
          setShowModal={setShowDeleteCardModal}
          id={deleteCardId}
          setDeleteCardId={setDeleteCardId}
          confirmDeleteCard={confirmDeleteCard}
        />
      )}
      {showTaxInfoModal && (
        <TaxInfoModal
          setShowModal={setShowTaxInfoModal}
          taxInfo={taxInfo}
          save={handleTaxInfo}
        />
      )}
      {showVatGstModal && (
        <VatGstModal
          setShowModal={setShowVatGstModal}
          taxInfo={taxInfo}
          save={handleVAT_GST}
        />
      )}
      <div className={cns(styles.container)}>
        <ToastContainer
          position="top-right"
          autoClose={TOAST_AUTO_CLOSE_DURATION}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <h4 className={cns("heading4", styles.item)}>Billing</h4>
        <div className={cns(stylesBilling.allPaymentMethodsSection)}>
          <h5 className={cns("campaignSubHeading")}>Payment Methods</h5>
          <div className={cns(stylesBilling.allPaymentMethodsContainer)}>
            {statusAllCards === null ? (
              <Loader />
            ) : cards?.length === 0 ? (
              <p className={cns("bodyText1", "empty")}>No Cards</p>
            ) : (
              cards.map((card, index) => (
                <div key={index} className={cns(stylesBilling.card)}>
                  <span className={cns(stylesBilling.cardIconContainer)}>
                    <BrandIcon brand={card?.brand} />
                  </span>
                  <div className={cns(stylesBilling.cardContentContainer)}>
                    <h6 className={cns("heading6")}>
                      {card?.brand} ending in {card?.last4}
                    </h6>
                    <p className={cns("bodyText2")}>Expires: {card?.exp}</p>
                  </div>
                  <span
                    className={cns("bodyText2", stylesBilling.defaultStatus)}
                  >
                    {card?.isDefault ? "Default card" : "Backup card"}
                  </span>
                  <div className={cns(stylesBilling.cardBtns)}>
                    <button
                      type="button"
                      onClick={() => {
                        editCard(card?.id);
                      }}
                    >
                      <span>
                        <EditIcon />
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        isDeleteCard(card?.id);
                      }}
                    >
                      <span>
                        <TrashIcon />
                      </span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className={cns(stylesBilling.addnewPaymentMethodBtnContainer)}>
            <Link
              to="/profile/add-card"
              className={cns(
                "primaryBtn",
                stylesBilling.addnewPaymentMethodBtn
              )}
            >
              Add Payment Method
            </Link>
          </div>
        </div>
        <div className={cns(stylesBilling.taxInfoSection)}>
          <div>
            <h6 className={cns("campaignSubHeading")}>Tax Information</h6>
            <p className={cns("bodyText2")}>
              Enter the business address you want on your invoice.
            </p>
          </div>
          <div className={cns(stylesBilling.taxInfoContainer)}>
            <div className={cns(stylesBilling.taxInfo)}>
              <div>
                {(taxInfo === null || !taxInfo?.name) ? (
                  <h6>No tax information</h6>
                ) : (
                  <div>
                    <h6>{taxInfo?.name ?? ""}</h6>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: taxInfo?.address_line_one ?? "",
                      }}
                    />
                    <p
                      dangerouslySetInnerHTML={{
                        __html: taxInfo?.address_line_two ?? "",
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setShowTaxInfoModal(true);
                  }}
                >
                  <span>
                    <EditIcon />
                  </span>
                </button>
              </div>
            </div>
            <div className={cns(stylesBilling.vatGst)}>
              <p>{taxInfo?.vat_gst ? taxInfo?.vat_gst : "No VAT/GST number on file."}</p>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setShowVatGstModal(true);
                  }}
                >
                  <span>{taxInfo?.vat_gst ? "Edit" : "Add a"}{" "} VAT/GST number</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Billing;
