const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

/**
 * GET USER CART
 */
exports.getCart = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId, tenantId }).populate(
      "items.product",
      "name image category sale_price mrp dimension"
    );

    if (!cart) {
      cart = await Cart.create({
        tenantId,
        user: userId,
        items: [],
        totalAmount: 0,
      });
    }

    res.json(cart);
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

/**
 * ADD TO CART
 */
exports.addToCart = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const userId = req.user._id;
    const { productId, selectedSize, qty = 1 } = req.body;

    if (!productId || !selectedSize) {
      return res.status(400).json({
        message: "Product ID and selected size are required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId, tenantId });

    if (!cart) {
      cart = new Cart({
        tenantId,
        user: userId,
        items: [],
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.selectedSize?.dimension === selectedSize.dimension
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].qty += qty;
    } else {
      cart.items.push({
        product: productId,
        productDetails: {
          title: product.name,
          image: product.image,
          category: product.category_name,
        },
        selectedSize: {
          dimension: selectedSize.dimension,
          originalPrice: selectedSize.originalPrice,
          salePrice: selectedSize.salePrice,
        },
        qty,
        price: selectedSize.salePrice,
      });
    }

    cart.calculateTotal();
    await cart.save();

    await cart.populate(
      "items.product",
      "name image category sale_price mrp dimension"
    );

    res.status(200).json({
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    res.status(500).json({ message: "Failed to add item" });
  }
};

/**
 * INCREASE QTY
 */
exports.increaseQty = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const userId = req.user._id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId, tenantId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.qty += 1;
    cart.calculateTotal();
    await cart.save();

    res.json({ message: "Quantity increased", cart });
  } catch (error) {
    console.error("❌ Error increasing qty:", error);
    res.status(500).json({ message: "Failed to increase quantity" });
  }
};

/**
 * DECREASE QTY
 */
exports.decreaseQty = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const userId = req.user._id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId, tenantId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.qty > 1) {
      item.qty -= 1;
    } else {
      return res.status(400).json({
        message: "Minimum quantity is 1",
      });
    }

    cart.calculateTotal();
    await cart.save();

    res.json({ message: "Quantity decreased", cart });
  } catch (error) {
    console.error("❌ Error decreasing qty:", error);
    res.status(500).json({ message: "Failed to decrease quantity" });
  }
};

/**
 * REMOVE ITEM
 */
exports.removeFromCart = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const userId = req.user._id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId, tenantId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.deleteOne();
    cart.calculateTotal();
    await cart.save();

    res.json({ message: "Item removed", cart });
  } catch (error) {
    console.error("❌ Error removing item:", error);
    res.status(500).json({ message: "Failed to remove item" });
  }
};

/**
 * CLEAR CART
 */
exports.clearCart = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId, tenantId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.json({ message: "Cart cleared", cart });
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};