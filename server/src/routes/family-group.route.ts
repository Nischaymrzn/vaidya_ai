import { Router } from "express";
import { FamilyGroupController } from "../controller/family-group.controller";
import { middlewares } from "../middlewares/authorization.middleware";

const familyGroupRouter = Router();
const familyGroupController = new FamilyGroupController();

familyGroupRouter.get(
  "/me",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  familyGroupController.getMyGroup,
);

familyGroupRouter.get(
  "/me/summary",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  familyGroupController.getMyGroupSummary,
);

familyGroupRouter.post(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  familyGroupController.createGroup,
);

familyGroupRouter.post(
  "/:groupId/invitations",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  familyGroupController.createInvite,
);

familyGroupRouter.post(
  "/:groupId/members",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  familyGroupController.addMember,
);

familyGroupRouter.patch(
  "/:groupId/members/:memberId",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  familyGroupController.updateMemberRelation,
);

familyGroupRouter.post(
  "/join/:token",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  familyGroupController.joinWithInvite,
);

export default familyGroupRouter;
