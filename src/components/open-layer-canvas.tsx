/* eslint-disable @typescript-eslint/no-explicit-any */
import { Map, View } from "ol";
import { Draw, Modify, Snap } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import "ol/ol.css";
import Static from "ol/source/ImageStatic.js";
import VectorSource from "ol/source/Vector";

import background from "../assets/snapshot.png";

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

const OpenLayerCanvas = () => {
  const [canvas, setCanvas] = useState<Map | null>(null);
  const [canvasSource, setCanvasSource] = useState<any>(null);

  const mapRef = useRef<any>(null);

  const interactOLCanvas = () => {
    const draw = new Draw({
      source: canvasSource,
      type: method,
    });
    canvas?.addInteraction(draw);
    const snap = new Snap({ source: canvasSource });
    console.log("the snap & draw", { snap, draw });
    canvas?.addInteraction(snap);
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
    // assignments
    setCanvas(map);
    setCanvasSource(source);

    return () => {
      map.setTarget("");
      setCanvasSource(null);
      setCanvas(null);
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "80vh" }}
      onMouseOver={interactOLCanvas}
    />
  );
};

export default OpenLayerCanvas;
