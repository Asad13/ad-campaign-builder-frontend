import { useState, useEffect, memo, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  GoogleMap,
  MarkerClusterer,
  Marker,
  Circle,
  Polyline,
  Polygon,
  InfoBox
} from "@react-google-maps/api";
import mapStyles from "./MapStyles.json";
import {
  GOOGLE_MAPS_DEFAULT_LAT,
  GOOGLE_MAPS_DEFAULT_LNG,
  MILES_TO_KM,
  SCREEN_SELECTION_BY_RADIUS,
  SCREEN_SELECTION_BY_AREA,
  GOOGLE_MAPS_MARKER_ICON_PATH_USER,
  GOOGLE_MAPS_MARKER_ICON_PATH_OTHER_USERS_OF_SAME_CATEGORY,
  GOOGLE_MAPS_MARKER_ICON_PATH_OTHER_BUSINESSES,
  GOOGLE_MAPS_OTHER_BUSINESSES_RADIUS
} from "@config/constants";
import styles from "./Map.module.scss";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const options = {
  strokeColor: "#dc3545",
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: "#B69538",
  fillOpacity: 0.4,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
  radius: 30000,
  zIndex: 1,
};

const infoBoxOptions = { closeBoxURL: "", enableEventPropagation: false };

const initialCenter = {
  lat: GOOGLE_MAPS_DEFAULT_LAT,
  lng: GOOGLE_MAPS_DEFAULT_LNG,
};

function getRadiusInMeters(metric, radius) {
  const circleRadius =
    metric === "ml"
      ? Math.round(Number(radius) * MILES_TO_KM * 1000)
      : Math.round(Number(radius) * 1000);

  return circleRadius;
}

// To generate demo users marker
const generateUsers = (position) => {
  const users = [];

  users.push(
    {
      lat: 19.324722759977945,
      lng: -81.3814091517057,
      label: "Saltwater Grill",
    },
    {
      lat: 19.324339660695927,
      lng: -81.3814536105274,
      label: "Sports Supply",
    },
    {
      lat: 19.32533814420984,
      lng: -81.38137822010377,
      label: "Blue Cilantro",
    },
    {
      lat: 19.326071300828367,
      lng: -81.38137852202743,
      label: "Lone Star Bar & Grill",
    },
    {
      lat: 19.327210670031263,
      lng: -81.38086143924306,
      label: "Taco Cantina",
    },
    {
      lat: 19.323878491572202,
      lng: -81.37969507961898,
      label: "Foster’s Camana Bay",
    },
    {
      lat: 19.323111444504963,
      lng: -81.37922628029804,
      label: "Gelato & Co.",
    },
    {
      lat: 19.321969986343703,
      lng: -81.37896262488209,
      label: "Next Chapter Ltd",
    },
    {
      lat: 19.32196757009173,
      lng: -81.37883390804639,
      label: "Starbucks Camana Bay",
    },
    {
      lat: 19.322312237655854,
      lng: -81.37845431807898,
      label: "Camana Bay Cinema",
    },
    {
      lat: 19.321316047754472,
      lng: -81.3777957372597,
      label: "Audiophile",
    },
    {
      lat: 19.322110887777065,
      lng: -81.37780993313143,
      label: "Sand Angels",
    },
    {
      lat: 19.322094637320582,
      lng: -81.37735712277396,
      label: "Karoo",
    },
    {
      lat: 19.322339232058226,
      lng: -81.37723231991785,
      label: "Pani Indian Kitchen",
    },
    {
      lat: 19.32312420068358,
      lng: -81.37791317437444,
      label: "Anytime Fitness",
    },
    {
      lat: 19.328038826737604,
      lng: -81.38218469440027,
      label: "Tillie's",
    },
    {
      lat: 19.328944814178175,
      lng: -81.3805825484089,
      label: "Integra Healthcare Ltd",
    },
    {
      lat: 19.331058768979045,
      lng: -81.38052872573775,
      label: "Gino's Pizzeria",
    },
    {
      lat: 19.331616924092526,
      lng: -81.37925913414415,
      label: "J. Michael",
    },
    {
      lat: 19.33178712357886,
      lng: -81.38020946681497,
      label: "The Lodge Cayman",
    }
  );

  return users;
};

const Map = ({
  isLoaded,
  addresses,
  screen_selection_id,
  drawOnMap,
  setAddressCenter,
  setDrawAreas,
  drawAreas,
  placeTypes,
  addressesOfOthersOfSameCategory
}) => {
  const { user } = useSelector(
    (state) => state.auth
  );

  const [map, setMap] = useState(null);

  const [placesService, setPlacesService] = useState(null);

  const [center, setCenter] = useState({ ...initialCenter });

  const [userLocation, setUserLocation] = useState([]);

  const [isdraw, setIsDraw] = useState(false);

  const [drawPath, setDrawPath] = useState([]);

  const [isPolygon, setIsPolygon] = useState(false);

  const [circleCenter1, setCircleCenter1] = useState({...initialCenter});

  const [radius1, setRadius1] = useState(0);

  const [placeTypesFethced, setPlaceTypesFethced] = useState([]);

  const [otherBusinessesOfSameCategory, setOtherBusinessesOfSameCategory] = useState([]);

  const [otherBusinessesOfSameCategoryMarkers, setOtherBusinessesOfSameCategoryMarkers] = useState([]);

  const [otherBusinesses, setOtherBusinesses] = useState([]);

  const [otherBusinessesMarkers, setOtherBusinessesMarkers] = useState([]);

  const [showInfoBox, setShowInfoBox] = useState(false);

  const [infoBoxContent, setInfoBoxContent] = useState({});

  const onLoad = useCallback(
    (mapInstance) => {
      setMap(mapInstance);
      const service = new window.google.maps.places.PlacesService(mapInstance);
      setPlacesService(service);
    },
    []
  );

  useEffect(() => {
    let userCenters = [];
    if(user?.address && user?.address?.length > 0){
      for(let i = 0; i < user?.address.length; i++){
        if(user?.address[i] && user?.address[i]?.lat && user?.address[i]?.lng){
          userCenters.push({
            lat: user?.address[i]?.lat,
            lng: user?.address[i]?.lng,
          });
        }
      }
    }

    setCenter(userCenters.length > 0 ? {lat: userCenters[0].lat, lng: userCenters[0].lng - 0.13} : {...initialCenter });
    setUserLocation(userCenters);
  },[user?.address]);

  useEffect(() => {
    if(addressesOfOthersOfSameCategory){
      let changed = false;
      const newOtherBusinessesOfSameCategory = [...otherBusinessesOfSameCategory];
      const newOtherBusinessesOfSameCategoryMarkers = [...otherBusinessesOfSameCategoryMarkers];
      for(const property in addressesOfOthersOfSameCategory){
        if(newOtherBusinessesOfSameCategory.indexOf(property) === -1){
          changed = true;
          newOtherBusinessesOfSameCategory.push(property);
          for(let i = 0; i < addressesOfOthersOfSameCategory[property].length; i++){
            const label = addressesOfOthersOfSameCategory[property][i].company_name;
            addressesOfOthersOfSameCategory[property][i].address.forEach((item,index) => {
              newOtherBusinessesOfSameCategoryMarkers.push({
                key: `${i}${index}${item.id}`,
                position: {
                  lat: item.lat,
                  lng: item.lng,
                },
                label: label,
                address: item.address
              })
            })
          }
        }
      }
      
      if(changed) {
        setOtherBusinessesOfSameCategory(newOtherBusinessesOfSameCategory);
        setOtherBusinessesOfSameCategoryMarkers(newOtherBusinessesOfSameCategoryMarkers);
      }else{
        if(Object.keys(addressesOfOthersOfSameCategory).length === 0){
          setOtherBusinessesOfSameCategory([]);
          setOtherBusinessesOfSameCategoryMarkers([]);
        }
      }
    }else{
      setOtherBusinessesOfSameCategory([]);
      setOtherBusinessesOfSameCategoryMarkers([]);
    }
  },[addressesOfOthersOfSameCategory]);

  useEffect(() => {
    if(isLoaded && map){
      if(placeTypesFethced.length > placeTypes.length){
        let newPlaceTypesFethced = [...placeTypesFethced];
        let newOtherBusinesses = [...otherBusinesses];
        for(let i = 0; i < newPlaceTypesFethced.length; i++){
          if(placeTypes.indexOf(newPlaceTypesFethced[i]) === -1){
            newOtherBusinesses = newOtherBusinesses.filter(place => place.type !== newPlaceTypesFethced[i]);
            newPlaceTypesFethced.splice(i,1);
          }
        }
        setOtherBusinesses(newOtherBusinesses);
        setPlaceTypesFethced(newPlaceTypesFethced);
      }else if(placeTypesFethced.length < placeTypes.length && placeTypesFethced.length < 97){
        for(let i = 0; i < placeTypes.length; i++){
            if(placeTypesFethced.indexOf(placeTypes[i]) === -1){
              setPlaceTypesFethced(oldplaceTypesFethced => {
                return [...oldplaceTypesFethced, placeTypes[i]];
              });

            const request = {
              location: {
                lat: center.lat,
                lng: center.lng + 0.13,
              },
              radius: GOOGLE_MAPS_OTHER_BUSINESSES_RADIUS,
              query: placeTypes[i]
            };
            
            placesService.textSearch(request, (results, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                const newPlaces = results.map(place => ({
                  id: place.place_id,
                    label: place.name,
                    type: placeTypes[i],
                    position: {
                      lat: place.geometry.location.lat(),
                      lng: place.geometry.location.lng()
                    }
                }));
                
                setOtherBusinesses(oldPlaces => {
                  return [...oldPlaces,...newPlaces];
                });
              }
            });
          }
        }
      }
    }
  },[placeTypes, isLoaded, map, center, otherBusinesses, placeTypesFethced, placesService]);

  useEffect(() => {
    if(placeTypesFethced.length <= placeTypes.length){
      setOtherBusinessesMarkers([...otherBusinesses]);
    }
  },[otherBusinesses, placeTypesFethced.length, placeTypes.length]);

  useEffect(() => {
    //&& addresses[0].town && addresses[0].state && addresses[0].postcode
    if (isLoaded && addresses[0].address) {
      const geocoder = new window.google.maps.Geocoder();
      const address = addresses[0].address;
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK") {
          const newCenter = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          };
          setCenter({
            lat: newCenter.lat,
            lng: newCenter.lng - 0.13,
          });
          setCircleCenter1(newCenter);
          setAddressCenter(newCenter, 0);
          setRadius1(
            getRadiusInMeters(addresses[0].metric, addresses[0].radius)
          );
        } else {
          setCenter({...initialCenter});
          setCircleCenter1({...initialCenter});
          setAddressCenter({...initialCenter}, 0);
          setRadius1(0);
        }
      });
    } else {
      setCircleCenter1({...initialCenter});
      setAddressCenter({...initialCenter}, 0);
      setRadius1(0);
    }
  }, [isLoaded, addresses[0].address]); //  addresses[0].town, addresses[0].state, addresses[0].postcode

  useEffect(() => {
    if (isLoaded && radius1 !== 0 && addresses[0].address) {
      setRadius1(getRadiusInMeters(addresses[0].metric, addresses[0].radius));
    }
  }, [isLoaded, addresses[0].radius, addresses[0].metric]);

  useEffect(() => {
    if (screen_selection_id === SCREEN_SELECTION_BY_AREA) {
      if (drawAreas?.points.length > 0) {
        setDrawPath(drawAreas.points);
        setIsPolygon(true);
      }
    }
    if (drawAreas?.points.length === 0) {
      setDrawPath([]);
      setIsPolygon(false);
    }
  }, [isLoaded, screen_selection_id, drawAreas.points]);

  useEffect(() => {
    if (screen_selection_id === SCREEN_SELECTION_BY_RADIUS) {
      setIsDraw(false);
      setDrawPath([]);
      setIsPolygon(false);
    } else if (screen_selection_id === SCREEN_SELECTION_BY_AREA) {
      setCircleCenter1({...initialCenter});
      setAddressCenter({...initialCenter}, 0);
      setRadius1(0);
    }
  }, [screen_selection_id]);

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isLoaded === null) setErrorMsg("Unable to show map");
  }, [isLoaded]);

  // Setting Map center to user current location is turned off
  // useEffect(() => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition((position) => {
  //       setCenter({
  //         lat: position.coords.latitude,
  //         lng: position.coords.longitude,
  //       });
  //     });
  //   }
  // }, []);

  const handleShowInfoBox = useCallback((label, address, position) => {
    if(map) {
      const request = {
        query: `${label}, ${address}`,
        fields: ["photos"],
      };

      placesService.findPlaceFromQuery(request, (results, status) => {
        setShowInfoBox(true);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setInfoBoxContent({
            name: label,
            address: address,
            position: position,
            imgUrl: results[0].photos[0].getUrl()
          });
        }else{
          setInfoBoxContent({
            name: label,
            address: address,
            position: position,
          });
        }
      });
    }
  },[map, placesService]);

  const users = useMemo(() => generateUsers(center), [center]);

  return (
    <>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          onDragEnd={() => {
            if(map){
              setCenter({lat: map.center.lat(), lng: map.center.lng()});
            }
          }}
          onLoad={onLoad}
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
              setIsPolygon(false);
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
              setIsPolygon(true);
            }
          }}
        >
          {/* Child components, such as markers, info windows, etc. */}
          {users && users.length > 0 && (
            <MarkerClusterer>
              {(clusterer) =>
                users.map((user) => (
                  <Marker
                    key={user.lat}
                    position={user}
                    label={user.label}
                    clusterer={clusterer}
                    opacity={0.9}
                    icon={{
                      url: "/img/marker.png",
                      labelOrigin: new window.google.maps.Point(17, 48),
                    }}
                  />
                ))
              }
            </MarkerClusterer>
          )}
          {!isPolygon && <Polyline path={drawPath} options={options} />}
          {isPolygon && (
            <Polygon
              path={drawPath}
              options={options}
              onLoad={(polygon) => {
                let points = [];
                if (polygon.getPath()?.Sc) {
                  points = polygon.getPath()?.Sc.map((item) => {
                    return {
                      lat: item.lat(),
                      lng: item.lng(),
                    };
                  });
                } else if (polygon.getPath()?.Vc) {
                  points = polygon.getPath()?.Vc.map((item) => {
                    return {
                      lat: item.lat(),
                      lng: item.lng(),
                    };
                  });
                } else if (polygon.getPath()?.g) {
                  points = polygon.getPath()?.g.map((item) => {
                    return {
                      lat: item.lat(),
                      lng: item.lng(),
                    };
                  });
                } else if (drawPath && drawPath.length > 0) {
                  points = [...drawPath];
                }

                const area = window.google.maps.geometry.spherical.computeArea(
                  polygon.getPath()
                );

                setDrawAreas({ points: points, area: area });
              }}
            />
          )}
          {addresses[0].address && (
            <Circle center={circleCenter1} radius={radius1} options={options} />
          )}
          {
            userLocation &&
              userLocation.length > 0 &&
                userLocation.map((pos,index) => (
                  <Marker
                    key={pos.lat}
                    position={pos}
                    label={`${user.address[index].address}`}
                    zIndex={4}
                    icon={{
                      url: GOOGLE_MAPS_MARKER_ICON_PATH_USER,
                      labelOrigin: new window.google.maps.Point(17,-8),
                    }}
                    />
                ))
          }
          {
            otherBusinessesOfSameCategoryMarkers &&
              otherBusinessesOfSameCategoryMarkers.length > 0 &&
                <MarkerClusterer>
                  {(clusterer) =>
                    otherBusinessesOfSameCategoryMarkers.map((item,index) => (
                      <Marker
                        key={`${item.key}`}
                        position={item.position}
                        label={{
                          text: item.label,
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "#000000"
                        }}
                        zIndex={3}
                        onClick={() => {
                          if(!showInfoBox){
                            handleShowInfoBox(item.label, item.address, item.position);
                          }else{
                            setShowInfoBox(false);
                            setInfoBoxContent({});
                          }
                        }}
                        onMouseOver={() => {
                          if(!showInfoBox){
                            handleShowInfoBox(item.label, item.address, item.position);
                          }
                        }}
                        onMouseOut={() => {
                          setShowInfoBox(false);
                          setInfoBoxContent({});
                        }}
                        clusterer={clusterer}
                        icon={{
                          url: GOOGLE_MAPS_MARKER_ICON_PATH_OTHER_USERS_OF_SAME_CATEGORY,
                          labelOrigin: new window.google.maps.Point(17,-8),
                        }}
                      />
                    ))
                  }
                </MarkerClusterer>
          }
          {
            otherBusinessesMarkers &&
              otherBusinessesMarkers.length > 0 &&
                <MarkerClusterer>
                  {(clusterer) =>
                    otherBusinessesMarkers.map((item,index) => (
                      <Marker
                        key={`${item.id}${index}`}
                        position={item.position}
                        label={{
                          text: item.label,
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "#000000"
                        }}
                        zIndex={2}
                        clusterer={clusterer}
                        icon={{
                          url: GOOGLE_MAPS_MARKER_ICON_PATH_OTHER_BUSINESSES,
                          labelOrigin: new window.google.maps.Point(17,-8),
                        }}
                        />
                    ))
                  }
                </MarkerClusterer>
          }
          {
            showInfoBox && (
              <InfoBox
                options={infoBoxOptions}
                position={infoBoxContent.position}
                zIndex={10}
              >
                <div className={styles.infoBox}>
                  <div className={styles.infoContent}>
                    <h3>{infoBoxContent.name}</h3>
                    <p>{infoBoxContent.address}</p>
                    {
                      infoBoxContent?.imgUrl && (
                        <img
                          src={infoBoxContent.imgUrl}
                          alt={infoBoxContent.name}
                          className="img"
                        />
                      )
                    }
                  </div>
                </div>
              </InfoBox>
            )
          }
        </GoogleMap>
      ) : (
        <p className={styles.mapError}>{errorMsg}</p>
      )}
    </>
  );
};

export default memo(Map);
