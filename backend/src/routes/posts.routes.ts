import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import{
    createNewPost,
    getPost,
    getPosts,
    removePost,
    editPost
}from "../controllers/posts.controllers"

const router=  Router();

router.post("/",authenticate, createNewPost);
router.put("/:id", authenticate, editPost);
router.delete("/:id", authenticate, removePost);
router.get("/", (req, res, next) => req.headers.authorization ? authenticate(req, res, next) : next(), getPosts);
router.get("/:id", (req, res, next) => req.headers.authorization ? authenticate(req, res, next) : next(), getPost);

export default router;
