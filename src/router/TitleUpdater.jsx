// src/router/TitleUpdater.jsx
import { useEffect } from "react";
import { useLocation, matchRoutes } from "react-router-dom";
import { routes } from "./routes";

function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const appName = import.meta.env.VITE_APP_NAME
    const matches = matchRoutes(routes, location);
    const title = matches?.[matches.length - 1]?.route?.title;
    document.title = title ? `${title} | ${appName}` : "exordium";
  }, [location]);

  return null;
}

export default TitleUpdater;