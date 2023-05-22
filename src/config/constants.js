export const BASE_URL = "https://rumrum.co";
// export const BASE_URL = "http://localhost:3001";

export const ACCESS_FETCH_INTERVAL = 3600;

// Google Maps
export const GOOGLE_MAPS_API_KEY = "AIzaSyCSMoPYVV_Ts8cMG3RTGhCK-SjjrBH2GHE";
//Foster’s Camana Bay
export const GOOGLE_MAPS_DEFAULT_LAT = 19.32389; // Latitude of 8JFC+G4 George Town, Cayman Islands
export const GOOGLE_MAPS_DEFAULT_LNG = -81.37960; // Longitude of 8JFC+G4 George Town, Cayman Islands

// Path for Icons of Markers
export const GOOGLE_MAPS_MARKER_ICON_PATH_USER = "/img/userMarker.png";
export const GOOGLE_MAPS_MARKER_ICON_PATH_OTHER_USERS_OF_SAME_CATEGORY = "/img/marker.png";
export const GOOGLE_MAPS_MARKER_ICON_PATH_OTHER_BUSINESSES = "/img/marker.png";

// Radius of circle within which markers for other businesses based on category and sub-category will be shown
export const GOOGLE_MAPS_OTHER_BUSINESSES_RADIUS = '3000'; // In Meters

//export const GOOGLE_MAPS_DEFAULT_LAT = 19.2869; // Latitude of 8JCC+QQ George Town, Cayman Islands
//export const GOOGLE_MAPS_DEFAULT_LNG = -81.3674; // Longitude of 8JCC+QQ George Town, Cayman Islands
export const MILES_TO_KM = 1.61;
export const MAP_CIRCLE_MINIMUM_RADIUS = "0.5";
export const MAP_CIRCLE_RADIUS_STEP = "0.5";
export const MAP_CIRCLE_MAXIMUM_RADIUS_ML = "12.5";
export const MAP_CIRCLE_MAXIMUM_RADIUS_KM = "20";

export const MAX_IMAGE_SIZE = 1000000;
export const MAX_VIDEO_SIZE = 200000000;

export const TOAST_AUTO_CLOSE_DURATION = 5000;
export const TOAST_OPTIONS = {
  position: "top-right",
  autoClose: TOAST_AUTO_CLOSE_DURATION,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
};

// External links
export const EXT_LINK_HELP_CREATE_FIRST_CAMPAIGN = "https://help.buzzier.com/";
export const EXT_LINK_UNDERSTAND_CATEGORY_SELECTION =
  "https://help.buzzier.com/";
export const EXT_LINK_UPLOAD_SPECIFICATIONS = "https://help.buzzier.com/";
export const EXT_LINK_AD_BUILDER = "https://help.buzzier.com/";
export const EXT_LINK_CREATIVE_SPECS = "https://help.buzzier.com/";
export const EXT_LINK_PLATFORM_POLICY = "https://help.buzzier.com/";
export const EXT_LINK_HOW_TO_INVITE_GUEST = "https://help.buzzier.com/";

export const COST_PER_PERSON = 0.8;
export const USERS_PER_PAGE = 3;
export const CAMPAIGNS_PER_PAGE = 6;
export const INVOICES_PER_PAGE = 6;
export const PAGINATION_RANGE_DISPLAYED = 3;

export const USER_ROLE_ADMIN = "admin";
export const USER_ROLE_CREATOR = "creator";
export const SCREEN_SELECTION_BY_TARGETS = 0;
export const SCREEN_SELECTION_BY_RADIUS = 1;
export const SCREEN_SELECTION_BY_AREA = 2;
