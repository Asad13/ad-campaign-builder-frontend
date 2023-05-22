import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getAccessToken } from "@redux/features/auth/authSlice";

function Token() {
  const location = useLocation();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAccessToken());
  }, [location.pathname]);

  return null;
}

export default Token;