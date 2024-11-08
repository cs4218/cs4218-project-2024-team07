import express from "express";
import { deleteTestData } from "../controllers/delController.js";

const router = express.Router();

router.get(
    "/mongo-delete",
    deleteTestData
);


export default router;