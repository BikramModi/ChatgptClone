import Router from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../services/user.js";
import {
  createUserValidator,
  updateUserValidator,
} from "../validators/user.js";
import useValidator from "../middlewares/useValidator.js";

const USER_ROUTER = Router();

USER_ROUTER.post(
  "/",
  useValidator(createUserValidator),
  async (req, res, next) => {
    try {
      const user = await createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
);

USER_ROUTER.get("/", async (req, res, next) => {
  try {
    const users = await getAllUsers(req.query);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

USER_ROUTER.get("/:id", async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

USER_ROUTER.patch(
  "/:id",
  useValidator(updateUserValidator),
  async (req, res, next) => {
    try {
      const user = await updateUser(req.params.id, req.body);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
);

USER_ROUTER.delete("/:id", async (req, res, next) => {
  try {
    const result = await deleteUser(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default USER_ROUTER;
