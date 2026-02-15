import { Router } from "express";
import { FileProxyController } from "../controller/file-proxy.controller";

const fileProxyRouter = Router();
const fileProxyController = new FileProxyController();

fileProxyRouter.get("/", fileProxyController.getFile);

export default fileProxyRouter;
