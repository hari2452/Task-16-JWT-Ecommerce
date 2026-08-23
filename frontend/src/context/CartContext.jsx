import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";


const CartContext =
  createContext(null);


const CART_STORAGE_KEY =
  "shopzone-cart";


function loadSavedCart() {
  try {
    const savedCart =
      localStorage.getItem(
        CART_STORAGE_KEY
      );


    if (!savedCart) {
      return [];
    }


    const parsedCart =
      JSON.parse(savedCart);


    if (!Array.isArray(parsedCart)) {
      return [];
    }


    return parsedCart.filter(
      (item) =>
        item &&
        item.id !== undefined &&
        Number(item.qty) > 0
    );

  } catch (error) {
    console.log(
      "Unable to load saved cart:",
      error
    );


    localStorage.removeItem(
      CART_STORAGE_KEY
    );


    return [];
  }
}


export function CartProvider({
  children,
}) {
  const [cartItems, setCartItems] =
    useState(loadSavedCart);


  // =====================================
  // SAVE CART WHENEVER IT CHANGES
  // =====================================

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );

    } catch (error) {
      console.log(
        "Unable to save cart:",
        error
      );
    }
  }, [cartItems]);


  // =====================================
  // ADD PRODUCT TO CART
  // =====================================

  const addToCart = (
    product,
    quantity = 1
  ) => {
    const requestedQuantity =
      Number(quantity);


    if (
      !Number.isInteger(
        requestedQuantity
      ) ||
      requestedQuantity <= 0
    ) {
      return;
    }


    const availableStock =
      Number(product.stock);


    if (
      !Number.isFinite(
        availableStock
      ) ||
      availableStock <= 0
    ) {
      return;
    }


    setCartItems(
      (currentItems) => {

        const existingItem =
          currentItems.find(
            (item) =>
              item.id === product.id
          );


        if (existingItem) {
          const newQuantity =
            Math.min(
              Number(
                existingItem.qty
              ) +
              requestedQuantity,
              availableStock
            );


          return currentItems.map(
            (item) =>
              item.id === product.id
                ? {
                    ...item,
                    ...product,
                    qty: newQuantity,
                  }
                : item
          );
        }


        return [
          ...currentItems,
          {
            ...product,

            qty: Math.min(
              requestedQuantity,
              availableStock
            ),
          },
        ];
      }
    );
  };


  // =====================================
  // REMOVE PRODUCT FROM CART
  // =====================================

  const removeFromCart = (id) => {
    setCartItems(
      (currentItems) =>
        currentItems.filter(
          (item) =>
            item.id !== id
        )
    );
  };


  // =====================================
  // UPDATE PRODUCT QUANTITY
  // =====================================

  const updateQuantity = (
    id,
    quantity
  ) => {
    const newQuantity =
      Number(quantity);


    if (
      !Number.isInteger(
        newQuantity
      )
    ) {
      return;
    }


    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }


    setCartItems(
      (currentItems) =>
        currentItems.map(
          (item) => {

            if (item.id !== id) {
              return item;
            }


            const availableStock =
              Number(item.stock);


            return {
              ...item,

              qty: Math.min(
                newQuantity,
                availableStock
              ),
            };
          }
        )
    );
  };


  // =====================================
  // CLEAR COMPLETE CART
  // =====================================

  const clearCart = () => {
    setCartItems([]);
  };


  // =====================================
  // CALCULATE CART COUNT
  // =====================================

  const cartCount =
    cartItems.reduce(
      (total, item) =>
        total +
        Number(item.qty),
      0
    );


  // =====================================
  // CALCULATE CART TOTAL
  // =====================================

  const cartTotal =
    cartItems.reduce(
      (total, item) =>
        total +
        Number(item.price) *
        Number(item.qty),
      0
    );


  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}


export function useCart() {
  const context =
    useContext(CartContext);


  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }


  return context;
}