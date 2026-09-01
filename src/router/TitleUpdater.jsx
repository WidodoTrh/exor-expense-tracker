// src/router/TitleUpdater.jsx
import { useEffect } from "react";
import { useLocation, matchRoutes } from "react-router-dom";
import { routes } from "./routes";

function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const matches = matchRoutes(routes, location);
    const title = matches?.[matches.length - 1]?.route?.title;
    document.title = title ? `${title} | E Library` : "E Library";
  }, [location]);

  return null;
}

export default TitleUpdater;