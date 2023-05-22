import { useState, useEffect, memo } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import mapStyles from "./MapStyles.json";
import {
  GOOGLE_MAPS_DEFAULT_LAT,
  GOOGLE_MAPS_DEFAULT_LNG,
} from "@config/constants";
import styles from "./Map.module.scss";
import useDebounce from "../../hooks/useDebounce";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const initialCenter = {
  lat: GOOGLE_MAPS_DEFAULT_LAT,
  lng: GOOGLE_MAPS_DEFAULT_LNG,
};

const DynamicMap = ({
  isLoaded,
  drawOnMap,
  getAllAddress,
  setGetAllAddress,
  debouncedgetAllAddress,
  trigger,
}) => {
  const [isdraw, setIsDraw] = useState(false);
  const [drawPath, setDrawPath] = useState([]);
  const [center, setCenter] = useState({ ...initialCenter });
  const [errorMsg, setErrorMsg] = useState("");
  const dbTrigger = useDebounce(trigger, 600);
  const dbTriggerTwo = useDebounce(trigger, 900);

  useEffect(() => {
    console.count("Triggered UseEffect Dya");
    if (isLoaded) {
      const geocoder = new window.google.maps.Geocoder();
      const tempResults = []; // Temporary array to store geocoding results
      const tempGetAllAddress = [...getAllAddress];
      Promise.all(
        tempGetAllAddress?.map((data, index) => {
          if (data.address === "" && data?.lat && data?.lng) {
            const latLng = new window.google.maps.LatLng(data?.lat, data?.lng);
            return new Promise((resolve) => {
              geocoder.geocode({ location: latLng }, (results, status) => {
                if (status === "OK") {
                  const getAddress = results?.[0].formatted_address;
                  tempGetAllAddress[index].address = getAddress;
                  resolve({ getAddress });
                } else {
                  console.error(`Geocode error: ${status}`);
                  resolve(null);
                }
              });
            });
          }

          if (data.address !== "") {
            return new Promise((resolve) => {
              geocoder.geocode({ address: data.address }, (results, status) => {
                if (status === "OK") {
                  const lat = results[0].geometry.location.lat();
                  const lng = results[0].geometry.location.lng();
                  const address = data.address;
                  tempGetAllAddress[index] = { id: index, lat, lng, address };
                  resolve({ lat, lng, address });
                } else {
                  console.error(`Geocode error: ${status}`);
                  resolve(null);
                }
              });
            });
          } else {
            return Promise.resolve(null);
          }
        })
      ).then((results) => {
        const newUpdatedLocation = results.filter((r) => r !== null);
        if (
          newUpdatedLocation.length > 0 &&
          newUpdatedLocation[tempGetAllAddress.length - 1]?.lat &&
          newUpdatedLocation[tempGetAllAddress.length - 1]?.lng
        ) {
          setCenter({
            lat: newUpdatedLocation[tempGetAllAddress.length - 1]?.lat,
            lng: newUpdatedLocation[tempGetAllAddress.length - 1]?.lng,
          });
        }
        if (
          tempGetAllAddress.length > 0 &&
          JSON.stringify(tempGetAllAddress) !==
            JSON.stringify(debouncedgetAllAddress)
        ) {
          setGetAllAddress([...tempGetAllAddress]);
        }
      });
    }
  }, [isLoaded, dbTrigger, dbTriggerTwo]);

  useEffect(() => {
    if (isLoaded === null) setErrorMsg("Unable to show map");
  }, [isLoaded]);

  const onMarkerDragEnd = (coord, id) => {
    const tempMarkerCo = [...getAllAddress];
    const { latLng } = coord;
    const lat = latLng.lat();
    const lng = latLng.lng();
    let address = "";
    const geocoder = new window.google.maps.Geocoder();
    const templatLng = new window.google.maps.LatLng(lat, lng);

    new Promise((resolve) => {
      geocoder.geocode({ location: templatLng }, (results, status) => {
        if (status === "OK") {
          const getAddress = results?.[0].formatted_address;
          address = getAddress;
          resolve({ getAddress });
        } else {
          console.error(`Geocode error: ${status}`);
          resolve(null);
        }
      });
    }).then(() => {
      const markerIndex = tempMarkerCo.findIndex((d) => d.id === id);
      tempMarkerCo.splice(markerIndex, 1, {
        id: tempMarkerCo[markerIndex].id,
        lat,
        lng,
        address,
      });
      setGetAllAddress(tempMarkerCo);
    });
  };

  return (
    <>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={11}
          options={{
            draggable: !isdraw,
            zoomControl: !isdraw,
            scrollwheel: !isdraw,
            disableDoubleClickZoom: !isdraw,
            disableDefaultUI: true,
            styles: mapStyles,
          }}
          onMouseDown={() => {
            if (drawOnMap) {
              setIsDraw(true);
              setDrawPath([]);
            }
          }}
          onMouseMove={(event) => {
            if (isdraw && drawOnMap) {
              const newDrawPath = [...drawPath];
              newDrawPath.push({
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
              });
              setDrawPath(newDrawPath);
            }
          }}
          onMouseUp={() => {
            if (drawOnMap) {
              setIsDraw(false);
            }
          }}
        >
          {/* Child components, such as markers, info windows, etc. */}

          {getAllAddress?.map(
            (position, index) =>
              position?.lat &&
              position?.lng && (
                <Marker
                  draggable={true}
                  onDragEnd={(coord) => {
                    onMarkerDragEnd(coord, position?.id);
                  }}
                  position={{ lat: position?.lat, lng: position?.lng }}
                  title="Your Location"
                  icon={{
                    url: "/img/marker.png",
                    labelOrigin: new window.google.maps.Point(17, 48),
                  }}
                />
              )
          )}
        </GoogleMap>
      ) : (
        <p className={styles.mapError}>{errorMsg}</p>
      )}
    </>
  );
};

export default memo(DynamicMap);
