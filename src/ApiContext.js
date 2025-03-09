import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoiceStatuses, setInvoiceStatuses] = useState({});

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/ResultObject');
      const data = response.data;
      
      setProducts(data);
    
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, []);

  const handleTextFieldChange = useCallback(async (productId, uomIndex, field, value) => {
    try {

      setProducts(prevProducts => 
        prevProducts.map(product => {
          if (product.ThirdPartyInvoiceDetailId === productId) {
            const updatedUOMs = [...product.ThirdPartyInvoiceDetailProductUnitOfMeasures];
            updatedUOMs[uomIndex] = {
              ...updatedUOMs[uomIndex],
              [field]: value
            };
            return {
              ...product,
              ThirdPartyInvoiceDetailProductUnitOfMeasures: updatedUOMs
            };
          }
          return product;
        })
      );

      // Update the API using PUT request
      const productToUpdate = products.find(p => p.ThirdPartyInvoiceDetailId === productId);
      if (!productToUpdate) return;

      const response = await axios.put(`http://localhost:5000/ResultObject/${productId}`, productToUpdate);
    
    } catch (error) {
      console.error('Failed to update:', error);
    }
  }, [products]);
const handleInvoiceChange = (productId, value) => {    
    setInvoiceStatuses(prev => ({
        ...prev,
        [productId]: value
        }));
  }
  
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
    fetchProducts(); 
    const interval = setInterval(() => {
      
      fetchProducts();
    }, 1000); 

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