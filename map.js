mapboxgl.accessToken = "pk.eyJ1Ijoicm9tYWtsaW1lbmtvIiwiYSI6ImNqOHl2MGZmbzF6bnczMnIwempmMWFyMTQifQ.Lktfry03Y1aK0dqQvRKkbg";

const map = new mapboxgl.Map({
  bearing: 75,
  container: "map",
  interactive: false,
  style: "mapbox://styles/mapbox/streets-v10",
  center: [12.59, 55.853],
  zoom: 10
});

const reducer = (accumulator, value, index, array) => {
  const threshold = 0.0005;
  const last_x = accumulator.length === 0 ? 0 : accumulator[accumulator.length - 1][0];
  const current_x = value[0];
  const last_y = accumulator.length === 0 ? 0 : accumulator[accumulator.length - 1][1];
  const current_y = value[1];
  if (index === 0
      || Math.abs(last_x - current_x) > threshold
      && Math.abs(last_y - current_y) > threshold) {
    accumulator.push(value);
  }
  return accumulator;
};

const mapper = (activity) => {
  const feature = activity.features[0];
  feature.properties.time = new Date(feature.properties.time);
  feature.coordTimes = undefined;
  feature.geometry.coordinates = feature.geometry.coordinates.reduce(reducer, []);
  return activity;
};

// convert string dates to Date
activities = activities.map(mapper);

// sort activities by date
activities.sort((a, b) => {
  if (a.features[0].properties.time.getTime() > b.features[0].properties.time.getTime()) {
    return 1;
  }
  else if (a.features[0].properties.time.getTime() < b.features[0].properties.time.getTime()) {
    return -1;
  }
  else {
    return 0;
  }
});

const drawPoint = (activityIndex, pointIndex, delay) => {
  if (activityIndex >= activities.length) return;

  const activity = activities[activityIndex];

  geojson.features[0].geometry.coordinates.push(activity.features[0].geometry.coordinates[pointIndex]);
  map.getSource("line-animation").setData(geojson);
  pointIndex++;

  if (pointIndex >= activity.features[0].geometry.coordinates.length) {
    geojson.features[0].geometry.coordinates = [];
    setTimeout(() => drawPoint(activityIndex + 1, 0, delay), 1000);
    return;
  }
  setTimeout(() => drawPoint(activityIndex, pointIndex, delay), delay);
};

const geojson = {
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "geometry": {
      "type": "LineString",
      "coordinates": [[0, 0]]
    }
  }]
};

map.on("load", () => {
  map.addLayer({
    "id": "line-animation",
    "type": "line",
    "source": {
      "type": "geojson",
      "data": geojson
    },
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "red",
      "line-width": 5,
      "line-opacity": .5
    }
  });

  geojson.features[0].geometry.coordinates = [];

  drawPoint(0, 0, 10);
});