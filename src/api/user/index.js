import { Router } from "express";
import passport from "passport";

import { getModificationDate } from "../../utils/filesystem";

import addUser from "./add-user";
import getUser from "./get-user";
import getLogin from "./login-user";
import confirmUser from "./confirm-user";
import versions from "../../utils/versions";

/**
 * Sets up the routes for the user management
 * @param  {object} server The server where routes are registered
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 */
export default async function setup(server, config, logger) {
  const modificationDate = getModificationDate(__filename).toUTCString();
  const router = new Router();

  router.get("/", (req, res) => {
    res.append("Cache-Control", "public, must-revalidate");
    res.append("Last-Modified", modificationDate);
    res.json({
      ".": [
        {
          url: req.urlPrefix + req.originalUrl,
          method: "Get",
          description: "Get this information.",
          versions: ["1.0.0"],
          private: false,
        },
        {
          url: req.urlPrefix + req.originalUrl,
          method: "POST",
          description: "Register new user.",
          versions: ["1.0.0"],
          private: false,
        },
      ],
      me: [
        {
          url: req.urlPrefix + req.originalUrl + "/me",
          method: "GET",
          description: "Get information about your user.",
          versions: ["1.0.0"],
          private: true,
        },
      ],
      login: [
        {
          url: req.urlPrefix + req.originalUrl + "/login",
          method: "GET",
          description: "Login user.",
          versions: ["1.0.0"],
          authorized: false,
        },
      ],
      confirm: [
        {
          url: req.urlPrefix + req.originalUrl + "/confirm/:userId",
          method: "GET",
          description: "Confirm user registration.",
          versions: ["1.0.0"],
          authorized: false,
        },
      ],
    });
  });

  router.post(
    "/",
    versions([{ version: "1.0.0", handler: await addUser.v1(config, logger) }])
  );

  router.get(
    "/confirm/:userId",
    versions([
      { version: "1.0.0", handler: await confirmUser.v1(config, logger) },
    ])
  );

  router.get(
    "/me",
    passport.authenticate("basic", { session: false }),
    versions([{ version: "1.0.0", handler: await getUser.v1(config, logger) }])
  );

  router.get(
    "/login",
    versions([{ version: "1.0.0", handler: await getLogin.v1(config, logger) }])
  );

  return router;
}
