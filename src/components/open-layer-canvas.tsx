/* eslint-disable @typescript-eslint/no-explicit-any */
import { Map, View } from "ol";
import { Draw, Modify, Snap } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import "ol/ol.css";
import Static from "ol/source/ImageStatic.js";
import VectorSource from "ol/source/Vector";
import { getLength } from "ol/sphere.js";

import background from "../assets/snapshot.png";

import { unByKey } from "ol/Observable";
import { getCenter } from "ol/extent";
import ImageLayer from "ol/layer/Image";
import { Projection } from "ol/proj";
import { useLayoutEffect, useRef, useState } from "react";

export type METHOD = "Point" | "LineString" | "Polygon" | "Circle";
const method = "LineString";
const extent = [-20000000, -20000000, 20000000, 20000000];
const projection = new Projection({
  code: "custom-image",
  units: "pixels",
  extent: extent,
});

const initialPolygonDrawnCordinated = [
  [-9853867.336152684, -344777.0856239237],
  [769083.360481739, 8790161.05395447],
  [1672531.6249697953, -4416897.789329892],
  [-9880549.27360671, -392389.0200878959],
];

const formatLength = function (line: any) {
  const length = getLength(line);
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + " " + "km";
  } else {
    output = Math.round(length * 100) / 100 + " " + "m";
  }
  return output;
};

const OpenLayerCanvas = () => {
  const [canvas, setCanvas] = useState<Map | null>(null);
  const [canvasSource, setCanvasSource] = useState<any>(null);
  const [drawCanvas, setDrawCanvas] = useState<any>(null);
  const [snapCanvas, setSnapCanvas] = useState<any>(null);

  const mapRef = useRef<any>(null);

  // drawing overlay
  const interactOLCanvas = () => {
    let listener: any = null;
    let sketch: any = null;
    drawCanvas.on("drawstart", function (evt: any) {
      sketch = evt.feature;
      listener = sketch.getGeometry().on("change", function (evt: any) {
        const geom = evt.target;
        const perimeter = formatLength(geom);
        console.log("the output is", perimeter);
      });
    });

    drawCanvas.on("drawend", function () {
      sketch = null;
      unByKey(listener);
    });
  };

  const removeSelection = () => {
    canvasSource.clear();
  };

  // remove last point
  const removeLastPoint = () => {
    drawCanvas.removeLastPoint();
    snapCanvas.removeLastPoint();
  };

  useLayoutEffect(() => {
    const source = new VectorSource();
    // const osmLayer = new TileLayer({
    //   source: new OSM(),
    // });

    const vector = new VectorLayer({
      source: source,
      style: {
        "fill-color": "rgba(255, 255, 255, 0.2)",
        "stroke-color": "#ffcc33",
        "stroke-width": 2,
        "circle-radius": 7,
        "circle-fill-color": "#ffcc33",
      },
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new ImageLayer({
          source: new Static({
            url: background,
            imageExtent: extent,
            projection: projection,
          }),
        }),
        vector,
      ],
      view: new View({
        center: getCenter(extent),
        zoom: 2,
      }),
    });

    const modify = new Modify({ source: source });
    map.addInteraction(modify);
    const draw = new Draw({
      source: source,
      type: method,
    });
    map.addInteraction(draw);
    const snap = new Snap({ source: source });
    map.addInteraction(snap);
    // assignments
    setCanvas(map);
    setCanvasSource(source);
    setDrawCanvas(draw);
    setSnapCanvas(snap);

    return () => {
      map.setTarget("");
      setCanvasSource(null);
      setCanvas(null);
    };
  }, []);

  return (
    <div>
      <div>
        <button onClick={() => removeLastPoint()}>Remove Last Point</button>
        <button onClick={() => removeSelection()}>Clear selection</button>
      </div>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "80vh" }}
        onMouseEnter={interactOLCanvas}
      />
    </div>
  );
};

export default OpenLayerCanvas;
