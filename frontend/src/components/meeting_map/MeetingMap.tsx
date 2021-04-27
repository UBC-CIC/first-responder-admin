import { Auth } from "aws-amplify";
import mapboxgl from "mapbox-gl";
import React, { Component } from "react";
import LocationServiceHelper from "./LocationHelper";
import "./MeetingMap.css";
import Location from "aws-sdk/clients/location";
import { Button } from "react-bootstrap";
import { String } from "aws-sdk/clients/cloudtrail";
let map: mapboxgl.Map;
let marker: mapboxgl.Marker;
let credentials;
let locationService: Location;

const placeIndex = "UBC";
const locationHelper = new LocationServiceHelper();

//Getting current user credentials
async function getLocationService() {
  credentials = await Auth.currentCredentials();
  locationService = new Location({
    credentials,
    region: "us-east-1",
  });
}

// Construct a container to render a map, add navigation (zoom in and out button),
// geolocate(top right button to locate user location)
async function constructMap(container: HTMLDivElement) {
  let center = new mapboxgl.LngLat(-123.14229959999999, 49.2194576);
  map = await locationHelper.constructMapWithCenter(container, center);
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
        animate: false,
        screenSpeed: 1000,
        zoom: 15
      },
      trackUserLocation: true,
      showUserLocation: true
    })
  );

  marker = new mapboxgl.Marker();
}

//Triggers when search button is pressed
//reads the content from the search bar, makes an API request to location services
//flies to the location found on the map view.
function searchAndUpdateMapview(map: mapboxgl.Map, text: String) {
  let longitude = -123.11335999999994;
  let latitude = 49.260380000000055;
  if (text === "") {
    console.log("No input text");
    return;
  }
  locationService.searchPlaceIndexForText(
    {
      IndexName: placeIndex,
      Text: text,
      MaxResults: 1,
      BiasPosition: [longitude, latitude],
    },
    (err, response) => {
      if (err) {
        console.error(err);
      } else if (response && response.Results.length > 0) {
        if (response.Summary.ResultBBox) {
          longitude = response.Summary.ResultBBox[0];
          latitude = response.Summary.ResultBBox[1];
        } else {
          console.error("Error on latitude");
          return;
        }
        marker.setLngLat([longitude, latitude]);
        marker.addTo(map);
        map.flyTo({
          center: [longitude, latitude],
          essential: true,
          zoom: 12,
        });
      }
    }
  );
}

class MapPage extends Component<{}, { searchBarText: string }> {
  container: HTMLDivElement | null | undefined;
  constructor(props: any) {
    super(props);
    this.state = {
      searchBarText: "UBC",
    };
  }

  async componentDidMount() {
    //get current user credentials
    await getLocationService();
    //make map
    await constructMap(this.container as HTMLDivElement);
  }

  handleSearch = () => {
    searchAndUpdateMapview(map, this.state.searchBarText);
  };

  render() {
    return (
      <div id={"mapPage"}>
        <div id={"sbContainer"}>
          <Button
            id={"navBtn"}
            variant="outlined"
            color="secondary"
            onClick={this.handleSearch}
          >
            Search
          </Button>
        </div>
        <div
          className="Map"
          ref={(x) => {
            this.container = x;
          }}
        />
      </div>
    );
  }
}
export default MapPage;
