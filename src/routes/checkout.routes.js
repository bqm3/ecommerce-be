const router = require("express").Router();
const checkout = require("../controllers/checkout.controller");
const auth = require("../middleware/auth.middleware");

// router.use(auth);

router.get("/", checkout.getCheckout);
router.post("/", checkout.checkout);
router.get('/orders', checkout.getOrders);
router.get('/orders/:id', checkout.getOrderById);

module.exports = router;
