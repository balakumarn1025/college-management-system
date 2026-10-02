import { serialize } from "../utils/serialize.js";

router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ detail: "Not found" });
    res.json(serialize(user)); // password_hash stripped, dates as strings
  } catch (e) { next(e); }
});