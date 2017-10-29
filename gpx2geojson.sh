#!/bin/sh
# chmod +x gpx2geojson.sh

GPX_DIR=./gpx/cph-marathon-2015
GEOJSON_DIR=./geojson/cph-marathon-2015

for FILE in "$GPX_DIR"/*.gpx
do
   FILENAME_WITH_EXTENSION=$(basename $FILE)
   FILENAME="${FILENAME_WITH_EXTENSION%.*}"

    ./node_modules/.bin/togeojson -f gpx $FILE > "$GEOJSON_DIR/$FILENAME.geojson"
done

cd $GEOJSON_DIR

jq -s '.' activity_*.geojson > activities.json

cd -