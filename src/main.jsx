import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import {
  CourseProvider
} from "./context/CourseContext";

import "./index.css";
import "./App.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <CourseProvider>
      <App />
    </CourseProvider>
  </React.StrictMode>
);