import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [formState, setFormState] = useState({ name: "", price: "" });
  const [searchId, setSearchId] = useState("");
  const [searchMessage, setSearchMessage] = useState("");

  useEffect(() => {
    const productSubscription = supabase
      .channel("public:products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          console.log("Change received!", payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productSubscription);
    };
  }, []);

  const handleAddProduct = async () => {
    const { data } = await supabase
      .from("products")
      .insert([{ name: formState.name, price: formState.price }]);
    if (data) {
      setProducts((prevProducts) => [...prevProducts, ...data]);
    }
    setFormState({ name: "", price: "" });
  };

  const handleSearchProduct = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", searchId)
      .single();
    if (data) {
      setProducts((prevProducts) => [...prevProducts, data]);
      setSearchMessage("");
    } else {
      setSearchMessage("This product with the specified ID does not exist.");
    }
    setSearchId("");
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Product List</h1>

      <div className="mb-4">
        <input
          className="w-full p-2 mb-2 border rounded"
          type="text"
          placeholder="Enter Product ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleSearchProduct}
        >
          Search Product
        </button>
        {searchMessage && <p className="text-red-500 mt-2">{searchMessage}</p>}
      </div>

      <div className="overflow-auto max-h-96 mb-4">
        {products.length > 0 ? (
          <table className="table-auto w-full">
            <thead className="sticky top-0 bg-gray-200">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-100">
                  <td className="border px-4 py-2">{product.name}</td>
                  <td className="border px-4 py-2">{product.price}</td>
                  <td className="border px-4 py-2">
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500">No products added yet.</p>
        )}
      </div>

      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddProduct();
          }}
        >
          <input
            className="w-full p-2 mb-4 border rounded"
            type="text"
            placeholder="Product Name"
            value={formState.name}
            onChange={(e) =>
              setFormState({ ...formState, name: e.target.value })
            }
          />
          <input
            className="w-full p-2 mb-4 border rounded"
            type="number"
            placeholder="Product Price"
            value={formState.price}
            onChange={(e) =>
              setFormState({ ...formState, price: e.target.value })
            }
          />
          <button
            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            type="submit"
          >
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductList;
