import React from 'react';
import { Container, Box,  } from '@mui/material';
import { ApiProvider } from './ApiContext';
import ProductDataGrid from './ProductDataGrid';


function App() {
  return (
   
      
      <ApiProvider>
        <Container maxWidth="xl">
          <Box sx={{ my: 4 }}>
            <ProductDataGrid />
          </Box>
        </Container>
      </ApiProvider>
    
  );
}

export default App;