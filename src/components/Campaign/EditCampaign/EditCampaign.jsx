import { Helmet } from "react-helmet";
import cns from "classnames";
import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLoadScript } from "@react-google-maps/api";
import { useParams, useNavigate } from "react-router-dom";
import CurrencyInput from "react-currency-input-field";
import Select from "react-select";
import { Autocomplete } from "@react-google-maps/api";
import CampaignModal from "../CampaignModal";
import SideBar from "@components/Layout/SideBar";
import styles from "../Campaign.module.scss";
import stylesEdit from "./EditCampaign.module.scss";
import Map from "@components/Map";
import ReactTooltip from "react-tooltip";
import { ToastContainer, toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import Loader from "../../UI/Loader";
import {
  updateCampaign,
  getCampaign,
  deleteCampaign,
  updateStatusEditCampaign,
  updateStatusDeleteCampaign,
} from "@redux/features/campaign/campaignSlice";
import {
  AddIcon,
  ExtLinkIcon,
  SelectIcon,
  MoreInfoIcon,
  InfoIcon,
  UploadsIcon,
  FileIcon,
  ImageIcon,
  VideoIcon,
  TrashIcon,
  UploadingIcon,
  CaretDownIcon,
} from "../../../assets/images/misc";
import { CloseIcon } from "@assets/images/sidebar";
import {
  NewIcon,
  ScreenIcon,
  SchedulingIcon,
  BudgetIcon,
  UploadIcon,
} from "@assets/images/sidebar/campaign";
import availCategories from "@assets/data/categories";
import {
  BASE_URL,
  COST_PER_PERSON,
  MAP_CIRCLE_MINIMUM_RADIUS,
  MAP_CIRCLE_RADIUS_STEP,
  MAP_CIRCLE_MAXIMUM_RADIUS_ML,
  MAP_CIRCLE_MAXIMUM_RADIUS_KM,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  TOAST_AUTO_CLOSE_DURATION,
  EXT_LINK_HELP_CREATE_FIRST_CAMPAIGN,
  EXT_LINK_UNDERSTAND_CATEGORY_SELECTION,
  EXT_LINK_UPLOAD_SPECIFICATIONS,
  EXT_LINK_AD_BUILDER,
  EXT_LINK_CREATIVE_SPECS,
  EXT_LINK_PLATFORM_POLICY,
  GOOGLE_MAPS_DEFAULT_LAT,
  GOOGLE_MAPS_DEFAULT_LNG,
  SCREEN_SELECTION_BY_TARGETS,
  SCREEN_SELECTION_BY_RADIUS,
  SCREEN_SELECTION_BY_AREA,
  GOOGLE_MAPS_API_KEY,
} from "@config/constants";
import axios from "axios";
import DeleteImageModal from "../DeleteImageModal";
import DeleteCampaignModal from "../DeleteCampaignModal";

const sideNavItems = [
  {
    value: "New Campaign",
    path: "#newCampaign",
    icon: NewIcon,
    isHash: true,
  },
  {
    value: "Screen Selection",
    path: "#screenSelection",
    icon: ScreenIcon,
    isHash: true,
  },
  {
    value: "Scheduling",
    path: "#scheduling",
    icon: SchedulingIcon,
    isHash: true,
  },
  {
    value: "Budget",
    path: "#budget",
    icon: BudgetIcon,
    isHash: true,
  },
  {
    value: "Upload",
    path: "#upload",
    icon: UploadIcon,
    isHash: true,
  },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const errorMsgs = {
  name: {
    empty: "Campaign name is required",
  },
  categories: {
    empty: "Select at least one category",
  },
  publish_dates: {
    empty: "Select a start and a end date",
  },
  weekdays: {
    empty: "Select at least one day of the week",
  },
  play_times: {
    empty: "Select at least one start time and end time",
  },
  budget: {
    empty: "Provide daily budget or choose number of people",
  },
  creatives: {
    empty: "No images/videos has been attached",
  },
};

function setAriaControls(tab, value) {
  return {
    id: `${tab}-tab-${value}`,
    "aria-controls": `${tab}-tabpanel-${value}`,
  };
}

function getRadiusPercentage(radius, metric) {
  let percentage = (Number(radius) - Number(MAP_CIRCLE_MINIMUM_RADIUS)) * 100;
  if (metric === "ml") {
    percentage =
      percentage /
      (Number(MAP_CIRCLE_MAXIMUM_RADIUS_ML) -
        Number(MAP_CIRCLE_MINIMUM_RADIUS));
  } else {
    percentage =
      percentage /
      (Number(MAP_CIRCLE_MAXIMUM_RADIUS_KM) -
        Number(MAP_CIRCLE_MINIMUM_RADIUS));
  }

  return percentage;
}

function getDate(newDate = Date.now(), time = 0) {
  const date = new Date(newDate + time * 86400000);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}-${month < 10 ? "0" : ""}${month}-${
    day < 10 ? "0" : ""
  }${day}`;
}

function getTime(newTime, inc = 0) {
  let hour = Number(newTime.substring(0, 2)) + inc;

  return `${hour < 10 ? "0" : ""}${hour}:${newTime.substring(3)}`;
}

function getSize(size) {
  if (size < 1000) {
    return `${size} B`;
  } else if (size < 1000000) {
    return `${Math.round(size / 1000)} KB`;
  } else {
    return `${Math.round(size / 1000000)} MB`;
  }
}

function shortenFileName(name) {
  if (name.length > 30) {
    const extDotIndex = name.lastIndexOf(".");
    return name.substring(0, 27) + "..." + name.substring(extDotIndex - 3);
  }
  return name;
}

const statuses = ["pending", "active", "scheduled", "completed", "archived"];

const initialErrors = {
  name: "",
  categories: "",
  publish_dates: "",
  weekdays: "",
  play_times: "",
  creatives: "",
  budget: "",
};

const initialBlur = {
  name: false,
  categories: false,
  publish_dates: false,
  weekdays: false,
  play_times: false,
  budget: false,
};

const initialDaysState = {
  Mon: true,
  Tue: true,
  Wed: true,
  Thu: true,
  Fri: true,
  Sat: true,
  Sun: true,
};

const metrics = [
  { value: "ml", label: "Miles" },
  { value: "km", label: "Kilometers" },
];

function getMetric(value) {
  return metrics.find((metric) => metric.value === value);
}

const initialCenter = {
  lat: GOOGLE_MAPS_DEFAULT_LAT,
  lng: GOOGLE_MAPS_DEFAULT_LNG,
};

const initialAddress = {
  address: "",
  town: "",
  state: "",
  postcode: "",
  metric: metrics[0].value,
  radius: MAP_CIRCLE_MINIMUM_RADIUS,
  center: { ...initialCenter },
};

const initialDrawArea = { points: [], area: null };

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

const initialAddressError = {
  address: "",
  town: "",
  state: "",
  postcode: "",
};

const initialAddressBlur = {
  address: false,
  town: false,
  state: false,
  postcode: false,
  metric: false,
  radius: false,
};

const libraries = ["geometry", "drawing", "places"];

const EditCampaign = () => {
  const { user, token } = useSelector((state) => state.auth);
  const {
    statusEditCampaign,
    campaign,
    statusDeleteCampaign,
    messageDeleteCampaign,
  } = useSelector((state) => state.campaign);
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoaded } = useLoadScript({
    id: "google-map-script2",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  /**
   * @type {("editing"|"saved"|"activate"|"scheduled")}
   */
  const [campaignState, setCampaignState] = useState("editing");
  const [showDeleteCampaignModal, setShowDeleteCampaignModal] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [modalText, setModalText] = useState("");

  let status = "";

  const [showLoader, setShowLoader] = useState(false);

  if (statusDeleteCampaign) {
    dispatch(updateStatusDeleteCampaign());
    setShowLoader(false);
    navigate("/campaigns");
  }

  const categories =
    campaign?.screen_selection_id === SCREEN_SELECTION_BY_TARGETS
      ? campaign?.categories
      : [];
  const subcategories =
    campaign?.screen_selection_id === SCREEN_SELECTION_BY_TARGETS
      ? campaign?.subcategories
      : [];

  const initialValues = {
    name: campaign?.name ?? "",
    categories: categories ?? [],
    subcategories: subcategories ?? [],
    publish_dates:
      campaign?.publish_dates_isforever || campaign === null
        ? "forever"
        : "custom",
    start_date: campaign?.publish_dates_isforever
      ? getDate()
      : campaign?.publish_dates_custom
      ? getDate(new Date(campaign.publish_dates_custom.start_date).getTime())
      : getDate(),
    end_date: campaign?.publish_dates_isforever
      ? ""
      : campaign?.publish_dates_custom
      ? getDate(new Date(campaign.publish_dates_custom.end_date).getTime())
      : "",
    weekdays:
      campaign?.dow_iseveryday || campaign === null ? "everyday" : "custom",
    play_times:
      campaign?.playtimes_isallday || campaign === null ? "allday" : "custom",
    start_times: campaign?.playtimes_isallday
      ? ["00:00"]
      : campaign?.playtimes_custom
      ? campaign?.playtimes_custom.start_times
      : ["00:00"],
    end_times: campaign?.playtimes_isallday
      ? ["23:59"]
      : campaign?.playtimes_custom
      ? campaign?.playtimes_custom.end_times
      : ["23:59"],
    creatives: campaign?.creatives ?? [],
    budget: campaign?.budget ?? 0,
    people: campaign?.budget
      ? Math.round(campaign?.budget / COST_PER_PERSON)
      : 0,
  };
  const [values, setValues] = useState({ ...initialValues });

  const [errors, setErrors] = useState({ ...initialErrors });

  const [hasBlurred, setHasBlurred] = useState({ ...initialBlur });

  const [tab, setTab] = useState(SCREEN_SELECTION_BY_TARGETS);

  const [uploadTab, setUploadTab] = useState("image");

  const [drawOnMap, setDrawOnMap] = useState(false);

  const [categoryTab, setCategoryTab] = useState("all");

  let initialSelectAll = true;
  if (campaign && campaign?.categories) {
    for (const property in availCategories) {
      if (
        campaign?.categories.indexOf(
          parseInt(availCategories[property].value.replace("C", ""))
        ) > -1
      ) {
        initialSelectAll = initialSelectAll && true;
      } else {
        initialSelectAll = initialSelectAll && false;
      }
    }
  }

  const [selectAll, setSelectAll] = useState(initialSelectAll);

  const [endDateMin, setEndDateMin] = useState(getDate(Date.now(), 1));

  const [endTimeMin, setEndTimeMin] = useState(["00:59"]);

  const [screen_selection_id, set_screen_selection_id] = useState(
    campaign?.screen_selection_id
  );

  const initialDrawAreas = campaign?.drawAreas
    ? { ...campaign?.drawAreas }
    : { ...initialDrawArea };
  const [drawAreas, setDrawAreas] = useState(initialDrawAreas);

  const initialAddresses =
    campaign?.addresses && campaign?.addresses?.length > 0
      ? campaign?.addresses?.map((item) => {
          return { ...item };
        })
      : [{ ...initialAddress }];

  const [addresses, setAddresses] = useState([...initialAddresses]);

  const [addressesBlur, setAddressesBlur] = useState([
    { ...initialAddressBlur },
  ]);

  const [addressesErrors, setAddressesErrors] = useState([
    { ...initialAddressError },
  ]);

  const [address1Place, setAddress1Place] = useState(null);

  const creatives_info = [];
  const initialUploadedCreatives = [];
  if (campaign && campaign?.creatives_info) {
    for (let i = 0; i < campaign?.creatives_info.length; i++) {
      const info = {
        ...campaign?.creatives_info[i],
      };
      const localId = uuidv4();
      info.id = localId;
      creatives_info.push(info);
      initialUploadedCreatives.push({
        localId: localId,
        id: campaign?.creatives[i],
      });
    }
  }

  const [creatives, setCreatives] = useState(creatives_info);
  const [newCreatives, setNewCreatives] = useState(0);
  let initialCreativesProgress = [];
  if (campaign && campaign?.creatives && campaign?.creatives.length > 0) {
    initialCreativesProgress = campaign?.creatives.map((creative) => 100);
  }
  const [creativesProgress, setCreativesProgress] = useState(
    initialCreativesProgress
  );

  const [showCreativeDeleteModal, setShowCreativeDeleteModal] = useState(false);
  const [isDeleteCreative, setIsDeleteCreative] = useState(null);
  const [uploadedCreatives, setUploadedCreatives] = useState(
    initialUploadedCreatives
  );
  const [creativeDeleteId, setCreativeDeleteId] = useState(null);

  const toastId = useRef(null);

  const notifySuccess = (message) => {
    return (toastId.current = toast.success(message, {
      position: "top-right",
      autoClose: TOAST_AUTO_CLOSE_DURATION,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    }));
  };

  const notifyError = (message) => {
    return (toastId.current = toast.error(message, {
      position: "top-right",
      autoClose: TOAST_AUTO_CLOSE_DURATION,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    }));
  };

  useEffect(() => {
    if (values.publish_dates === "forever") {
      const endDateString = getDate(Date.now, 1);
      setEndDateMin(endDateString);
      setValues({
        ...values,
        start_date: getDate(),
        end_date: "",
      });
    } else {
      const endDateString = getDate(new Date(values.start_date).getTime(), 1);
      setEndDateMin(endDateString);
      setValues({
        ...values,
        end_date: endDateString,
      });
    }
  }, [values.publish_dates, values.start_date]);

  const [daysState, setDaysState] = useState(
    campaign?.dow_custom ? { ...campaign?.dow_custom } : { ...initialDaysState }
  );

  useEffect(() => {
    let all = true;
    for (const property in daysState) {
      all = all && daysState[property];
    }

    if (all) {
      setValues({
        ...values,
        weekdays: "everyday",
      });
    } else {
      setValues({
        ...values,
        weekdays: "custom",
      });
    }
  }, [daysState]);

  useEffect(() => {
    if (values.play_times === "allday") {
      setValues({
        ...values,
        start_times: ["00:00"],
        end_times: ["23:59"],
      });
    }
  }, [values.play_times]);

  const initialCategoryState = {};
  const initialCategoryStateMain = {};
  const initialSubCategoriesState = {};
  const initialCategoryOpenState = {};

  for (const property in availCategories) {
    initialCategoryStateMain[`${availCategories[property].value}Main`] = false;
    initialCategoryState[`${availCategories[property].value}`] = false;
    initialCategoryOpenState[`${availCategories[property].value}`] = false;

    initialSubCategoriesState[`${availCategories[property].value}`] = {};
    for (const subcategoryProperty in availCategories[property].subcategories) {
      initialSubCategoriesState[`${availCategories[property].value}`][
        `${availCategories[property].subcategories[subcategoryProperty].value}`
      ] = false;
    }
  }

  const [categoryState, setCategoryState] = useState({
    ...initialCategoryState,
  });

  const [categoryMainState, setCategoryMainState] = useState({
    ...initialCategoryStateMain,
  });

  const [categoryOpenState, setCategoryOpenState] = useState({
    ...initialCategoryOpenState,
  });

  const [personalCareServicesState, setPersonalCareServicesState] = useState({
    ...initialSubCategoriesState["1"],
  });

  const [automotiveState, setAutomotiveState] = useState({
    ...initialSubCategoriesState["2"],
  });

  const [healthMedicalState, setHealthMedicalState] = useState({
    ...initialSubCategoriesState["3"],
  });

  const [homeGardenState, setHomeGardenState] = useState({
    ...initialSubCategoriesState["4"],
  });

  const [travelTransportationState, setTravelTransportationState] = useState({
    ...initialSubCategoriesState["5"],
  });

  const [educationState, setEducationState] = useState({
    ...initialSubCategoriesState["6"],
  });

  const [
    professionalServicesGovernmentState,
    setProfessionalServicesGovernmentState,
  ] = useState({
    ...initialSubCategoriesState["7"],
  });

  const [legalFinancialServicesState, setLegalFinancialServicesState] =
    useState({ ...initialSubCategoriesState["8"] });

  const [retailMerchantsState, setRetailMerchantsState] = useState({
    ...initialSubCategoriesState["9"],
  });

  const [hospitalityEntertainmentState, setHospitalityEntertainmentState] =
    useState({ ...initialSubCategoriesState["10"] });

  const [placeTypes, setPlaceTypes] = useState([]);
  
  const [addressesOfOthersOfSameCategory, setAddressesOfOthersOfSameCategory] = useState(campaign?.addressesOfOthers ?? {});

  const selectSubCategoryState = useCallback(
    (value = categoryTab) => {
      if (value === "C1") {
        return personalCareServicesState;
      } else if (value === "C2") {
        return automotiveState;
      } else if (value === "C3") {
        return healthMedicalState;
      } else if (value === "C4") {
        return homeGardenState;
      } else if (value === "C5") {
        return travelTransportationState;
      } else if (value === "C6") {
        return educationState;
      } else if (value === "C7") {
        return professionalServicesGovernmentState;
      } else if (value === "C8") {
        return legalFinancialServicesState;
      } else if (value === "C9") {
        return retailMerchantsState;
      } else {
        return hospitalityEntertainmentState;
      }
    },
    [
      personalCareServicesState,
      automotiveState,
      healthMedicalState,
      homeGardenState,
      travelTransportationState,
      educationState,
      professionalServicesGovernmentState,
      legalFinancialServicesState,
      retailMerchantsState,
      hospitalityEntertainmentState,
      categoryTab,
    ]
  );

  const selectSubCategoryStateFunc = (value = categoryTab) => {
    if (value === "C1") {
      return setPersonalCareServicesState;
    } else if (value === "C2") {
      return setAutomotiveState;
    } else if (value === "C3") {
      return setHealthMedicalState;
    } else if (value === "C4") {
      return setHomeGardenState;
    } else if (value === "C5") {
      return setTravelTransportationState;
    } else if (value === "C6") {
      return setEducationState;
    } else if (value === "C7") {
      return setProfessionalServicesGovernmentState;
    } else if (value === "C8") {
      return setLegalFinancialServicesState;
    } else if (value === "C9") {
      return setRetailMerchantsState;
    } else {
      return setHospitalityEntertainmentState;
    }
  };

  const checkForSelectAll = useCallback(() => {
    let all = true;
    for (const property in categoryMainState) {
      all = all && categoryMainState[property];

      if (!all) break;
    }

    if (all) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [categoryMainState]);

  useEffect(() => {
    checkForSelectAll();
  }, [checkForSelectAll, categoryMainState]);

  const checkForCategory = useCallback((value, state) => {
    let any = false;

    for (const property in state) {
      any = any || state[property];
    }

    if (any) {
      setCategoryState((categoryState) => ({
        ...categoryState,
        [`${value}`]: true,
      }));
    } else {
      setCategoryState((categoryState) => ({
        ...categoryState,
        [`${value}`]: false,
      }));
    }
  }, []);

  const checkForSelectAllCategory = useCallback((value, state) => {
    let all = true;

    for (const property in state) {
      all = all && state[property];

      if (!all) break;
    }

    if (all) {
      setCategoryMainState((categoryMainState) => ({
        ...categoryMainState,
        [`${value}Main`]: true,
      }));
    } else {
      setCategoryMainState((categoryMainState) => ({
        ...categoryMainState,
        [`${value}Main`]: false,
      }));
    }
  }, []);

  useEffect(() => {
    const selectedCategories = [];
    for (const property in categoryState) {
      if (categoryState[property]) {
        selectedCategories.push(property.replace("C", ""));
      }
    }

    const selectedSubcategories = {};
    for (let i = 0; i < selectedCategories.length; i++) {
      const subcategories = selectSubCategoryState(`C${selectedCategories[i]}`);
      let all = false;
      for (const property in subcategories) {
        all = all || subcategories[property];
      }

      selectedSubcategories[selectedCategories[i]] = [];
      if (!all) {
        for (const property in subcategories) {
          selectedSubcategories[selectedCategories[i]].push(property);
        }
      } else {
        for (const property in subcategories) {
          if (subcategories[property]) {
            selectedSubcategories[selectedCategories[i]].push(property);
          }
        }
      }
    }

    setValues({
      ...values,
      categories: selectedCategories,
      subcategories: selectedSubcategories,
    });
  }, [ categoryState ]);

  useEffect(() => {
    const axiosPrivate = axios.create({
      baseURL: BASE_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
      credentials: "include",
    });
    const url = `/api/v1/users/category`;
    const newAddressesOfOthersOfSameCategory = {...addressesOfOthersOfSameCategory};
    for (const property in categoryState) {
      if (categoryState[property]) {
        const category = property.replace("C", "");
        if(!newAddressesOfOthersOfSameCategory.hasOwnProperty(category)) {
          // fetch the addresses for the category
          axiosPrivate
            .get(`${url}/${category}`)
            .then((response) => response.data)
            .then((data) => {
              newAddressesOfOthersOfSameCategory[category] = data.data.usersOfSameCategory;
            })
        }
      }else{
        const category = property.replace("C", "");
        if(newAddressesOfOthersOfSameCategory.hasOwnProperty(category)) {
          delete newAddressesOfOthersOfSameCategory[property.replace("C", "")];
        }
      }
    }

    setAddressesOfOthersOfSameCategory(newAddressesOfOthersOfSameCategory);
  },[ categoryState ]);

  useEffect(() => {
    dispatch(getCampaign({ token, id }));
  }, []);

  useEffect(() => {
    const categories = campaign?.categories;
    const subcategories = campaign?.subcategories;

    setValues({
      name: campaign?.name ?? "",
      categories: categories ?? [],
      subcategories: subcategories ?? [],
      publish_dates:
        campaign?.publish_dates_isforever || campaign === null
          ? "forever"
          : "custom",
      start_date: campaign?.publish_dates_isforever
        ? getDate()
        : campaign?.publish_dates_custom
        ? getDate(new Date(campaign.publish_dates_custom.start_date).getTime())
        : getDate(),
      end_date: campaign?.publish_dates_isforever
        ? ""
        : campaign?.publish_dates_custom
        ? getDate(new Date(campaign.publish_dates_custom.end_date).getTime())
        : "",
      weekdays:
        campaign?.dow_iseveryday || campaign === null ? "everyday" : "custom",
      play_times:
        campaign?.playtimes_isallday || campaign === null ? "allday" : "custom",
      start_times: campaign?.playtimes_isallday
        ? ["00:00"]
        : campaign?.playtimes_custom
        ? campaign?.playtimes_custom.start_times
        : ["00:00"],
      end_times: campaign?.playtimes_isallday
        ? ["23:59"]
        : campaign?.playtimes_custom
        ? campaign?.playtimes_custom.end_times
        : ["23:59"],
      creatives: campaign?.creatives ?? [],
      budget: campaign?.budget ?? 0,
      people: campaign?.budget
        ? Math.round(campaign?.budget / COST_PER_PERSON)
        : 0,
    });

    setDaysState(
      campaign?.dow_custom
        ? { ...campaign?.dow_custom }
        : { ...initialDaysState }
    );

    setTab(SCREEN_SELECTION_BY_TARGETS);

    set_screen_selection_id(campaign?.screen_selection_id);

    const initialDrawAreas = campaign?.drawAreas
      ? { ...campaign?.drawAreas }
      : { ...initialDrawArea };
    setDrawAreas(initialDrawAreas);

    const initialAddresses =
      campaign?.addresses && campaign?.addresses?.length > 0
        ? campaign?.addresses?.map((item) => {
            return { ...item };
          })
        : [{ ...initialAddress }];
    setAddresses([...initialAddresses]);

    const creatives_info = [];
    const initialUploadedCreatives = [];
    if (campaign && campaign?.creatives_info) {
      for (let i = 0; i < campaign?.creatives_info.length; i++) {
        const info = {
          ...campaign?.creatives_info[i],
        };
        const localId = uuidv4();
        info.id = localId;
        creatives_info.push(info);
        initialUploadedCreatives.push({
          localId: localId,
          id: campaign?.creatives[i],
        });
      }
    }
    setCreatives(creatives_info);
    setUploadedCreatives(initialUploadedCreatives);
    let initialCreativesProgress = [];
    if (campaign && campaign?.creatives && campaign?.creatives.length > 0) {
      initialCreativesProgress = campaign?.creatives.map((creative) => 100);
    }
    setCreativesProgress(initialCreativesProgress);

    let initialSelectAll = true;
    if (campaign && campaign?.categories) {
      for (const property in availCategories) {
        if (
          campaign?.categories.indexOf(
            parseInt(availCategories[property].value.replace("C", ""))
          ) > -1
        ) {
          initialSelectAll = initialSelectAll && true;
        } else {
          initialSelectAll = initialSelectAll && false;
        }
      }
    }
    setSelectAll(initialSelectAll);

    const initialCategoryState = {};
    const initialCategoryStateMain = {};
    const initialSubCategoriesState = {};
    const initialCategoryOpenState = {};
    const initialPlaceTypes = [];

    for (const property in availCategories) {
      let allSelected = true;
      if (
        campaign &&
        campaign?.categories.indexOf(
          parseInt(availCategories[property].value.replace("C", ""))
        ) > -1
      ) {
        initialCategoryState[`${availCategories[property].value}`] = true;
      } else {
        initialCategoryState[`${availCategories[property].value}`] = false;
      }

      initialCategoryOpenState[`${availCategories[property].value}`] = false;

      initialSubCategoriesState[`${availCategories[property].value}`] = {};
      for (const subcategoryProperty in availCategories[property]
        .subcategories) {
        if (
          campaign &&
          campaign?.subcategories.indexOf(
            parseInt(
              availCategories[property].subcategories[subcategoryProperty].value
            )
          ) > -1
        ) {
          initialSubCategoriesState[`${availCategories[property].value}`][
            `${availCategories[property].subcategories[subcategoryProperty].value}`
          ] = true;
          initialPlaceTypes.push(availCategories[property].subcategories[subcategoryProperty].label);
          allSelected = allSelected && true;
        } else {
          initialSubCategoriesState[`${availCategories[property].value}`][
            `${availCategories[property].subcategories[subcategoryProperty].value}`
          ] = false;
          allSelected = allSelected && false;
        }
      }
      initialCategoryStateMain[`${availCategories[property].value}Main`] =
        allSelected;
    }
    setCategoryState({ ...initialCategoryState });
    setCategoryMainState({
      ...initialCategoryStateMain,
    });
    setCategoryOpenState({ ...initialCategoryOpenState });
    setPersonalCareServicesState({
      ...initialSubCategoriesState["C1"],
    });
    setAutomotiveState({
      ...initialSubCategoriesState["C2"],
    });
    setHealthMedicalState({
      ...initialSubCategoriesState["C3"],
    });
    setHomeGardenState({
      ...initialSubCategoriesState["C4"],
    });
    setTravelTransportationState({
      ...initialSubCategoriesState["C5"],
    });
    setEducationState({
      ...initialSubCategoriesState["C6"],
    });
    setProfessionalServicesGovernmentState({
      ...initialSubCategoriesState["C7"],
    });
    setLegalFinancialServicesState({ ...initialSubCategoriesState["C8"] });
    setRetailMerchantsState({
      ...initialSubCategoriesState["C9"],
    });
    setHospitalityEntertainmentState({ ...initialSubCategoriesState["C10"] });
    setPlaceTypes(initialPlaceTypes);
    setAddressesOfOthersOfSameCategory(campaign?.addressesOfOthers ?? {});
  }, [campaign]);

  useEffect(() => {
    if (screen_selection_id === SCREEN_SELECTION_BY_RADIUS) {
      setDrawAreas({ ...initialDrawArea });
    }

    if (screen_selection_id === SCREEN_SELECTION_BY_AREA) {
      setAddresses([{ ...initialAddress }]);
      setAddressesBlur([{ ...initialAddressBlur }]);
      setAddressesErrors([{ ...initialAddressError }]);
    }
  }, [screen_selection_id]);

  const resetAll = () => {
    setCampaignState("editing");
    setValues({ ...initialValues });
    setErrors({ ...initialErrors });
    setHasBlurred({ ...initialBlur });
    setTab(SCREEN_SELECTION_BY_TARGETS);
    setDrawOnMap(false);
    setCategoryTab("all");
    setSelectAll(false);
    setEndDateMin(getDate(Date.now(), 1));
    setEndTimeMin(["00:59"]);
    setDaysState({ ...initialDaysState });
    setCategoryState({ ...initialCategoryState });
    setCategoryMainState({ ...initialCategoryStateMain });
    setCategoryOpenState({ ...initialCategoryOpenState });
    setAddresses([{ ...initialAddress }]);
    setAddressesBlur([{ ...initialAddressBlur }]);
    setAddressesErrors([{ ...initialAddressError }]);
    setCreatives([]);
    setNewCreatives(0);
    setCreativesProgress([]);
    setShowCreativeDeleteModal(false);
    setIsDeleteCreative(null);
    setUploadedCreatives([]);
    setCreativeDeleteId(null);
    set_screen_selection_id(null);
    setDrawAreas({ ...initialDrawArea });
    setModalText("");

    setPersonalCareServicesState({
      ...initialSubCategoriesState["1"],
    });

    setAutomotiveState({ ...initialSubCategoriesState["2"] });

    setHealthMedicalState({ ...initialSubCategoriesState["3"] });

    setHomeGardenState({ ...initialSubCategoriesState["4"] });

    setTravelTransportationState({
      ...initialSubCategoriesState["5"],
    });

    setEducationState({ ...initialSubCategoriesState["6"] });
    setProfessionalServicesGovernmentState({
      ...initialSubCategoriesState["7"],
    });

    setLegalFinancialServicesState({
      ...initialSubCategoriesState["8"],
    });

    setRetailMerchantsState({
      ...initialSubCategoriesState["9"],
    });

    setHospitalityEntertainmentState({
      ...initialSubCategoriesState["10"],
    });
    
    setPlaceTypes([]);
    setAddressesOfOthersOfSameCategory(campaign?.addressesOfOthers ?? {});
  };

  if (statusEditCampaign) {
    dispatch(updateStatusEditCampaign());
    if (campaignState === "saved") {
      setModalText(
        "This has been saved as proposal. An administrator can activate this campaign by going into campaigns and clicking on pending campaign"
      );
    } else if (campaignState === "activate") {
      setModalText("This campaign has been activated and running");
    } else if (campaignState === "scheduled") {
      setModalText(
        "This campaign has been scheduled and will start running at scheduled time"
      );
    }
  }

  useEffect(() => {
    if (modalText && campaignState !== "editing") {
      setShowModal(true);
    }
  }, [modalText, campaignState]);

  const handleError = (name, value) => {
    if (name === "budget") {
      if (value.includes("$")) {
        value = Number(value.substring(1));
      }
    }
    const isError = name === "budget" ? value <= 0 : !value;
    if (isError) {
      setErrors({
        ...errors,
        [name]: errorMsgs[name].empty,
      });
    } else {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const checkAndSetAddressError = (index, name, value) => {
    if (!value) {
      const newAddressesErrors = [...addressesErrors];
      newAddressesErrors[index][name] = errorMsgsAddress[name].empty;
      setAddressesErrors(newAddressesErrors);
    } else {
      const newAddressesErrors = [...addressesErrors];
      newAddressesErrors[index][name] = "";
      setAddressesErrors(newAddressesErrors);
    }
  };

  const handleBlur = (event) => {
    setHasBlurred({
      ...hasBlurred,
      [event.target.name]: true,
    });

    handleError(event.target.name, event.target.value);
  };

  const handleChange = (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.type === "radio"
        ? event.target.id.split("-")[1]
        : event.target.value;

    if (event.target.type === "checkbox") {
      if (event.target.name === "select_all") {
        setSelectAll(event.target.checked);

        const newCategoryState = {};
        const newCategoryStateMain = {};
        let i = 1;
        for (const property in initialCategoryState) {
          newCategoryState[property] = event.target.checked;
          newCategoryStateMain[`${property}Main`] = event.target.checked;

          const state = selectSubCategoryState(`C${i}`);
          const setState = selectSubCategoryStateFunc(`C${i}`);

          const newSubCategoryState = {};
          for (const property in state) {
            newSubCategoryState[property] = event.target.checked;
          }

          setState({
            ...state,
            ...newSubCategoryState,
          });

          i++;
        }

        setCategoryState({
          ...categoryState,
          ...newCategoryState,
        });

        setCategoryMainState({
          ...categoryMainState,
          ...newCategoryStateMain,
        });
        
        setPlaceTypes(oldPlaceTypes => {
          const newPlaceTypes = [];
          if(event.target.checked){
            for(let i = 0; i < availCategories.length; i++) {
              const subcategories = availCategories[i].subcategories;
              for(let j = 0; j < subcategories.length; j++) {
                newPlaceTypes.push(subcategories[j].label);
              }
            }
          }
          return newPlaceTypes;
        });
      }
    }

    if (event.target.type === "radio") {
      if (
        event.target.name === "weekdays" &&
        event.target.id.split("-")[1] === "everyday"
      ) {
        const newDaysState = {};
        for (const property in daysState) {
          newDaysState[property] = true;
        }

        setDaysState({
          ...daysState,
          ...newDaysState,
        });
      }
    }

    setValues({
      ...values,
      [event.target.name]: value,
    });

    if (event.target.name === "name" && hasBlurred[event.target.name]) {
      handleError(event.target.name, event.target.value);
    }
  };

  const setCenter = useCallback(
    (center, index) => {
      const newAddresses = [...addresses];
      newAddresses[index].center = center;
      setAddresses([...newAddresses]);
    },
    [addresses]
  );

  useEffect(() => {
    if (values.categories.length > 0) {
      setErrors({
        ...errors,
        categories: "",
      });
    }
  }, [values.categories]);

  useEffect(() => {
    let validWeekDays = false;
    for (const day in daysState) {
      validWeekDays = validWeekDays || daysState[day];
    }

    if (validWeekDays) {
      setErrors({
        ...errors,
        weekdays: "",
      });
    }
  }, [values.weekdays, daysState]);

  const validate = () => {
    let isValid = true;
    let showGeneralErrorMessage = false;
    let newErrors = {
      name: "",
      categories: "",
      publish_dates: "",
      weekdays: "",
      play_times: "",
      creatives: "",
      budget: "",
    };

    if (!values.name) {
      newErrors.name = errorMsgs.name.empty;

      isValid = isValid && false;
      showGeneralErrorMessage = true;
    }

    if (values.weekdays === "custom") {
      let validWeekDays = false;
      for (const day in daysState) {
        validWeekDays = validWeekDays || daysState[day];
      }

      if (!validWeekDays) {
        newErrors.weekdays = errorMsgs.weekdays.empty;

        isValid = isValid && false;
        showGeneralErrorMessage = true;
      }
    }

    if (values.creatives.length === 0) {
      newErrors.creatives = errorMsgs.creatives.empty;
      notifyError("Please upload one or more creatives");
      isValid = isValid && false;
    }

    if (newCreatives > 0) {
      notifyError("Files are uploading");
      isValid = isValid && false;
    }

    if (!values.budget) {
      newErrors.budget = errorMsgs.budget.empty;
      isValid = isValid && false;
      showGeneralErrorMessage = true;
    }

    setErrors({
      ...newErrors,
    });

    if (!screen_selection_id) {
      notifyError(
        "Please fill up the Screen Selection by Radius or Draw areas of Interest"
      );
      isValid = isValid && false;
    } else if (screen_selection_id === SCREEN_SELECTION_BY_RADIUS) {
      const newAddressesErrors = [...addressesErrors];
      for (let i = 0; i < addresses.length; i++) {
        for (const property in addresses[i]) {
          if (
            property === "address"
            // property === "town" ||
            // property === "state" ||
            // property === "postcode"
          ) {
            if (!addresses[i][property]) {
              notifyError(
                "Please fill up the Screen Selection by Targets or Radius or Draw areas of Interest"
              );
              newAddressesErrors[i][property] =
                errorMsgsAddress[property].empty;
              isValid = isValid && false;
            } else {
              newAddressesErrors[i][property] = "";
            }
          }
        }
      }
      setAddressesErrors(newAddressesErrors);
    } else if (screen_selection_id === SCREEN_SELECTION_BY_AREA) {
      if (drawAreas.points.length <= 0 || drawAreas.area === null) {
        notifyError(
          "Please fill up the Screen Selection by Targets or Radius or Draw areas of Interest"
        );
        isValid = isValid && false;
      }
    }

    if(!isValid && showGeneralErrorMessage){
      notifyError("Please fill out all the required fields appropriately");
    }

    return isValid;
  };

  const deleteCreative = (localId) => {
    const item = uploadedCreatives.find((item) => item.localId === localId);
    const index = creatives.findIndex((item) => item.id === localId);
    if (item) {
      setCreativeDeleteId(item.id);
      setIsDeleteCreative(creatives[index]);
      setShowCreativeDeleteModal(true);
    }
  };

  const confirmDeleteCreative = (id) => {
    const axiosPrivate = axios.create({
      baseURL: BASE_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
      credentials: "include",
    });
    const url = `/api/v1/uploads/campaigns/${id}`;
    axiosPrivate
      .delete(url)
      .then((response) => response.data)
      .then((data) => {
        if (data.status) {
          notifySuccess(data.message);
          const valuesCreatives = [...values.creatives];
          const valuesCreativesIndex = valuesCreatives.findIndex(
            (item) => item === id
          );
          valuesCreatives.splice(valuesCreativesIndex, 1);
          setValues({
            ...values,
            creatives: valuesCreatives,
          });
          const newUploadedCreatives = [...uploadedCreatives];
          const newUploadedCreativesIndex = newUploadedCreatives.findIndex(
            (item) => item.id === id
          );
          const index = newUploadedCreatives.find(
            (item) => item.id === id
          ).index;
          newUploadedCreatives.splice(newUploadedCreativesIndex, 1);
          setUploadedCreatives(newUploadedCreatives);

          const newCreatives = [...creatives];
          newCreatives.splice(index, 1);
          const newCreativesProgress = [...creativesProgress];
          newCreativesProgress.splice(index, 1);
          setCreatives(newCreatives);
          setCreativesProgress(newCreativesProgress);
        } else {
          notifyError(data.message);
        }
      })
      .catch((error) => {
        notifyError(error.message);
      });
  };

  const handleCreatives = (event) => {
    // check if user had selected a file
    if (event.target.files.length === 0) {
      notifyError("please choose a file");
      return;
    }

    const files = Array.from(event.target.files);

    const newCreatives = [...creatives];
    const newCreativesProgress = [...creativesProgress];
    let newFiles = 0;
    files.forEach((file) => {
      if (file.type.includes("image")) {
        if (file.size > MAX_IMAGE_SIZE) {
          notifyError(`${file.name} is too large`);
        } else {
          const id = uuidv4();
          newCreatives.push({
            id: id,
            name: file.name,
            size: file.size,
            file: file,
            type: "image",
          });
          newCreativesProgress.push(0);
          newFiles++;
        }
      } else {
        if (file.size > MAX_VIDEO_SIZE) {
          notifyError(`${file.name} is too large`);
        } else {
          const id = uuidv4();
          newCreatives.push({
            id: id,
            name: file.name,
            size: file.size,
            file: file,
            type: "video",
          });
          newCreativesProgress.push(0);
          newFiles++;
        }
      }

      if (newFiles > 0) {
        setErrors({
          ...errors,
          creatives: "",
        });
        setNewCreatives(newFiles);
        setCreatives(newCreatives);
        setCreativesProgress(newCreativesProgress);
      }
    });
  };

  useEffect(() => {
    let count = newCreatives;
    if (count > 0) {
      const axiosPrivateMultipart = axios.create({
        baseURL: BASE_URL,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
        credentials: "include",
      });
      const url = "/api/v1/uploads/campaigns/";
      const newCreativesProgress = [...creativesProgress];
      const valuesCreatives = [...values.creatives];
      const newUploadedCreatives = [...uploadedCreatives];

      const uploadFiles = (formData, i, id, type) => {
        axiosPrivateMultipart
          .post(url + type, formData, {
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              newCreativesProgress[i] = percentCompleted;
              const currentProgress = [...newCreativesProgress];
              setCreativesProgress(currentProgress);
            },
          })
          .then((response) => response.data)
          .then((data) => {
            if (data.status) {
              notifySuccess(data.message);
              valuesCreatives.push(data.data.id);
              const valuesCreativesFinal = [...valuesCreatives];
              setValues({
                ...values,
                creatives: valuesCreativesFinal,
              });
              newUploadedCreatives.push({
                localId: id,
                id: data.data.id,
              });
              const newUploadedCreativesFinal = [...newUploadedCreatives];
              setUploadedCreatives(newUploadedCreativesFinal);
            } else {
              notifyError(data.message);
            }
          })
          .catch((error) => {
            notifyError(error.message);
          });
      };

      for (let i = creatives.length - newCreatives; i < creatives.length; i++) {
        let formData = new FormData();
        formData.append("uploads", creatives[i].file, creatives[i].name);
        let type = creatives[i].file.type.includes("image")
          ? "images"
          : "videos";
        uploadFiles(formData, i, creatives[i].id, type);
      }
    }
    setNewCreatives(0);
  }, [newCreatives]);

  const handleSubmit = (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (validate() && campaign?.status !== "active") {
      const data = {};
      data.name = values.name;

      data.screen_selection_id = screen_selection_id;
      if (values.categories.length > 0) {
        data.categories = values.categories;
        const subcategories = [];
        Object.keys(values.subcategories).forEach((key) => {
          if (values.subcategories[key].length > 0) {
            values.subcategories[key].forEach((value) => {
              subcategories.push(value);
            });
          }
        });
        data.subcategories = subcategories;
      } else {
        const categories = [];
        const subcategories = [];
        for (const property in availCategories) {
          categories.push(availCategories[property].value.substring(1));

          for (const subcategoryProperty in availCategories[property]
            .subcategories) {
            subcategories.push(
              availCategories[property].subcategories[subcategoryProperty].value
            );
          }
        }
        data.categories = categories;
        data.subcategories = subcategories;
      }

      if (screen_selection_id === SCREEN_SELECTION_BY_RADIUS) {
        data.radius = addresses;
      } else if (screen_selection_id === SCREEN_SELECTION_BY_AREA) {
        data.draw = drawAreas;
      }

      // if (
      //   screen_selection_id === SCREEN_SELECTION_BY_RADIUS ||
      //   screen_selection_id === SCREEN_SELECTION_BY_AREA
      // ) {
      //   const categories = [];
      //   const subcategories = [];
      //   for (const property in availCategories) {
      //     categories.push(availCategories[property].value.substring(1));

      //     for (const subcategoryProperty in availCategories[property]
      //       .subcategories) {
      //       subcategories.push(
      //         availCategories[property].subcategories[subcategoryProperty].value
      //       );
      //     }
      //   }
      //   data.categories = categories;
      //   data.subcategories = subcategories;
      // }

      if (values.publish_dates === "forever") {
        data.publish_dates_isforever = true;
      } else {
        data.publish_dates_isforever = false;
        data.publish_dates_custom = {
          start_date: values.start_date,
          end_date: values.end_date,
        };
      }

      if (values.weekdays === "everyday") {
        data.dow_iseveryday = true;
      } else {
        data.dow_iseveryday = false;
        data.dow_custom = daysState;
      }

      if (values.play_times === "allday") {
        data.playtimes_isallday = true;
      } else {
        data.playtimes_isallday = false;
        data.playtimes_custom = {
          start_times: values.start_times,
          end_times: values.end_times,
        };
      }

      data.creatives = values.creatives;
      data.budget = values.budget;
      data.status = status;

      const formData = JSON.stringify(data);
      dispatch(updateCampaign({ formData, token, id }));
    }
  };

  const confirmDelCampaign = () => {
    dispatch(deleteCampaign({ token, id }));
    setShowLoader(true);
  };

  const delCampaign = () => {
    setShowDeleteCampaignModal(true);
  };

  if (campaign === null || showLoader) {
    return (
      <div className="pageLoaderContainer">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Campaign Builder - Campaign-{id}</title>
      </Helmet>
      {showModal && (
        <CampaignModal
          type="edit"
          modalText={modalText}
          setShowModal={setShowModal}
          resetAll={resetAll}
        />
      )}
      {showDeleteCampaignModal && (
        <DeleteCampaignModal
          setShowModal={setShowDeleteCampaignModal}
          id={id}
          confirmDelCampaign={confirmDelCampaign}
        />
      )}
      {showCreativeDeleteModal && (
        <DeleteImageModal
          setShowModal={setShowCreativeDeleteModal}
          creative={isDeleteCreative}
          id={creativeDeleteId}
          setCreativeDeleteId={setCreativeDeleteId}
          confirmDeleteCreative={confirmDeleteCreative}
        />
      )}
      <div className={cns(stylesEdit.containerNew)}>
        <SideBar sideNavItems={sideNavItems} />
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
        <div className={cns(styles.innerContainer)}>
          <div className={cns(styles.left)}>
            <h3 className={cns("campaignHeading")}>Edit Campaign</h3>
            <form
              method="post"
              autoComplete="off"
              noValidate
              onSubmit={(event) => {
                status = statuses[0];
                handleSubmit(event);
                setCampaignState("saved");
              }}
            >
              <div className={cns(styles.card)} id="newCampaign">
                <div className={cns(styles.row)}>
                  <div className={cns(stylesEdit.topInfo)}>
                    <div className={cns(stylesEdit.topInfoContent)}>
                      <h5 className={cns("campaignSubHeading")}>
                        Campaign ID:
                      </h5>{" "}
                      <p className={cns("campaignSubHeading")}>{id}</p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          delCampaign();
                        }}
                      >
                        <span>
                          <TrashIcon />
                        </span>
                      </button>
                    </div>
                  </div>
                  <a
                    href={EXT_LINK_HELP_CREATE_FIRST_CAMPAIGN}
                    className={cns("extLinkWithIcon")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>
                      Step by step guide for creating your first campaign
                    </span>{" "}
                    <ExtLinkIcon />
                  </a>
                </div>
                <div>
                  <label
                    htmlFor="name"
                    className={cns("campaignSubHeading", "topLabel")}
                  >
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    className={cns("input", "bodyText2", styles.field, {
                      "form-field-error": errors["name"] && true,
                    })}
                    id="name"
                    name="name"
                    placeholder="Campaign Name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={campaign?.status === "active" ? true : false}
                    tabIndex={campaign?.status === "active" ? -1 : 0}
                  />
                  <span className="error-msg">{errors["name"]}</span>
                </div>
              </div>
              <div
                className={cns(styles.card, stylesEdit.screenSelectionCard)}
                id="screenSelection"
              >
                <div className={cns(styles.row)}>
                  <h5 className={cns("campaignSubHeading")}>
                    Screen Selection
                  </h5>
                  <div
                    aria-label="Screen Selection Tabs"
                    className={cns(stylesEdit.tabContainer)}
                  >
                    <span
                      {...setAriaControls(
                        "screen-selection",
                        SCREEN_SELECTION_BY_TARGETS
                      )}
                      className={cns("tabHeading", "tab", {
                        selected: tab === SCREEN_SELECTION_BY_TARGETS,
                        notAllowed: campaign?.status === "active",
                      })}
                      onClick={() => {
                        if (campaign?.status !== "active") {
                          setTab(SCREEN_SELECTION_BY_TARGETS);
                          setDrawOnMap(false);
                        }
                      }}
                    >
                      Targets
                    </span>
                    <span
                      {...setAriaControls(
                        "screen-selection",
                        SCREEN_SELECTION_BY_RADIUS
                      )}
                      className={cns("tabHeading", "tab", {
                        selected: tab === SCREEN_SELECTION_BY_RADIUS,
                        notAllowed: campaign?.status === "active",
                      })}
                      onClick={() => {
                        if (campaign?.status !== "active") {
                          setTab(SCREEN_SELECTION_BY_RADIUS);
                          set_screen_selection_id(SCREEN_SELECTION_BY_RADIUS);
                          setDrawOnMap(false);
                        }
                      }}
                    >
                      Radius
                    </span>
                    <span
                      {...setAriaControls(
                        "screen-selection",
                        SCREEN_SELECTION_BY_AREA
                      )}
                      className={cns("tabHeading", "tab", {
                        selected: tab === SCREEN_SELECTION_BY_AREA,
                        notAllowed: campaign?.status === "active",
                      })}
                      onClick={() => {
                        if (campaign?.status !== "active") {
                          setTab(SCREEN_SELECTION_BY_AREA);
                          set_screen_selection_id(SCREEN_SELECTION_BY_AREA);
                          setDrawOnMap(true);
                        }
                      }}
                    >
                      Draw areas of Interest
                    </span>
                  </div>
                </div>
                <div>
                  {tab === SCREEN_SELECTION_BY_TARGETS && (
                    <div
                      role="tabpanel"
                      className={cns(stylesEdit.tabpanel)}
                      id={`screen-selection-tabpanel-${SCREEN_SELECTION_BY_TARGETS}`}
                      aria-labelledby={`screen-selection-tab-${SCREEN_SELECTION_BY_TARGETS}`}
                    >
                      <div className={cns(stylesEdit.left)}>
                        <h5 className={cns("campaignSubHeading")}>
                          Categories
                        </h5>
                      </div>
                      <div className={cns(stylesEdit.right)}>
                        <p className={cns("bodyText2")}>
                          Choose from our categories to select your target.
                        </p>
                        <a
                          href={EXT_LINK_UNDERSTAND_CATEGORY_SELECTION}
                          className={cns("extLinkWithIcon")}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span>Understanding category selection</span>{" "}
                          <ExtLinkIcon />
                        </a>
                        <div className={cns(stylesEdit.categoryContainer)}>
                          <div className={cns(stylesEdit.categoryTop)}>
                            <div className={cns(stylesEdit.divider)}>
                              <input
                                type="checkbox"
                                className={cns(
                                  "custom-checkbox",
                                  "checkbox-radio-color"
                                )}
                                id="select_all"
                                name="select_all"
                                checked={selectAll}
                                onChange={handleChange}
                              />
                              <label
                                htmlFor="select_all"
                                className={cns("campaignSubHeading")}
                              >
                                <span
                                  className={cns("custom-checkbox-box", {
                                    "custom-checkbox-selected": selectAll,
                                  })}
                                >
                                  {categoryTab === "all" && selectAll ? (
                                    <SelectIcon />
                                  ) : null}
                                </span>
                                <span>Select All</span>
                              </label>
                              <span className="error-msg">
                                {errors["categories"]}
                              </span>
                            </div>
                          </div>
                          <div>
                            {availCategories.map((category) => (
                              <div
                                key={category.value}
                                className={cns(
                                  stylesEdit.categoryOuterContainer
                                )}
                              >
                                <div
                                  className={cns(
                                    "custom-checkbox-radio-container",
                                    stylesEdit.categoryInnerContainer
                                  )}
                                >
                                  <div
                                    className={cns(
                                      stylesEdit.categoryCheckboxContainer
                                    )}
                                    onMouseDown={() => {
                                      if (
                                        !categoryState[category.value] ||
                                        (categoryState[category.value] &&
                                          categoryOpenState[category.value])
                                      ) {
                                        setCategoryOpenState(
                                          (categoryOpenState) => ({
                                            ...initialCategoryOpenState,
                                            [category.value]:
                                              !categoryOpenState[
                                                category.value
                                              ],
                                          })
                                        );
                                      }
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      className={cns(
                                        "custom-checkbox",
                                        "checkbox-radio-color"
                                      )}
                                      id={category.value}
                                      name={category.value}
                                      checked={categoryState[category.value]}
                                      onChange={(event) => {
                                        setCategoryState({
                                          ...categoryState,
                                          [category.value]:
                                            event.target.checked,
                                        });

                                        setCategoryMainState({
                                          ...categoryMainState,
                                          [`${category.value}Main`]:
                                            event.target.checked,
                                        });

                                        const subState = selectSubCategoryState(
                                          category.value
                                        );
                                        const subSetState =
                                          selectSubCategoryStateFunc(
                                            category.value
                                          );

                                        const newSubCategoryState = {};
                                        for (const property in subState) {
                                          newSubCategoryState[property] =
                                            event.target.checked;
                                        }

                                        subSetState({
                                          ...subState,
                                          ...newSubCategoryState,
                                        });
                                        
                                        setPlaceTypes(oldPlaceTypes => {
                                          const newPlaceTypes = [...oldPlaceTypes];
                                          const subcategories = category?.subcategories;
                                          if(event.target.checked){
                                            for(let i = 0; i < subcategories.length; i++) {
                                              if(newPlaceTypes.indexOf(subcategories[i].label) === -1){
                                                newPlaceTypes.push(subcategories[i].label);
                                              }
                                            }
                                          }else{
                                            for(let i = 0; i < subcategories.length; i++) {
                                              const index = newPlaceTypes.indexOf(subcategories[i].label);
                                              if(index !== -1){
                                                newPlaceTypes.splice(index, 1);
                                              }
                                            }
                                          }
                                          return newPlaceTypes;
                                        });
                                      }}
                                    />
                                    <label
                                      htmlFor={category.value}
                                      className={cns("fullWidthLabel")}
                                    >
                                      <div>
                                        <span
                                          className={cns(
                                            "custom-checkbox-box",
                                            {
                                              "custom-checkbox-selected":
                                                categoryState[category.value],
                                            }
                                          )}
                                        >
                                          {categoryState[category.value] ? (
                                            categoryMainState[
                                              `${category.value}Main`
                                            ] ? (
                                              <SelectIcon />
                                            ) : (
                                              <span
                                                className={cns(
                                                  "custom-checkbox-inner"
                                                )}
                                              ></span>
                                            )
                                          ) : null}
                                        </span>
                                        <span
                                          className={cns(
                                            "title",
                                            stylesEdit.categoryLabel
                                          )}
                                        >
                                          {category.label}
                                        </span>
                                      </div>
                                    </label>
                                  </div>

                                  <span
                                    className={cns(stylesEdit.categoryIcon)}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setCategoryOpenState(
                                        (categoryOpenState) => ({
                                          ...initialCategoryOpenState,
                                          [category.value]:
                                            !categoryOpenState[category.value],
                                        })
                                      );
                                    }}
                                  >
                                    {categoryOpenState[category.value] ? (
                                      <CloseIcon />
                                    ) : (
                                      <CaretDownIcon />
                                    )}
                                  </span>
                                </div>
                                <div
                                  className={cns(
                                    stylesEdit.subcategoryContainer,
                                    {
                                      [stylesEdit.showSubcategory]:
                                        categoryOpenState[category.value],
                                    }
                                  )}
                                >
                                  {category?.subcategories.map(
                                    (subcategory) => (
                                      <div
                                        key={subcategory.value}
                                        className={cns(
                                          "custom-checkbox-radio-container",
                                          stylesEdit.checkboxContainer,
                                          stylesEdit.subCheckboxContainer
                                        )}
                                      >
                                        <input
                                          type="checkbox"
                                          className={cns(
                                            "custom-checkbox",
                                            "checkbox-radio-color"
                                          )}
                                          id={subcategory.value}
                                          name={subcategory.value}
                                          checked={(() => {
                                            let state = selectSubCategoryState(
                                              category.value
                                            );
                                            return state[subcategory.value];
                                          })()}
                                          onChange={(event) => {
                                            let state = selectSubCategoryState(
                                              category.value
                                            );
                                            let setState =
                                              selectSubCategoryStateFunc(
                                                category.value
                                              );
                                            const newState = {
                                              ...state,
                                              [subcategory.value]:
                                                event.target.checked,
                                            };
                                            setState(newState);

                                            checkForCategory(
                                              category.value,
                                              newState
                                            );

                                            checkForSelectAllCategory(
                                              category.value,
                                              newState
                                            );
                                            
                                            setPlaceTypes(oldPlaceTypes => {
                                              const newPlaceTypes = [...oldPlaceTypes];
                                              if(event.target.checked){
                                                if(newPlaceTypes.indexOf(subcategory.label) === -1){
                                                  newPlaceTypes.push(subcategory.label);
                                                }
                                              }else{
                                                const index = newPlaceTypes.indexOf(subcategory.label);
                                                if(index !== -1){
                                                  newPlaceTypes.splice(index, 1);
                                                }
                                              }
                                              return newPlaceTypes;
                                            });
                                          }}
                                        />
                                        <label htmlFor={subcategory.value}>
                                          <span
                                            className={cns(
                                              "custom-checkbox-box-tiny",
                                              {
                                                "custom-checkbox-selected":
                                                  (() => {
                                                    let state =
                                                      selectSubCategoryState(
                                                        category.value
                                                      );
                                                    return state[
                                                      subcategory.value
                                                    ];
                                                  })(),
                                              }
                                            )}
                                          >
                                            {(() => {
                                              let state =
                                                selectSubCategoryState(
                                                  category.value
                                                );
                                              return state[
                                                subcategory.value
                                              ] ? (
                                                <SelectIcon />
                                              ) : null;
                                            })()}
                                          </span>
                                          <span
                                            className={cns(
                                              "bodyText2",
                                              stylesEdit.categoryLabel
                                            )}
                                          >
                                            {subcategory.label}
                                          </span>
                                        </label>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {tab === SCREEN_SELECTION_BY_RADIUS && (
                    <div
                      role="tabpanel"
                      className={cns(stylesEdit.radiusContainer)}
                      id={`screen-selection-tabpanel-${SCREEN_SELECTION_BY_RADIUS}`}
                      aria-labelledby={`screen-selection-tab-${SCREEN_SELECTION_BY_RADIUS}`}
                    >
                      <p className={cns("bodyText2", stylesEdit.addressHint)}>
                        Enter the address you want at the center of the circle
                      </p>
                      {addresses.length &&
                        addresses.map((addressItem, index) => (
                          <div className={cns(stylesEdit.address)} key={index}>
                            <div className={cns(stylesEdit.addressRow)}>
                              {window.google && (
                                <div className={cns(stylesEdit.addressInput)}>
                                  <Autocomplete
                                    onLoad={(event) => {
                                      if (campaign?.status !== "active") {
                                        setAddress1Place(event);
                                      }
                                    }}
                                    onPlaceChanged={() => {
                                      if (address1Place !== null) {
                                        const place = address1Place.getPlace();
                                        const newAddresses = [...addresses];
                                        newAddresses[index].address =
                                          place.formatted_address;
                                        setAddresses([...newAddresses]);
                                        checkAndSetAddressError(
                                          index,
                                          "address",
                                          place.formatted_address
                                        );
                                      }
                                    }}
                                  >
                                    <input
                                      type="text"
                                      className={cns(
                                        "input",
                                        "bodyText2",
                                        "inputSmall",
                                        styles.field,
                                        {
                                          "form-field-error":
                                            addressesErrors[index].address &&
                                            true,
                                        }
                                      )}
                                      id={`address${index + 1}`}
                                      name={`address${index + 1}`}
                                      placeholder={
                                        addressItem?.address
                                          ? addressItem.address
                                          : `Address ${index + 1}`
                                      }
                                      disabled={
                                        campaign?.status === "active"
                                          ? true
                                          : false
                                      }
                                      tabIndex={
                                        campaign?.status === "active" ? -1 : 0
                                      }
                                      //value={addressItem.address}
                                      // onChange={(event) => {
                                      //   const newAddresses = [...addresses];
                                      //   newAddresses[index].address =
                                      //     event.target.value;
                                      //   setAddresses([...newAddresses]);
                                      //   checkAndSetAddressError(
                                      //     index,
                                      //     "address",
                                      //     event.target.value
                                      //   );
                                      // }}
                                      onBlur={(event) => {
                                        if (!addressesBlur[index].address) {
                                          const newAddressesBlur = [
                                            ...addressesBlur,
                                          ];
                                          newAddressesBlur[
                                            index
                                          ].address = true;
                                          setAddressesBlur(newAddressesBlur);
                                          checkAndSetAddressError(
                                            index,
                                            "address",
                                            addressItem.address
                                          );
                                        }
                                      }}
                                    />
                                  </Autocomplete>
                                  <span className="error-msg">
                                    {addressesErrors[index].address}
                                  </span>
                                </div>
                              )}
                              {/* <div className={cns(stylesEdit.addressInput)}>
                                <input
                                  type="text"
                                  className={cns(
                                    "input",
                                    "bodyText2",
                                    "inputSmall",
                                    styles.field,
                                    {
                                      "form-field-error":
                                        addressesErrors[index].town && true,
                                    }
                                  )}
                                  id={`town${index + 1}`}
                                  name={`town${index + 1}`}
                                  placeholder={`Town`}
                                  value={addressItem.town}
                                  onChange={(event) => {
                                    const newAddresses = [...addresses];
                                    newAddresses[index].town =
                                      event.target.value;
                                    setAddresses([...newAddresses]);
                                    checkAndSetAddressError(
                                      index,
                                      "town",
                                      event.target.value
                                    );
                                  }}
                                  onBlur={(event) => {
                                    if (!addressesBlur[index].town) {
                                      const newAddressesBlur = [
                                        ...addressesBlur,
                                      ];
                                      newAddressesBlur[index].town = true;
                                      setAddressesBlur(newAddressesBlur);
                                      checkAndSetAddressError(
                                        index,
                                        "town",
                                        event.target.value
                                      );
                                    }
                                  }}
                                  disabled={campaign?.status === "active" ? true : false}
                  tabIndex={campaign?.status === "active" ? -1 : 0}
                                />
                                <span className="error-msg">
                                  {addressesErrors[index].town}
                                </span>
                              </div> */}
                            </div>
                            {/* <div className={cns(stylesEdit.addressRow)}>
                              <div className={cns(stylesEdit.addressInput)}>
                                <input
                                  type="text"
                                  className={cns(
                                    "input",
                                    "bodyText2",
                                    "inputSmall",
                                    styles.field,
                                    {
                                      "form-field-error":
                                        addressesErrors[index].state && true,
                                    }
                                  )}
                                  id={`state${index + 1}`}
                                  name={`state${index + 1}`}
                                  placeholder={`State`}
                                  value={addressItem.state}
                                  onChange={(event) => {
                                    const newAddresses = [...addresses];
                                    newAddresses[index].state =
                                      event.target.value;
                                    setAddresses([...newAddresses]);
                                    checkAndSetAddressError(
                                      index,
                                      "state",
                                      event.target.value
                                    );
                                  }}
                                  onBlur={(event) => {
                                    if (!addressesBlur[index].state) {
                                      const newAddressesBlur = [
                                        ...addressesBlur,
                                      ];
                                      newAddressesBlur[index].state = true;
                                      setAddressesBlur(newAddressesBlur);
                                      checkAndSetAddressError(
                                        index,
                                        "state",
                                        event.target.value
                                      );
                                    }
                                  }}
                                  disabled={campaign?.status === "active" ? true : false}
                  tabIndex={campaign?.status === "active" ? -1 : 0}
                                />
                                <span className="error-msg">
                                  {addressesErrors[index].state}
                                </span>
                              </div>
                              <div className={cns(stylesEdit.addressInput)}>
                                <input
                                  type="text"
                                  className={cns(
                                    "input",
                                    "bodyText2",
                                    "inputSmall",
                                    styles.field,
                                    {
                                      "form-field-error":
                                        addressesErrors[index].postcode && true,
                                    }
                                  )}
                                  id={`postcode${index + 1}`}
                                  name={`postcode${index + 1}`}
                                  placeholder={`Post Code`}
                                  value={addressItem.postcode}
                                  onChange={(event) => {
                                    const newAddresses = [...addresses];
                                    newAddresses[index].postcode =
                                      event.target.value;
                                    setAddresses([...newAddresses]);
                                    checkAndSetAddressError(
                                      index,
                                      "postcode",
                                      event.target.value
                                    );
                                  }}
                                  onBlur={(event) => {
                                    if (!addressesBlur[index].postcode) {
                                      const newAddressesBlur = [
                                        ...addressesBlur,
                                      ];
                                      newAddressesBlur[index].postcode = true;
                                      setAddressesBlur(newAddressesBlur);
                                      checkAndSetAddressError(
                                        index,
                                        "postcode",
                                        event.target.value
                                      );
                                    }
                                  }}
                                  disabled={campaign?.status === "active" ? true : false}
                  tabIndex={campaign?.status === "active" ? -1 : 0}
                                />
                                <span className="error-msg">
                                  {addressesErrors[index].postcode}
                                </span>
                              </div>
                            </div> */}
                            <div className={cns(stylesEdit.addressRow)}>
                              <div
                                className={cns(
                                  stylesEdit.addressSelectContainer,
                                  {
                                    [stylesEdit.addressSelectContainerDisabled]:
                                      campaign?.status === "active",
                                  }
                                )}
                              >
                                <Select
                                  className={cns(stylesEdit.select)}
                                  placeholder="Metric"
                                  getValue={() => addressItem.metric}
                                  value={getMetric(addressItem.metric)}
                                  id={`metric${index + 1}`}
                                  name={`metric${index + 1}`}
                                  onChange={(event) => {
                                    const newAddresses = [...addresses];
                                    newAddresses[index].metric = event.value;
                                    setAddresses([...newAddresses]);
                                  }}
                                  isDisabled={
                                    campaign?.status === "active" ? true : false
                                  }
                                  tabIndex={
                                    campaign?.status === "active" ? -1 : 0
                                  }
                                  options={metrics}
                                  theme={(theme) => ({
                                    ...theme,
                                    borderRadius: "8px",
                                    colors: {
                                      ...theme.colors,
                                      primary: "#B69538",
                                    },
                                  })}
                                  styles={{
                                    control: (css) => ({
                                      ...css,
                                      backgroundColor: "#ffffff",
                                      width: "130px",
                                      border: 0,
                                      opacity:
                                        campaign?.status === "active"
                                          ? 0.75
                                          : 1,
                                    }),
                                    singleValue: (provided) => ({
                                      ...provided,
                                      color: "#515151 !important",
                                      fontWeight: "700 !important",
                                      opacity:
                                        campaign?.status === "active"
                                          ? 0.75
                                          : 1,
                                    }),
                                  }}
                                />
                              </div>
                              <div
                                className={cns(stylesEdit.radiusRangeContainer)}
                              >
                                <div
                                  className={cns(stylesEdit.radiusRangeWrapper)}
                                >
                                  <span
                                    data-for={`getContent${index + 1}`}
                                    data-tip
                                  >
                                    <input
                                      type="range"
                                      style={{
                                        background: `linear-gradient(to right,#B69538 0%,#B69538 ${getRadiusPercentage(
                                          addresses[index].radius,
                                          addresses[index].metric.value
                                        )}%, #f1f1f1 ${getRadiusPercentage(
                                          addresses[index].radius,
                                          addresses[index].metric.value
                                        )}%)`,
                                      }}
                                      className={cns(stylesEdit.slider)}
                                      id={`radius${index + 1}`}
                                      name={`radius${index + 1}`}
                                      min={`${MAP_CIRCLE_MINIMUM_RADIUS}`}
                                      step={`${MAP_CIRCLE_RADIUS_STEP}`}
                                      max={`${
                                        addresses[index].metric.value === "ml"
                                          ? MAP_CIRCLE_MAXIMUM_RADIUS_ML
                                          : MAP_CIRCLE_MAXIMUM_RADIUS_KM
                                      }`}
                                      value={addressItem.radius}
                                      onChange={(event) => {
                                        const newAddresses = [...addresses];
                                        newAddresses[index].radius =
                                          event.target.value;
                                        setAddresses([...newAddresses]);
                                      }}
                                      disabled={
                                        campaign?.status === "active"
                                          ? true
                                          : false
                                      }
                                      tabIndex={
                                        campaign?.status === "active" ? -1 : 0
                                      }
                                    />
                                    <ReactTooltip
                                      place="top"
                                      effect="float"
                                      id={`getContent${index + 1}`}
                                      getContent={() =>
                                        `${addressItem.radius} ${
                                          addressItem.metric
                                        }${addressItem.radius > 1 ? "s" : ""}`
                                      }
                                      textColor={stylesEdit.white}
                                      backgroundColor={
                                        stylesEdit.backgroundColor
                                      }
                                    />
                                  </span>
                                </div>
                                <p
                                  className={cns(
                                    "bodyText2",
                                    stylesEdit.addressHint
                                  )}
                                >
                                  Move the slider to adjust the Radius area in
                                  map.
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      <button
                        type="button"
                        className={cns("subHeading", stylesEdit.btnAddAddress)}
                        onClick={() => {
                          setAddresses([...addresses, { ...initialAddress }]);
                          setAddressesBlur([
                            ...addressesBlur,
                            { ...initialAddressBlur },
                          ]);
                          setAddressesErrors([
                            ...addressesErrors,
                            { ...initialAddressError },
                          ]);
                        }}
                      >
                        <AddIcon />
                        <span>Add another address</span>
                      </button>
                    </div>
                  )}
                  {tab === SCREEN_SELECTION_BY_AREA && (
                    <div
                      role="tabpanel"
                      className={cns(stylesEdit.tabpanel)}
                      id={`screen-selection-tabpanel-${SCREEN_SELECTION_BY_AREA}`}
                      aria-labelledby={`screen-selection-tab-${SCREEN_SELECTION_BY_AREA}`}
                    >
                      <div className={cns(stylesEdit.drawContainer)}>
                        <div className={cns(stylesEdit.drawHeading)}>
                          <div
                            className={cns(stylesEdit.drawInfoIconContainer)}
                          >
                            <InfoIcon />
                          </div>
                          <div>
                            <h4 className={cns("campaignSubHeading")}>
                              Use the Pen Tool.
                            </h4>
                            <p className={cns(stylesEdit.addressHint)}>
                              Zoom in and use the pen tool to outline the area
                              where you want to advertise.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className={cns(styles.card)} id="scheduling">
                <div className={cns(styles.row)}>
                  <h5 className={cns("campaignSubHeading")}>Scheduling</h5>
                </div>
                <div>
                  <h6 className={cns("subHeading", "textWithIcon")}>
                    <span>Publish Dates</span>
                    <MoreInfoIcon />
                  </h6>
                  <div className={cns(stylesEdit.radioContainer)}>
                    <div>
                      <input
                        type="radio"
                        className={cns("custom-radio")}
                        id="publishDates-forever"
                        name="publish_dates"
                        checked={values["publish_dates"] === "forever"}
                        onChange={handleChange}
                        disabled={campaign?.status === "active" ? true : false}
                        tabIndex={campaign?.status === "active" ? -1 : 0}
                      />
                      <label
                        htmlFor="publishDates-forever"
                        className={cns("bodyText2")}
                      >
                        <span
                          className={cns("custom-radio-outer", {
                            "custom-radio-selected":
                              values["publish_dates"] === "forever",
                          })}
                        >
                          {values["publish_dates"] === "forever" && (
                            <span className={cns("custom-radio-inner")}></span>
                          )}
                        </span>
                        <span
                          className={cns("bodyText2", stylesEdit.radioLabel)}
                        >
                          Forever
                        </span>
                      </label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        className={cns("custom-radio")}
                        id="publishDates-custom"
                        name="publish_dates"
                        checked={values["publish_dates"] === "custom"}
                        onChange={handleChange}
                        disabled={campaign?.status === "active" ? true : false}
                        tabIndex={campaign?.status === "active" ? -1 : 0}
                      />
                      <label
                        htmlFor="publishDates-custom"
                        className={cns("bodyText2")}
                      >
                        <span
                          className={cns("custom-radio-outer", {
                            "custom-radio-selected":
                              values["publish_dates"] === "custom",
                          })}
                        >
                          {values["publish_dates"] === "custom" && (
                            <span className={cns("custom-radio-inner")}></span>
                          )}
                        </span>
                        <span
                          className={cns("bodyText2", stylesEdit.radioLabel)}
                        >
                          Custom Range
                        </span>
                      </label>
                    </div>
                  </div>
                  {values["publish_dates"] === "custom" && (
                    <div className={cns(stylesEdit.radioContainer)}>
                      <div>
                        <label className={cns("subHeading", "topLabel")}>
                          Start Date
                        </label>
                        <input
                          type="date"
                          className={cns("input", stylesEdit.inputDate)}
                          id="publishDates-start"
                          name="start_date"
                          value={values["start_date"]}
                          min={getDate()}
                          disabled={
                            values["publish_dates"] !== "custom" ||
                            campaign?.status === "active"
                              ? true
                              : false
                          }
                          onChange={handleChange}
                          tabIndex={
                            values["publish_dates"] !== "custom" ||
                            campaign?.status === "active"
                              ? -1
                              : 0
                          }
                        />
                      </div>
                      <div>
                        <label className={cns("subHeading", "topLabel")}>
                          End Date
                        </label>
                        <input
                          type="date"
                          className={cns("input", stylesEdit.inputDate)}
                          id="publishDates-end"
                          name="end_date"
                          value={values["end_date"]}
                          min={endDateMin}
                          disabled={
                            values["publish_dates"] !== "custom" ||
                            campaign?.status === "active"
                              ? true
                              : false
                          }
                          onChange={handleChange}
                          tabIndex={
                            values["publish_dates"] !== "custom" ||
                            campaign?.status === "active"
                              ? -1
                              : 0
                          }
                        />
                      </div>
                    </div>
                  )}
                  <span className="error-msg">{errors["publish_dates"]}</span>
                </div>
                <div className={cns(stylesEdit.spacing)}>
                  <h6 className={cns("subHeading", "textWithIcon")}>
                    <span>Days of the Week</span>
                    <MoreInfoIcon />
                  </h6>
                  <div className={cns(stylesEdit.radioContainer)}>
                    <div>
                      <input
                        type="radio"
                        className={cns("custom-radio")}
                        id="weekdays-everyday"
                        name="weekdays"
                        checked={values["weekdays"] === "everyday"}
                        onChange={handleChange}
                        disabled={campaign?.status === "active" ? true : false}
                        tabIndex={campaign?.status === "active" ? -1 : 0}
                      />
                      <label
                        htmlFor="weekdays-everyday"
                        className={cns("bodyText2")}
                      >
                        <span
                          className={cns("custom-radio-outer", {
                            "custom-radio-selected":
                              values["weekdays"] === "everyday",
                          })}
                        >
                          {values["weekdays"] === "everyday" && (
                            <span className={cns("custom-radio-inner")}></span>
                          )}
                        </span>
                        <span
                          className={cns("bodyText2", stylesEdit.radioLabel)}
                        >
                          Everyday
                        </span>
                      </label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        className={cns("custom-radio")}
                        id="weekdays-custom"
                        name="weekdays"
                        checked={values["weekdays"] === "custom"}
                        onChange={handleChange}
                        disabled={campaign?.status === "active" ? true : false}
                        tabIndex={campaign?.status === "active" ? -1 : 0}
                      />
                      <label
                        htmlFor="weekdays-custom"
                        className={cns("bodyText2")}
                      >
                        <span
                          className={cns("custom-radio-outer", {
                            "custom-radio-selected":
                              values["weekdays"] === "custom",
                          })}
                        >
                          {values["weekdays"] === "custom" && (
                            <span className={cns("custom-radio-inner")}></span>
                          )}
                        </span>
                        <span
                          className={cns("bodyText2", stylesEdit.radioLabel)}
                        >
                          Custom Days
                        </span>
                      </label>
                    </div>
                  </div>
                  {values["weekdays"] === "custom" && (
                    <div className={cns(stylesEdit.daysCheckboxContainer)}>
                      {days.map((day) => (
                        <div
                          key={`key-${day}`}
                          className={cns(stylesEdit.daysCheckboxWrapper)}
                        >
                          <input
                            type="checkbox"
                            className={cns("custom-checkbox")}
                            id={day}
                            name={day}
                            checked={daysState[day]}
                            onChange={() => {
                              setDaysState({
                                ...daysState,
                                [day]: !daysState[day],
                              });
                            }}
                            disabled={
                              campaign?.status === "active" ? true : false
                            }
                            tabIndex={campaign?.status === "active" ? -1 : 0}
                          />
                          <label
                            htmlFor={day}
                            className={cns("campaignSubHeading")}
                          >
                            <span
                              className={cns(
                                "custom-checkbox-box",
                                "custom-checkbox-box-small",
                                {
                                  "custom-checkbox-selected": daysState[day],
                                }
                              )}
                            >
                              {daysState[day] ? <SelectIcon /> : null}
                            </span>
                            <span
                              className={cns(
                                "bodyText2",
                                stylesEdit.radioLabel
                              )}
                            >
                              {day}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="error-msg">{errors["weekdays"]}</span>
                </div>
                <div
                  style={{
                    paddingBottom:
                      values["play_times"] === "allday" ? "18px" : null,
                  }}
                >
                  <h6
                    className={cns(
                      "subHeading",
                      "textWithIcon",
                      stylesEdit.spacing
                    )}
                  >
                    <span>Play Times</span>
                    <MoreInfoIcon />
                  </h6>
                  <div className={cns(stylesEdit.radioContainer)}>
                    <div>
                      <input
                        type="radio"
                        className={cns("custom-radio")}
                        id="playTimes-allday"
                        name="play_times"
                        checked={values["play_times"] === "allday"}
                        onChange={handleChange}
                        disabled={campaign?.status === "active" ? true : false}
                        tabIndex={campaign?.status === "active" ? -1 : 0}
                      />
                      <label
                        htmlFor="playTimes-allday"
                        className={cns("bodyText2")}
                      >
                        <span
                          className={cns("custom-radio-outer", {
                            "custom-radio-selected":
                              values["play_times"] === "allday",
                          })}
                        >
                          {values["play_times"] === "allday" && (
                            <span className={cns("custom-radio-inner")}></span>
                          )}
                        </span>
                        <span
                          className={cns("bodyText2", stylesEdit.radioLabel)}
                        >
                          All Day
                        </span>
                      </label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        className={cns("custom-radio")}
                        id="playTimes-custom"
                        name="play_times"
                        checked={values["play_times"] === "custom"}
                        onChange={handleChange}
                        disabled={campaign?.status === "active" ? true : false}
                        tabIndex={campaign?.status === "active" ? -1 : 0}
                      />
                      <label
                        htmlFor="playTimes-custom"
                        className={cns("bodyText2")}
                      >
                        <span
                          className={cns("custom-radio-outer", {
                            "custom-radio-selected":
                              values["play_times"] === "custom",
                          })}
                        >
                          {values["play_times"] === "custom" && (
                            <span className={cns("custom-radio-inner")}></span>
                          )}
                        </span>
                        <span
                          className={cns("bodyText2", stylesEdit.radioLabel)}
                        >
                          Custom Range
                        </span>
                      </label>
                    </div>
                  </div>
                  {values["play_times"] === "custom" && (
                    <>
                      <div className={cns(stylesEdit.radioContainer)}>
                        <div>
                          <label className={cns("subHeading", "topLabel")}>
                            Start
                          </label>
                          {values.start_times.map((value, index) => (
                            <input
                              key={`playTimes-start-${index}`}
                              type="time"
                              className={cns(
                                "input",
                                stylesEdit.inputDate,
                                stylesEdit.inputTime
                              )}
                              id={`playTimes-start-${index}`}
                              name={`start_times-${index}`}
                              min="00:00"
                              max="22:59"
                              value={value}
                              disabled={
                                values["play_times"] !== "custom" ||
                                campaign?.status === "active"
                                  ? true
                                  : false
                              }
                              tabIndex={campaign?.status === "active" ? -1 : 0}
                              onChange={(event) => {
                                const newValues = [...values.start_times];
                                newValues[index] = event.target.value;
                                setValues({
                                  ...values,
                                  start_times: newValues,
                                });

                                const newEndTimeMin = [...endTimeMin];
                                newEndTimeMin[index] = getTime(
                                  event.target.value,
                                  1
                                );
                                setEndTimeMin(newEndTimeMin);
                              }}
                            />
                          ))}
                        </div>
                        <div>
                          <label className={cns("subHeading", "topLabel")}>
                            End
                          </label>
                          {values.end_times.map((value, index) => (
                            <input
                              key={`playTimes-end-${index}`}
                              type="time"
                              className={cns(
                                "input",
                                stylesEdit.inputDate,
                                stylesEdit.inputTime
                              )}
                              id={`playTimes-end-${index}`}
                              name={`start_end-${index}`}
                              min={endTimeMin[index]}
                              max="23:59"
                              value={value}
                              disabled={
                                values["play_times"] !== "custom" ||
                                campaign?.status === "active"
                                  ? true
                                  : false
                              }
                              tabIndex={campaign?.status === "active" ? -1 : 0}
                              onChange={(event) => {
                                const newValues = [...values.end_times];
                                newValues[index] = event.target.value;
                                setValues({
                                  ...values,
                                  end_times: newValues,
                                });
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="error-msg">{errors["play_times"]}</span>
                      <div className={cns(stylesEdit.rangeBtnContainer)}>
                        <button
                          type="button"
                          className={cns("subHeading", stylesEdit.btn)}
                          onClick={() => {
                            if (values.play_times === "custom") {
                              const newStartTimes = [...values.start_times];
                              newStartTimes.push("00:00");

                              const newEndTimes = [...values.end_times];
                              newEndTimes.push("23:59");

                              setValues({
                                ...values,
                                start_times: newStartTimes,
                                end_times: newEndTimes,
                              });

                              const newEndTimeMin = [...endTimeMin];
                              newEndTimeMin.push("00:59");
                              setEndTimeMin(newEndTimeMin);
                            }
                          }}
                        >
                          Add another range +
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className={cns(styles.card)} id="budget">
                <div className={cns(styles.row)}>
                  <h5 className={cns("campaignSubHeading")}>Budget Per Day</h5>
                </div>
                <div className={cns(stylesEdit.budgetContainer)}>
                  <div className={cns(stylesEdit.left)}>
                    <h5 className={cns("campaignSubHeading")}>Budget</h5>
                  </div>
                  <div className={cns(stylesEdit.right)}>
                    <div className={cns(stylesEdit.budgetFieldsContainer)}>
                      <div className={cns(stylesEdit.fieldContainer)}>
                        <label
                          htmlFor="budget"
                          className={cns(
                            "bodyText2",
                            "topLabel",
                            stylesEdit.budgetLabel
                          )}
                        >
                          Spend up to
                        </label>
                        <CurrencyInput
                          className={cns("input", "bodyText2", styles.field, {
                            "form-field-error": errors["budget"] && true,
                          })}
                          id="budget"
                          name="budget"
                          prefix="$"
                          placeholder="Please enter a number"
                          defaultValue={0}
                          decimalsLimit={2}
                          value={values.budget}
                          disabled={
                            campaign?.status === "active" ? true : false
                          }
                          tabIndex={campaign?.status === "active" ? -1 : 0}
                          onValueChange={(value, name) => {
                            setValues({
                              ...values,
                              budget: value,
                              people:
                                value > 0
                                  ? Math.round(value / COST_PER_PERSON)
                                  : 0,
                            });
                            if (value <= 0) {
                              setErrors({
                                ...errors,
                                [name]: errorMsgs[name].empty,
                              });
                            } else {
                              setErrors({
                                ...errors,
                                [name]: "",
                              });
                            }
                          }}
                          onBlur={handleBlur}
                        />
                      </div>
                      <div className={cns("bodyText2", stylesEdit.separator)}>
                        <span>- or -</span>
                      </div>
                      <div className={cns(stylesEdit.fieldContainer)}>
                        <label
                          htmlFor="people"
                          className={cns(
                            "bodyText2",
                            "topLabel",
                            stylesEdit.budgetLabel
                          )}
                        >
                          Approx
                        </label>
                        <CurrencyInput
                          className={cns("input", "bodyText2", styles.field, {
                            "form-field-error": errors["budget"] && true,
                          })}
                          id="people"
                          name="people"
                          suffix=" people"
                          placeholder="Please enter a number"
                          defaultValue={0}
                          decimalsLimit={0}
                          value={values.people}
                          disabled={
                            campaign?.status === "active" ? true : false
                          }
                          tabIndex={campaign?.status === "active" ? -1 : 0}
                          onValueChange={(value, name) => {
                            setValues({
                              ...values,
                              budget: value > 0 ? value * COST_PER_PERSON : 0,
                              people: value,
                            });
                            if (value * COST_PER_PERSON <= 0) {
                              setErrors({
                                ...errors,
                                [name]: errorMsgs[name].empty,
                              });
                            } else {
                              setErrors({
                                ...errors,
                                [name]: "",
                              });
                            }
                          }}
                          onBlur={handleBlur}
                        />
                      </div>
                    </div>
                    <span className="error-msg">{errors["budget"]}</span>
                  </div>
                </div>
              </div>
              <div className={cns(styles.card, stylesEdit.upload)} id="upload">
                <div className={cns(styles.row)}>
                  <h5 className={cns("campaignSubHeading")}>Upload</h5>
                  <a
                    href={EXT_LINK_UPLOAD_SPECIFICATIONS}
                    className={cns("extLinkWithIcon")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>
                      Learn More About Creative Upload and Specifications
                    </span>{" "}
                    <ExtLinkIcon />
                  </a>
                </div>
                <div
                  className={cns(styles.row, stylesEdit.uploadDescContainer)}
                >
                  <h4 className={cns("uploadHeading")}>
                    Have no creatives? We&rsquo;ve got our own ad builder.
                  </h4>
                  <div className={cns(stylesEdit.newCreativesContainer)}>
                    <a
                      href={EXT_LINK_AD_BUILDER}
                      className={cns("subHeading", stylesEdit.btnAddAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <AddIcon />
                      <span>NEW CREATIVES</span>
                    </a>
                  </div>
                  <p className={cns("bodyText1", stylesEdit.uploadOr)}>OR</p>
                  <h4 className={cns("uploadHeading")}>Upload Your Own Here</h4>
                  <p className={cns("bodyText2", stylesEdit.addressHint)}>
                    Video should be maximum duration of 5 cents. Per play
                    requires a cent after 12 cents.
                  </p>
                </div>
                <div
                  aria-label="Upload Tabs"
                  className={cns(
                    stylesEdit.tabContainer,
                    stylesEdit.uploadtabContainer
                  )}
                >
                  <span
                    className={cns("tabHeading", "tab", {
                      selected: uploadTab === "image",
                    })}
                    onClick={() => {
                      setUploadTab("image");
                    }}
                  >
                    Image
                  </span>
                  <span
                    className={cns("tabHeading", "tab", {
                      selected: uploadTab === "video",
                    })}
                    onClick={() => {
                      setUploadTab("video");
                    }}
                  >
                    Video
                  </span>
                </div>
                <div>
                  <div className={cns(stylesEdit.uploadCreatives)}>
                    <div>
                      <span className={cns(stylesEdit.uploadIconContainer)}>
                        <UploadsIcon />
                      </span>
                    </div>
                    <div>
                      <label
                        htmlFor="creatives"
                        className={cns("heading6", stylesEdit.uploadLabel, {
                          [stylesEdit.disabled]: campaign?.status === "active",
                        })}
                      >
                        Click to upload
                      </label>{" "}
                      <span className={cns("bodyText2")}>
                        or drag and drop{" "}
                        {uploadTab === "video" && "your videos"}
                      </span>
                    </div>
                    <p className={cns("bodyText2", stylesEdit.addressHint)}>
                      {uploadTab === "image"
                        ? "JPG only (max. 1920 x 1080px)"
                        : "MP4 format only (max. 200MB)"}
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    className={cns(cns("custom-file"), {
                      "form-field-error": errors["creatives"] && true,
                    })}
                    id="creatives"
                    name="creatives"
                    value={""}
                    disabled={campaign?.status === "active" ? true : false}
                    tabIndex={campaign?.status === "active" ? -1 : 0}
                    onChange={handleCreatives}
                    accept={
                      uploadTab === "image"
                        ? "image/jpg, image/png, image/jpeg"
                        : "video/mp4"
                    }
                  />
                  <span className="error-msg">{errors["creatives"]}</span>
                </div>
                <div>
                  {creatives &&
                    creatives.length > 0 &&
                    creatives.map((creative, index) => (
                      <div
                        key={index}
                        className={stylesEdit.creativeDisplayContainer}
                      >
                        <div className={stylesEdit.creativeIconContainer}>
                          <span
                            className={cns(
                              "iconContainerCircle",
                              stylesEdit.creativeIcon
                            )}
                          >
                            {creativesProgress[index] === 100 ? (
                              creative.type === "image" ? (
                                <ImageIcon />
                              ) : (
                                <VideoIcon />
                              )
                            ) : (
                              <FileIcon />
                            )}
                          </span>
                        </div>
                        <div className={stylesEdit.creativePrgressbarContainer}>
                          <h6 className={cns("bodyText2")}>
                            {shortenFileName(creative.name)}
                          </h6>
                          <p className={cns("bodyText2")}>
                            {getSize(creative.size)}
                          </p>
                          <div className={cns(stylesEdit.progressContainer)}>
                            <div>
                              <progress
                                className={cns("custom-progress")}
                                id={`creative-progress-${index}`}
                                value={creativesProgress[index]}
                                max="100"
                              >
                                {" "}
                                {creativesProgress[index]}%{" "}
                              </progress>
                            </div>
                            <span>{creativesProgress[index]}%</span>
                          </div>
                        </div>
                        <div className={stylesEdit.creativeStatusContainer}>
                          <div>
                            {creativesProgress[index] === 100 &&
                              campaign?.status !== "active" && (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    deleteCreative(creative.id);
                                  }}
                                >
                                  <span className={cns("hover-effect-primary")}>
                                    <TrashIcon />
                                  </span>
                                </button>
                              )}
                          </div>
                          <div
                            className={cns(
                              stylesEdit.creativeFinishedIconContainer
                            )}
                          >
                            <span
                              className={cns(
                                "iconContainerCircle",
                                stylesEdit.finishedIcon,
                                {
                                  [stylesEdit.creativeFinishedIcon]:
                                    creativesProgress[index] === 100,
                                },
                                {
                                  [stylesEdit.creativeLoadingIcon]:
                                    creativesProgress[index] !== 100,
                                }
                              )}
                            >
                              {creativesProgress[index] === 100 ? (
                                <SelectIcon />
                              ) : (
                                <UploadingIcon />
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <div className={cns(stylesEdit.creativeInfo)}>
                  <span>
                    <InfoIcon />
                  </span>
                  <p>Do not refresh until your file is fully uploaded</p>
                </div>
                <div className={cns(stylesEdit.uploadHintContainer)}>
                  <p className={cns("bodyText2")}>
                    Creatives can be slightly cropped to accommodate
                    suppliers&rsquo; screen specifications. We suggest to avoid
                    positioning logos and text close to the edges. For best
                    results, leave a 5% margin on each side.{" "}
                    <a
                      href={EXT_LINK_CREATIVE_SPECS}
                      className={cns("extLinkWithIcon")}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      See the complete creative specs
                    </a>
                  </p>
                  <p className={cns("bodyText2")}>
                    Please review our{" "}
                    <a
                      href={EXT_LINK_PLATFORM_POLICY}
                      className={cns("extLinkWithIcon")}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      platform policy
                    </a>{" "}
                    before submitting
                  </p>
                </div>
              </div>
              <div className={cns(stylesEdit.btnContainer)}>
                <button
                  type="submit"
                  className={cns(stylesEdit.saveBtn)}
                  onClick={(event) => {
                    status = statuses[0];
                    handleSubmit(event);
                    setCampaignState("saved");
                  }}
                  disabled={campaign?.status === "active" ? true : false}
                  tabIndex={campaign?.status === "active" ? -1 : 0}
                >
                  Save as proposal
                </button>
                <button
                  type="button"
                  className={cns(stylesEdit.activateBtn)}
                  disabled={
                    user?.role !== "admin" || campaign?.status === "active"
                      ? true
                      : false
                  }
                  tabIndex={
                    user?.role !== "admin" || campaign?.status === "active"
                      ? -1
                      : 0
                  }
                  onClick={(event) => {
                    if (
                      values.publish_dates === "forever" ||
                      values.start_date === getDate()
                    ) {
                      status = statuses[1];
                      setCampaignState("activate");
                    } else {
                      status = statuses[2];
                      setCampaignState("scheduled");
                    }
                    handleSubmit(event);
                  }}
                >
                  Activate
                </button>
              </div>
            </form>
          </div>
          <div className={cns(styles.right)}>
            <div className={cns(styles.mapContainer)}>
              <Map
                isLoaded={isLoaded}
                addresses={addresses}
                screen_selection_id={screen_selection_id}
                drawOnMap={drawOnMap}
                setAddressCenter={setCenter}
                setDrawAreas={setDrawAreas}
                drawAreas={drawAreas}
                placeTypes={placeTypes}
                addressesOfOthersOfSameCategory={addressesOfOthersOfSameCategory}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditCampaign;
