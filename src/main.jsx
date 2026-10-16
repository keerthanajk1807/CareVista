import { registerSW } from "virtual:pwa-register";
import "./accessibility.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.jsx";
import store from "./store/store.js";
import "./index.css";
ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>);
registerSW({
  onOfflineReady() {
    console.info("[PWA] App shell ready offline. Booking still requires internet.");
  }
});
