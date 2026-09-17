// src/router/AppRouter.jsx
import { useRoutes } from "react-router-dom"
import { routes } from "./routes";
import TitleUpdater from "./TitleUpdater";

function AppRouter() {
  const element = useRoutes(routes);

  return (
    <>
      <TitleUpdater />
      {element}
    </>
  );
}

export default AppRouter;