import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoiceStatuses, setInvoiceStatuses] = useState({});

  // Fetch products with optimized caching
  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/ResultObject');
      const data = response.data;
      console.log('Fetching new data:', new Date().toLocaleTimeString());
      setProducts(data);
    //   setProducts(prevProducts => {
    //     const updatedProducts = data.map(newProduct => {
    //       const existingProduct = prevProducts.find(
    //         p => p.ThirdPartyInvoiceDetailId === newProduct.ThirdPartyInvoiceDetailId
    //       );
          
    //       if (existingProduct) {
    //         return {
    //           ...newProduct,
    //           ThirdPartyInvoiceDetailProductUnitOfMeasures: 
    //             newProduct.ThirdPartyInvoiceDetailProductUnitOfMeasures.map((uom, idx) => ({
    //               ...uom,
    //               ...existingProduct.ThirdPartyInvoiceDetailProductUnitOfMeasures[idx]
    //             }))
    //         };
    //       }
    //       return newProduct;
    //     });
        
    //     console.log('Updated products:', updatedProducts);
    //     return updatedProducts;
    //   });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, []);

  // Optimized update handler with debouncing
  const handleTextFieldChange = useCallback(async (productId, uomIndex, field, value) => {
    try {
      // First find the product to update
      const productToUpdate = products.find(p => p.ThirdPartyInvoiceDetailId === productId);
      if (!productToUpdate) return;
  
      // Create updated UOM array
      const updatedUOMs = [...productToUpdate.ThirdPartyInvoiceDetailProductUnitOfMeasures];
      updatedUOMs[uomIndex] = {
        ...updatedUOMs[uomIndex],
        [field]: value
      };
  
      // Update local state first
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.ThirdPartyInvoiceDetailId === productId 
            ? {
                ...product,
                ThirdPartyInvoiceDetailProductUnitOfMeasures: updatedUOMs
              }
            : product
        )
      );
  
      // Then update the API
      await axios.patch(`http://localhost:5000/ResultObject/${productId}`, {
        id: productId,
        uomIndex: uomIndex,
        field: field,
        value: value,
        ThirdPartyInvoiceDetailProductUnitOfMeasures: updatedUOMs
      });
  
      console.log('Update successful for product:', productId);
    } catch (error) {
      console.error('Failed to update:', error);
    }
  }, [products]);
  // handle invoice change
  const handleInvoiceChange = (productId, value) => {    
    setInvoiceStatuses(prev => ({
        ...prev,
        [productId]: value
        }));
  }
  // Handle invoice status changes
  const updateInvoiceStatus = useCallback(async (productId, status) => {
    setInvoiceStatuses(prev => ({
      ...prev,
      [productId]: status
    }));

    try {
      await axios.patch(`http://localhost:5000/ResultObject/${productId}/status`, {
        status
      });
    } catch (error) {
      console.error('Failed to update invoice status:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts(); // Initial fetch
    const interval = setInterval(() => {
      console.log('Refreshing data...');
      fetchProducts();
    }, 1000); // 1 second refresh

    return () => clearInterval(interval);
  }, [fetchProducts]);

  return (
    <ApiContext.Provider value={{
      products,
      loading,
      invoiceStatuses,
      handleTextFieldChange,
      handleInvoiceChange,
      setInvoiceStatuses,
      handleFieldUpdate: handleTextFieldChange,
      updateInvoiceStatus,
      refreshData: fetchProducts
    }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);