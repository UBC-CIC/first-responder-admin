import { API, Auth } from "aws-amplify";
import { String } from "aws-sdk/clients/cloudtrail";
import Location from "aws-sdk/clients/location";
import mapboxgl from "mapbox-gl";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import ReactDOM from "react-dom";
import { getMeetingDetailsByStatus } from "../../common/graphql/queries";
import {
  onCreateMeetingDetail,
  onUpdateMeetingDetail,
} from "../../common/graphql/subscriptions";
import {
  AttendeeType,
  MeetingDetail,
  GeolocationCoordinates,
} from "../../common/types/API";
import LocationServiceHelper from "./LocationHelper";
import "./MeetingMap.css";

let credentials;
let locationService: Location;

const placeIndex = "UBC";
const locationHelper = new LocationServiceHelper();

type MeetingDetailWithLocation = MeetingDetail & {
  location?: GeolocationCoordinates;
};

const getLocationService = async () => {
  credentials = await Auth.currentCredentials();
  locationService = new Location({
    credentials,
    region: "us-east-1",
  });
};

/** TODO: Cache map (somehow) so it isn't rebuilt on every re-render  */
const constructMap = async (
  container: HTMLDivElement,
  setFunction: Function,
  callback: (builtMap: mapboxgl.Map) => void
) => {
  const center = new mapboxgl.LngLat(-106.3468, 56.1304);
  const map = await locationHelper.constructMapWithCenter(container, center);
  setFunction(() => map);
  map.addControl(
    new mapboxgl.NavigationControl({ showCompass: false }),
    "top-left"
  );
  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      fitBoundsOptions: {
        zoom: 15,
      },
      trackUserLocation: true,
      showUserLocation: true,
    })
  );

  map.on("load", () => {
    map.addLayer({id: "markers", type: "symbol"})
  })
  callback(map);
};

const filterMeetingsByLocation = (meetings: MeetingDetail[]) => {
  return (meetings as MeetingDetailWithLocation[]).filter((meeting) => {
    const attendees = meeting.attendees;
    let foundAttendee = attendees?.find(
      (attendee) =>
        attendee?.attendee_type === AttendeeType.FIRST_RESPONDER &&
        attendee.location !== undefined
    );
    if (!foundAttendee) return false;
    meeting.location = foundAttendee.location;
    return true;
  });
};

const clearMarkersFromMap = (markers: mapboxgl.Marker[]) => {
  markers.forEach((marker) => marker.remove());
};

const MapPage = () => {
  const [container, setContainer] = useState<
    HTMLDivElement | null | undefined
  >();
  const [map, setMap] = useState<mapboxgl.Map | undefined>();
  const [items, updateItems] = useState<Array<MeetingDetail>>(
    new Array<MeetingDetail>()
  );

  /** Invariant: meetingsWithLocation.length == markers.length */
  const [meetingsWithLocation, setMeetingsWithLocation] = useState<
    MeetingDetailWithLocation[]
  >([]);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const stateRef = useRef<Array<MeetingDetail>>();
  stateRef.current = items;

  /** Graphql Subscription Setup */
  useEffect(() => {
    async function subscribeCreateMeetings() {
      const subscription: any = API.graphql({
        query: onCreateMeetingDetail,
      });

      subscription.subscribe({
        next: (data: any) => {
          const newItems = [];
          let found = false;
          if (data.value.data) {
            for (let item of stateRef.current!) {
              if (
                data.value.data.onCreateMeetingDetail.meeting_id ===
                item.meeting_id
              ) {
                // Found existing item so we will update this item
                newItems.push(data.value.data.onCreateMeetingDetail);
                found = true;
              } else {
                // Keep existing item
                newItems.push(item);
              }
            }
            if (!found) {
              newItems.push(data.value.data.onCreateMeetingDetail);
            }
            updateItems(newItems);
          }
        },
        error: (error: any) => console.warn(error),
      });
    }

    async function subscribeUpdateMeetings() {
      const subscription: any = API.graphql({
        query: onUpdateMeetingDetail,
      });

      subscription.subscribe({
        next: (data: any) => {
          const newItems = [];
          if (data.value.data.onUpdateMeetingDetail) {
            for (let item of stateRef.current!) {
              if (
                data.value.data.onUpdateMeetingDetail.meeting_id ===
                item.meeting_id
              ) {
                // Found existing item so we will update this item
                newItems.push(data.value.data.onUpdateMeetingDetail);
              } else {
                // Keep existing item
                newItems.push(item);
              }
            }
            updateItems(newItems);
          }
        },
        error: (error: any) => console.warn(error),
      });
    }

    async function callListAllMeetings() {
      try {
        const meetings: any = await API.graphql({
          query: getMeetingDetailsByStatus,
          variables: {
            meetingStatus: "ACTIVE",
            limit: 25,
          },
        });
        const itemsReturned: Array<MeetingDetail> =
          meetings["data"]["getMeetingDetailsByStatus"]["items"];
        console.log("getMeetingDetailsByStatus meetings:", itemsReturned);
        updateItems(itemsReturned);
      } catch (e) {
        console.log("getMeetingDetailsByStatus errors:", e.errors);
      }
    }

    callListAllMeetings();
    subscribeCreateMeetings();
    subscribeUpdateMeetings();
  }, []);

  /** Set up mapbox ui, center on user's position or Canada on map*/
  useEffect(() => {
    const f = async () => {
      await getLocationService();
      if (!map)
        await constructMap(
          container as HTMLDivElement,
          setMap,
          (builtMap: mapboxgl.Map) => {
            navigator.geolocation.getCurrentPosition((pos) => {
              builtMap.flyTo({
                center: [pos.coords.longitude, pos.coords.latitude],
                essential: false,
                animate: true,
                duration: 1000,
                zoom: 15,
              });
            });
          }
        );
    };

    if (container && !map) f();
  }, [container, map]);

  useEffect(() => {
    if (!map || !items) return;
    /** Get only meetings with a location attached */
    const filteredMeetings = filterMeetingsByLocation(items);
    setMeetingsWithLocation(() => filteredMeetings);

    /** Make markers with meeting locations */
    const newMarkers = filteredMeetings
      .map((meeting) => {
        if (!meeting.location?.longitude || !meeting.location.latitude) return;

        const { longitude, latitude } = meeting.location;
        let currMarker = new mapboxgl.Marker()
          .setLngLat([longitude, latitude])
          .addTo(map);
        let markerElement = currMarker.getElement();

        // markerElement.onclick = (ev) => {
        //   currMarker.togglePopup();
        //   console.log("marker");
        // };
        // console.log(markerElement);

        currMarker.setPopup(new mapboxgl.Popup({ offset: 18 }).setHTML(''));

        markerElement.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          markerElement.classList.add('enlarge');
  
          if (!currMarker.getPopup().isOpen()) {
            currMarker.getPopup().addTo(map);
  
            ReactDOM.render(
              <p>{meeting.meeting_id}</p>,
              document.querySelector('.mapboxgl-popup-content')
            );
          }
        });

        return currMarker;
      })
      .filter((item) => !!item);

    /** Redraw all the markers */
    clearMarkersFromMap(markers);
    console.log(newMarkers);

    setMarkers(() => newMarkers as mapboxgl.Marker[]);
  }, [items, map]);

  return (
    <div id={"mapPage"}>
      <div
        className="Map"
        ref={(x) => {
          setContainer(() => x);
        }}
      />
    </div>
  );
};
export default MapPage;
