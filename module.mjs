// @ts-check
import { module } from "@prisma/composer";
import app2NodeService from "./service.mjs";

export default module("app2-node", ({ provision }) => {
  provision(app2NodeService, { id: "app2node" });
});
