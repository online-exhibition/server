import { Router } from "express";

import versions from "../../../utils/versions";

import listThemes from "./list-themes";
import getTheme from "./get-theme";
import createTheme from "./create-theme";
import updateTheme from "./update-theme";
import removeTheme from "./remove-theme";

/**
 * Sets up the routes
 * @param  {object} server The server where routes are registered
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 */
export default async function setup(server, config, logger) {
  const router = new Router();

  router.get(
    "/",
    versions([
      { version: "1.0.0", handler: await listThemes.v1(config, logger) },
    ])
  );

  router.post(
    "/",
    versions([
      { version: "1.0.0", handler: await createTheme.v1(config, logger) },
    ])
  );

  router.get(
    "/:id",
    versions([{ version: "1.0.0", handler: await getTheme.v1(config, logger) }])
  );

  router.put(
    "/:id",
    versions([
      { version: "1.0.0", handler: await updateTheme.v1(config, logger) },
    ])
  );

  router.delete(
    "/:id",
    versions([
      { version: "1.0.0", handler: await removeTheme.v1(config, logger) },
    ])
  );

  return router;
}
