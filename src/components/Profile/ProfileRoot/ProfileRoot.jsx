import { Helmet } from "react-helmet";
import cns from "classnames";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateUser,
  updateProfileMessage,
} from "@redux/features/auth/authSlice";
import styles from "../Profile.module.scss";
import stylesRoot from "./ProfileRoot.module.scss";
import Avatar from "@assets/images/profile/avatar.png";
import { EmailIcon } from "@assets/images/profile";
import Select from "react-select";
import availCategories from "@assets/data/categories";
import DeleteImageModal from "./DeleteImageModal";
import { ToastContainer, toast } from "react-toastify";
import { TOAST_AUTO_CLOSE_DURATION, TOAST_OPTIONS } from "@config/constants";
import { GOOGLE_MAPS_API_KEY } from "@config/constants";
import DynamicMap from "../../Map/DynamicMap";
import { useLoadScript } from "@react-google-maps/api";
import { Autocomplete } from "@react-google-maps/api";
import { AddIcon } from "../../../assets/images/misc";
import DeleteIcon from "../../../assets/images/deleteIcon.svg";
import _ from "lodash";
import useDebounce from "../../../hooks/useDebounce";
import DeleteAddressModal from "../../Campaign/DeleteAddressModal/DeleteAddressModal";

document.addEventListener("wheel", function (event) {
  if (
    document.activeElement.type === "number" &&
    document.activeElement.classList.contains("noscroll")
  ) {
    document.activeElement.blur();
  }
});

const formFields = [
  {
    id: "name",
    type: "text",
    label: "Owner",
    errorMsgs: {
      empty: "Please enter your name",
    },
  },
  {
    id: "company_name",
    type: "text",
    label: "Company Name",
    errorMsgs: {
      empty: "Please enter your company's name",
    },
  },
  {
    id: "email",
    type: "email",
    label: "Email",
    icon: EmailIcon,
  },
  {
    id: "category_id",
    type: "select",
    errorMsgs: {
      empty: "Please select a category",
    },
  },
  {
    id: "subcategory_id",
    type: "select",
    errorMsgs: {
      empty: "Please select a subcategory",
    },
  },
];

const errorMsgsAddress = {
  address: {
    empty: "Address is required",
  },
  town: {
    empty: "Town is required",
  },
  state: {
    empty: "State is required",
  },
  postcode: {
    empty: "Postcode is required",
  },
};

const initialAddress = [{ id: 0, address: "", lat: "", lng: "" }];

const initialAddressError = {
  address: "",
  town: "",
  state: "",
  postcode: "",
};

const libraries = ["geometry", "drawing", "places"];

const ProfileRoot = () => {
  let selectedCategoryValue = "";
  let selectedSubCategoryValue = "";
  let selectedSubCategories = "";
  const { user, token, status, profileMessage } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const profileImage = useRef(null);

  const { isLoaded } = useLoadScript({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const [showDeleteModal, setShowDeleteModal] = useState({
    show: false,
    id: null,
    address: null,
  });
  const [newProfilePic, setNewProfilePic] = useState("");
  const [deleteAddressId, setDeleteAddressId] = useState("");
  const [drawOnMap, setDrawOnMap] = useState(false);
  const [address1Place, setAddress1Place] = useState([]);
  const [addressesErrors, setAddressesErrors] = useState([
    { ...initialAddressError },
  ]);
  const [getAllAddress, setGetAllAddress] = useState([...initialAddress]);
  const [trigger, setTrigger] = useState(0);
  const [clicked, setClicked] = useState(false);
  const [subcategories, setSubCategories] = useState(selectedSubCategories);
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    selectedSubCategoryValue
  );
  const [category, setCategory] = useState(selectedCategoryValue);
  const [profileData, setProfileData] = useState({
    name: user?.name ?? "",
    company_name: user?.company_name ?? "",
    profile_pic: user?.imageUrl ?? "",
    email: user?.email ?? "",
    category_id: user?.category_id ?? "",
    subcategory_id: user?.subcategory_id ?? "",
  });

  const [errorMsgProfileData, seterrorMsgProfileData] = useState({
    name: "",
    company_name: "",
    email: "",
    category_id: "",
    subcategory_id: "",
    address: "",
  });

  const [reset, setReset] = useState(false);

  const [showDeleteImageDialogue, setShowDeleteImageDialogue] = useState(false);
  const debouncedgetAllAddress = useDebounce(getAllAddress, 1000);
  const toastId = useRef(null);

  const notify = (message, type = "success") => {
    if (type === "success") {
      return (toastId.current = toast.success(message, TOAST_OPTIONS));
    } else {
      return (toastId.current = toast.error(message, TOAST_OPTIONS));
    }
  };

  useEffect(() => {
    const tempAddress = user?.address ? user?.address : [...initialAddress];
    if (tempAddress.length > 0) {
      setGetAllAddress(tempAddress);
    }
  }, [user?.address]);

  useEffect(() => {
    if (user?.category_id) {
      const selectedCategoryItem = availCategories.find(
        (item) => item.value.substring(1) === user?.category_id
      );
      const selectedSubCategories = selectedCategoryItem?.subcategories;
      const selectedCategoryValue = {
        value: selectedCategoryItem.value,
        label: selectedCategoryItem.label,
      };
      setCategory(selectedCategoryValue)
      setSubCategories(selectedSubCategories)
  
      if (user?.subcategory_id) {
        const selectedSubCategoryItem = selectedSubCategories.find(
          (item) => item.value === user?.subcategory_id
        );
        const selectedSubCategoryValue = {
          value: selectedSubCategoryItem.value,
          label: selectedSubCategoryItem.label,
        };
        setSelectedSubcategory(selectedSubCategoryValue)
      }
    }
  }, [user?.category_id, user?.subcategory_id]);

  useEffect(() => {
    if (profileMessage) {
      if (status) {
        notify(profileMessage);
      } else {
        notify(profileMessage, "error");
      }
      dispatch(updateProfileMessage());
    }
  }, [profileMessage]);

  useEffect(() => {
    const selectedCategory = availCategories.find(
      (item) => item.value === category.value
    );
    if (clicked && !reset) setSelectedSubcategory("");
    setSubCategories(selectedCategory?.subcategories);
  }, [category, clicked]);

  const deleteImageDialogueBox = () => {
    setShowDeleteImageDialogue(true);
  };

  const addAddress = () => {
    const checkAddresses = getAllAddress.some((obj) => !obj["address"]);
    seterrorMsgProfileData({ ...errorMsgProfileData, address: "" });
    let maxId = getAllAddress.reduce((max, obj) => {
      return obj.id > max ? obj.id : max;
    }, 0);
    if (!checkAddresses) {
      const tempGetAllAddress = [...getAllAddress];
      tempGetAllAddress.push({
        id: maxId + 1,
        lat: null,
        lng: null,
        address: "",
      });
      setTrigger((trigger) => trigger + 1);
      setGetAllAddress(tempGetAllAddress);
    } else {
      seterrorMsgProfileData({
        ...errorMsgProfileData,
        address: "Please fill up the address first!",
      });
    }
  };

  const deleteImage = () => {
    profileImage.current = null;
    setProfileData({
      ...profileData,
      profile_pic: "",
    });
    setNewProfilePic("");
    notify("Profile image is removed. Save new information.");
  };

  const deleteAddress = (id, index, address) => {
    setShowDeleteModal({ show: true, id: index, address });
    setDeleteAddressId(id);
  };
  const confirmDeleteAddress = () => {
    var tempGetAllAddress = [...getAllAddress];
    seterrorMsgProfileData({ ...errorMsgProfileData, address: "" });
    tempGetAllAddress = tempGetAllAddress.filter(
      (d) => d.id != deleteAddressId
    );
    setGetAllAddress([...tempGetAllAddress]);
  };

  useEffect(() => {
    seterrorMsgProfileData({ ...errorMsgProfileData, address: "" });
  }, [getAllAddress]);

  const showErrorMsg = (event) => {
    if (!event.target.value) {
      const formField = formFields.find(
        (field) => field.id === event.target.name
      );
      seterrorMsgProfileData({
        ...errorMsgProfileData,
        [event.target.name]: formField.errorMsgs.empty,
      });
    } else {
      seterrorMsgProfileData({
        ...errorMsgProfileData,
        [event.target.name]: "",
      });
    }
  };

  const showErrors = () => {
    const newErrorMsgProfileData = { ...errorMsgProfileData };
    for (const property in profileData) {
      if (property !== "email" && property !== "profile_pic") {
        if (!profileData[property]) {
          const formField = formFields.find((field) => field.id === property);
          newErrorMsgProfileData[property] = formField.errorMsgs.empty;
        }
      }
    }
    seterrorMsgProfileData({ ...newErrorMsgProfileData });
  };

  const handleBlur = (event) => {
    showErrorMsg(event);
  };

  const handleChange = (event) => {
    if (event.target.type === "file") {
      setNewProfilePic(event.target.files[0]);
      notify("Profile image is uploaded. Save new information.");
    }
    setProfileData({
      ...profileData,
      [event.target.name]: event.target.value,
    });

    showErrorMsg(event);
  };

  const validate = () => {
    for (const property in profileData) {
      if (property !== "email" && property !== "profile_pic") {
        if (!profileData[property]) {
          return false;
        }
      }
    }

    return true;
  };

  const handleReset = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setReset(true);

    setProfileData({
      name: user?.name ?? "",
      company_name: user?.company_name ?? "",
      profile_pic: user?.imageUrl ?? "",
      email: user?.email ?? "",
      category_id: user?.category_id ?? "",
      subcategory_id: user?.subcategory_id ?? "",
    });
    setGetAllAddress({
      address: user?.address ?? [...initialAddress],
    });
    setCategory(selectedCategoryValue);
    setSelectedSubcategory(selectedSubCategoryValue);

    seterrorMsgProfileData({
      name: "",
      company_name: "",
      email: "",
      category_id: "",
      subcategory_id: "",
    });
  };

  const handleSubmit = (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (validate()) {
      const formData = new FormData();
      for (const property in profileData) {
        if (property !== "email") {
          if (property !== "profile_pic") {
            formData.append(property, profileData[property]);
          } else {
            if (newProfilePic) {
              formData.append(property, newProfilePic);
            } else if (profileData["profile_pic"] !== "") {
              formData.append(property, profileData[property]);
            }
          }
        }
      }
      formData.append("address", JSON.stringify(getAllAddress));
      dispatch(updateUser({ formData, token }));

      seterrorMsgProfileData({
        name: "",
        company_name: "",
        email: "",
        category_id: "",
        subcategory_id: "",
        address: "",
      });
    } else {
      showErrors();
    }
  };
  return (
    <>
      <Helmet>
        <title>Campaign Builder - Profile</title>
      </Helmet>
      {showDeleteImageDialogue && (
        <DeleteImageModal
          setShowModal={setShowDeleteImageDialogue}
          deleteImage={deleteImage}
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
        <h4 className={cns("heading4", styles.item)}>Profile</h4>
        <div className={cns(styles.item)}>
          <h6 className={cns("heading6")}>Personal info</h6>
          <p className={cns("bodyText2")}>
            Update your photo and personal details here.
          </p>
        </div>
        <form
          autoComplete="off"
          noValidate
          // onSubmit={(e)=>{e.preventDefault()}}
        >
          <div className={cns(styles.item, styles.formItem)}>
            <div className={styles.left}>
              <h6 className={cns("heading6")}>Your photo</h6>
              <p className={cns("bodyText2")}>
                This will be displayed on your profile.
              </p>
            </div>
            <div className={styles.right}>
              <span className={cns("profileImage", stylesRoot.image)}>
                <img
                  ref={profileImage}
                  src={
                    newProfilePic
                      ? URL.createObjectURL(newProfilePic)
                      : profileData.profile_pic
                      ? profileData.profile_pic
                      : Avatar
                  }
                  alt={user?.name || "Owner"}
                />
              </span>
              <button
                type="button"
                className={cns("heading6")}
                onClick={deleteImageDialogueBox}
              >
                Delete
              </button>
              <label
                htmlFor="profile_pic"
                className={cns("heading6", stylesRoot.profilePicLabel)}
              >
                {user?.imageUrl ? "Update" : "Upload"}
              </label>
              <input
                type="file"
                className={cns(stylesRoot.file)}
                onChange={handleChange}
                id="profile_pic"
                name="profile_pic"
                accept="image/jpg, image/png, image/jpeg"
              />
            </div>
          </div>
          {formFields.map((field) => {
            if (field.id !== "category_id" && field.id !== "subcategory_id") {
              return (
                <div
                  key={field.id}
                  className={cns(styles.formItem, stylesRoot.formItemRoot)}
                >
                  <div className={styles.left}>
                    <label htmlFor={field.id} className={cns("heading6")}>
                      {field.label}
                    </label>
                  </div>
                  <div className={styles.right}>
                    {field.icon && (
                      <span className={cns(stylesRoot.emailIcon)}>
                        <field.icon />
                      </span>
                    )}
                    <input
                      type={field.type}
                      className={cns(
                        "input",
                        "bodyText2",
                        errorMsgProfileData[field.id] ? "form-field-error" : ""
                      )}
                      id={field.id}
                      name={field.id}
                      placeholder={field.label}
                      value={profileData[field.id]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={field.id === "email" ? true : false}
                      tabIndex={field.id === "email" ? -1 : 0}
                    />
                    {field.id !== "email" && (
                      <span className="error-msg">
                        {errorMsgProfileData[field.id]}
                      </span>
                    )}
                  </div>
                </div>
              );
            } else {
              return null;
            }
          })}
          <div
            className={cns(styles.formItem, stylesRoot.formItemRoot)}
            style={{
              display: "block",
              marginTop: "0",
              paddingBottom: "0",
              paddingTop: "0",
            }}
          >
            <div className={styles.locationrootwrap}>
              <div className={styles.locationroottop}>
                <label>Business Locations</label>
                <div className={styles.locationroottopparagraph}>
                  Choose Location by Searching or enter the co-ordinates
                </div>
              </div>
              <div className={styles.locationroot}>
                <div
                  className={styles.left}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "25px",
                  }}
                >
                  {getAllAddress?.length > 0 &&
                    getAllAddress?.map((addressItem, index) => (
                      <label
                        htmlFor="address1"
                        className={cns("heading6")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          height: "50px",
                        }}
                      >
                        Address {index + 1}
                      </label>
                    ))}
                </div>
                <div
                  className={styles.right}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "25px",
                  }}
                >
                  {getAllAddress?.map((addressItem, index) => (
                    <div className={styles.customaddressrelative} key={index}>
                      <div>
                        {window.google && (
                          <div className={styles.customaddress}>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <Autocomplete
                                onLoad={(event) => {
                                  setAddress1Place((address1Place) => [
                                    ...address1Place,
                                    { data: event },
                                  ]);
                                }}
                                onPlaceChanged={() => {
                                  if (address1Place?.[index]?.data !== null) {
                                    const place =
                                      address1Place?.[index]?.data?.getPlace();
                                    const newAddresses = [...getAllAddress];
                                    newAddresses[index].address =
                                      place?.formatted_address;
                                    setGetAllAddress([...newAddresses]);
                                    setTrigger(trigger + 1);
                                  }
                                }}
                              >
                                <input
                                  type="text"
                                  className={cns("input", "bodyText2", {
                                    "form-field-error":
                                      addressesErrors?.[index]?.address && true,
                                  })}
                                  id={`address${index + 1}`}
                                  name={`address${index + 1}`}
                                  placeholder={`Address ${index + 1}`}
                                  value={addressItem?.address}
                                  // disabled={latLngDisabled[index]}
                                  onChange={(event) => {
                                    const newAddresses = [...getAllAddress];
                                    newAddresses[index].address =
                                      event.target.value;
                                    setGetAllAddress([...newAddresses]);
                                  }}
                                />
                              </Autocomplete>
                              {getAllAddress.length - 1 === index &&
                                errorMsgProfileData?.address && (
                                  <span className="error-msg">
                                    {errorMsgProfileData?.address}
                                  </span>
                                )}
                            </div>
                            <div style={{ textAlign: "center" }}>OR</div>
                            <input
                              type="text"
                              className={cns("input", "bodyText2")}
                              id={`Lattitude${index + 1}`}
                              name={`Lattitude${index + 1}`}
                              placeholder={`Lattitude ${index + 1}`}
                              value={addressItem?.lat}
                              // disabled={addressDisabled[index]}
                              onChange={(event) => {
                                setGetAllAddress((prevLatLng) => {
                                  const newLatLng = [...prevLatLng];
                                  newLatLng[index] = {
                                    ...newLatLng[index],
                                    lat: event.target.value,
                                    address: "",
                                  };
                                  return newLatLng;
                                });
                                if (getAllAddress[index]?.lng) {
                                  setTrigger((trigger) => trigger + 1);
                                }
                              }}
                              onBlur={(event) => {
                                setGetAllAddress((prevLatLng) => {
                                  const newLatLng = [...prevLatLng];
                                  newLatLng[index] = {
                                    ...newLatLng[index],
                                    lat: event.target.value,
                                    address: "",
                                  };
                                  return newLatLng;
                                });
                              }}
                            />
                            <input
                              type="text"
                              className={cns("input", "bodyText2")}
                              id={`Longitude${index + 1}`}
                              value={addressItem?.lng}
                              name={`Longitude${index + 1}`}
                              placeholder={`Longitude ${index + 1}`}
                              onChange={(event) => {
                                setGetAllAddress((prevLatLng) => {
                                  const newLatLng = [...prevLatLng];
                                  newLatLng[index] = {
                                    ...newLatLng[index],
                                    lng: event.target.value,
                                    address: "",
                                  };
                                  return newLatLng;
                                });
                                if (getAllAddress[index]?.lat) {
                                  setTrigger((trigger) => trigger + 1);
                                }
                              }}
                              onBlur={(event) => {
                                setGetAllAddress((prevLatLng) => {
                                  const newLatLng = [...prevLatLng];
                                  newLatLng[index] = {
                                    ...newLatLng[index],
                                    lng: event.target.value,
                                  };
                                  return newLatLng;
                                });
                              }}
                            />
                          </div>
                        )}
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          className={styles.deletebutton}
                          onClick={() =>
                            deleteAddress(
                              addressItem.id,
                              index + 1,
                              addressItem?.address
                            )
                          }
                        >
                          <img src={DeleteIcon} alt="" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className={cns("subHeading", stylesRoot.btnAddAddressnew)}
                onClick={() => addAddress()}
              >
                <AddIcon />
                <span>Add another address</span>
              </button>
              <div className={cns(styles.rightMap)}>
                <div className={cns(styles.mapContainer)}>
                  <DynamicMap
                    trigger={trigger}
                    debouncedgetAllAddress={debouncedgetAllAddress}
                    getAllAddress={getAllAddress}
                    setGetAllAddress={setGetAllAddress}
                    isLoaded={isLoaded}
                    drawOnMap={drawOnMap}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={cns(styles.formItem, stylesRoot.formItemRoot)}>
            <div className={styles.left}>
              <h6 className={cns("heading6")}>Sector</h6>
            </div>
            <div
              className={cns(
                styles.right,
                styles.rightResponsive,
                stylesRoot.selectsContainer
              )}
            >
              <div className={cns(stylesRoot.selectContainer)}>
                <Select
                  className={cns(
                    stylesRoot.select,
                    errorMsgProfileData["category_id"] ? "form-field-error" : ""
                  )}
                  placeholder="Choose a Category"
                  getValue={() => profileData.category_id}
                  value={category}
                  name="category_id"
                  onChange={(event) => {
                    setClicked(true);
                    setCategory(event);
                    setProfileData({
                      ...profileData,
                      category_id: event.value.substring(1),
                    });
                    seterrorMsgProfileData({
                      ...errorMsgProfileData,
                      category_id: "",
                    });
                  }}
                  options={availCategories.map((item) => ({
                    value: item.value,
                    label: item.label,
                  }))}
                  theme={(theme) => ({
                    ...theme,
                    borderRadius: "8px",
                    colors: {
                      ...theme.colors,
                      primary: "#B69538",
                    },
                  })}
                  styles={{
                    control: (css, state) => ({
                      ...css,
                      backgroundColor: "#f1f1f1",
                      width: "250px",
                      border: "1px solid transparent",
                      cursor: "pointer",
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: "#B69538 !important",
                      fontWeight: "700 !important",
                    }),
                  }}
                />
                <span className="error-msg">
                  {errorMsgProfileData["category_id"]}
                </span>
              </div>
              <div className={cns(stylesRoot.selectContainer)}>
                <Select
                  className={cns(
                    stylesRoot.select,
                    errorMsgProfileData["subcategory_id"]
                      ? "form-field-error"
                      : ""
                  )}
                  placeholder="Choose a Subcategory"
                  getValue={() => profileData.subcategory_id}
                  name="subcategory_id"
                  value={selectedSubcategory}
                  onChange={(event) => {
                    setSelectedSubcategory(event);
                    setProfileData({
                      ...profileData,
                      subcategory_id: event.value,
                    });
                    if (event.value) {
                      seterrorMsgProfileData({
                        ...errorMsgProfileData,
                        subcategory_id: "",
                      });
                    }
                  }}
                  options={
                    subcategories &&
                    subcategories.map((item) => ({
                      value: item.value,
                      label: item.label,
                    }))
                  }
                  theme={(theme) => ({
                    ...theme,
                    borderRadius: "8px",
                    colors: {
                      ...theme.colors,
                      primary: "#B69538",
                    },
                  })}
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      backgroundColor: "#f1f1f1",
                      width: "250px",
                      border: "1px solid transparent",
                      cursor: "pointer",
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: "#B69538 !important",
                      fontWeight: "700 !important",
                    }),
                  }}
                />
                <span className="error-msg">
                  {errorMsgProfileData["subcategory_id"]}
                </span>
              </div>
            </div>
          </div>
          <div className={cns(styles.formBtns)}>
            <button
              type="reset"
              className={cns("buttonText", "formBtn")}
              onClick={handleReset}
            >
              Reset
            </button>
            <button
              type="button"
              className={cns("buttonText", "formBtn")}
              onClick={handleSubmit}
            >
              Save
            </button>
          </div>
        </form>
        <DeleteAddressModal
          setShowModal={setShowDeleteModal}
          showModal={showDeleteModal.show}
          id={showDeleteModal.id}
          address={showDeleteModal.address}
          deleteAddres={confirmDeleteAddress}
        />
      </div>
    </>
  );
};

export default ProfileRoot;
