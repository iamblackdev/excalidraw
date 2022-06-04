import React, { useEffect, useState, useRef, useCallback } from "react";
import Excalidraw, {
  exportToCanvas,
  exportToSvg,
  exportToBlob,
  serializeAsJSON,
} from "@excalidraw/excalidraw";
import InitialData from "./initialData";

import "./App.scss";
import initialData from "./initialData";

const resolvablePromise = () => {
  let resolve;
  let reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
};

const renderTopRightUI = () => {
  return (
    <button onClick={() => alert("This is dummy top right UI")}>
      {" "}
      Click me{" "}
    </button>
  );
};

const renderFooter = () => {
  return (
    <button onClick={() => alert("This is dummy footer")}>
      {" "}
      custom footer{" "}
    </button>
  );
};

export default function App() {
  const excalidrawRef = useRef(null);

  const [viewModeEnabled, setViewModeEnabled] = useState(false);
  const [zenModeEnabled, setZenModeEnabled] = useState(false);
  const [gridModeEnabled, setGridModeEnabled] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [canvasUrl, setCanvasUrl] = useState(null);
  const [exportWithDarkMode, setExportWithDarkMode] = useState(false);
  const [theme, setTheme] = useState("light");

  const initialStatePromiseRef = useRef({ promise: null });
  console.log(initialStatePromiseRef.current.promise);
  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise = resolvablePromise();
  }
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/rocket.jpeg");
      const imageData = await res.blob();
      const reader = new FileReader();
      reader.readAsDataURL(imageData);

      reader.onload = function () {
        const imagesArray = [
          {
            id: "rocket",
            dataURL: reader.result,
            mimeType: "image/jpeg",
            created: 1644915140367,
          },
        ];

        initialStatePromiseRef.current.promise.resolve(InitialData);
        excalidrawRef.current.addFiles(imagesArray);
      };
    };
    fetchData();

    const onHashChange = () => {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const libraryUrl = hash.get("addLibrary");
      if (libraryUrl) {
        excalidrawRef.current.importLibrary(libraryUrl, hash.get("token"));
      }
    };
    window.addEventListener("hashchange", onHashChange, false);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  const updateScene = () => {
    const sceneData = {
      elements: [
        {
          type: "rectangle",
          version: 141,
          versionNonce: 361174001,
          isDeleted: false,
          id: "oDVXy8D6rom3H1-LLH2-f",
          fillStyle: "hachure",
          strokeWidth: 1,
          strokeStyle: "solid",
          roughness: 1,
          opacity: 100,
          angle: 0,
          x: 100.50390625,
          y: 193.67578125,
          strokeColor: "#c92a2a",
          backgroundColor: "transparent",
          width: 186.47265625,
          height: 141.9765625,
          seed: 1968410350,
          groupIds: [],
        },
      ],
      appState: {
        viewBackgroundColor: "#edf2ff",
      },
    };
    excalidrawRef.current.updateScene(sceneData);
  };

  const onLinkOpen = useCallback((element, event) => {
    const link = element.link;
    const { nativeEvent } = event.detail;
    const isNewTab = nativeEvent.ctrlKey || nativeEvent.metaKey;
    const isNewWindow = nativeEvent.shiftKey;
    const isInternalLink =
      link.startsWith("/") || link.includes(window.location.origin);
    if (isInternalLink && !isNewTab && !isNewWindow) {
      // signal that we're handling the redirect ourselves
      event.preventDefault();
      // do a custom redirect, such as passing to react-router
      // ...
    }
  }, []);

  return (
    <div className="App">
      <div className="theme_label">
        <label>
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={() => {
              let newTheme = "light";
              if (theme === "light") {
                newTheme = "dark";
              }
              setTheme(newTheme);
            }}
          />
          Switch to Dark Theme
        </label>
      </div>

      <div className="excalidraw-wrapper">
        <Excalidraw
          ref={excalidrawRef}
          initialData={initialStatePromiseRef.current.promise}
          onCollabButtonClick={false}
          theme={theme}
          name="Requestory"
          UIOptions={{ canvasActions: { loadScene: false } }}
          onLinkOpen={onLinkOpen}
          // onChange={
          //   (elements, state, flies) =>
          //     // console.info("Elements :", elements, "State : ", state)
          //     console.log(excalidrawRef.current.getSceneElements())
          //   // console.info("Elements :", elements)
          // }
          // onPointerUpdate={(payload) => console.info(payload)}
          // viewModeEnabled={viewModeEnabled}
          // zenModeEnabled={zenModeEnabled}
          // gridModeEnabled={gridModeEnabled}
          // renderTopRightUI={renderTopRightUI}
          // renderFooter={renderFooter}
        />
      </div>
    </div>
  );
}
