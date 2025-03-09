import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Select, MenuItem, Paper, Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useApi } from './ApiContext';
const ProductDataGrid = () => {
    const { products,setProducts,handleTextFieldChange, loading, invoiceStatuses, setInvoiceStatuses } = useApi();
  const handleInvoiceChange = (productId, value) => {
    setInvoiceStatuses(prev => ({ ...prev, [productId]: value }));
  };

  if (loading) return <Typography>Loading...</Typography>;
// In the handleTextFieldChange call:

const handleFieldUpdate = (params, field) => {
    const { row } = params;
    handleTextFieldChange(
      row.productId,
      row.uomIndex,
      field,
      params.value
    );
  };
  const columns = [
    {
      field: 'product',
      headerName: 'PRODUCT',
      flex: 1.5,
      headerAlign: 'left',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 'bold' }}>{params.value}</Typography>
      )
    },
    {
      field: 'productnumber',
      headerName: 'ID',
      flex: 1,
      headerAlign: 'center',
    },
    {
      field: 'uomType',
      headerName: 'UOM',
      flex: 1,
      headerAlign: 'center',
    },
    ...['ordered', 'shipped', 'weight', 'price'].map(field => ({
      field,
      headerName: field.toUpperCase(),
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <TextField
          variant="outlined"
          size="small"
          defaultValue={params.value}
          onChange={(e) => {
            const newValue = e.target.value;
            const fieldMapping = {
              ordered: 'QuantityOrdered',
              shipped: 'QuantityShipped',
              weight: 'Weight',
              price: 'PricePerCase'
            };
            handleTextFieldChange(
              params.row.productId,
              params.row.uomIndex,
              fieldMapping[field],
              newValue
            );
          }}
         onBlur={() => {}}
          sx={{ width: '90%',mt:1 }}
        />
      )
    })),
    {
      field: 'extPrice',
      headerName: 'EXT PRICE',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Grid container direction="column" sx={{ width: '90%',mb:1 }}>
          <TextField
            variant="outlined"
            size="small"
            defaultValue={params.value}
            onChange={(e) => handleTextFieldChange(
                params.row.productId,
                params.row.uomIndex,
                'ExtendedPrice',
                e.target.value
              )}
            onBlur={() => {}}
            sx={{ mb: 1,mt:1 }}
          />
          <Select
            value={invoiceStatuses[params.row.productId] || 'Pending'}
            size="small"
            sx={{ width: '100%' }}
            onChange={(e) => handleInvoiceChange(params.row.productId, e.target.value)}
          >
            {['Invoice', 'Pending', 'Processing', 'Shipped', 'Delivered'].map(status => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </Grid>
      )
    },
  ];

  const rows = products.flatMap((product, productIndex) => 
    product.ThirdPartyInvoiceDetailProductUnitOfMeasures.map((uom, uomIndex) => {
      const isFirstRow = uomIndex === 0;
      return {
        id: `${productIndex}-${uomIndex}`,
        productId: product.ThirdPartyInvoiceDetailId,
        productnumber: uom.ProductNumber,
        uomType: uom.ThirdPartyUnitOfMeasureTypeAbbreviation,
        uomIndex,
        product: isFirstRow ? product.ProductDescription : '',
        ordered: uom.QuantityOrdered || '',
        shipped: uom.QuantityShipped || '',
        weight: uom.Weight || '',
        price: uom.PricePerCase || '',
        extPrice: uom.ExtendedPrice,
      };
    })
  );

  return (
    <Paper sx={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        rowHeight={100}
        disableColumnMenu
        disableColumnFilter
        disableColumnSelector
        disableRowSelectionOnClick
        hideFooter
        sx={{
          '& .MuiDataGrid-columnHeaders': { backgroundColor: 'red !important', fontWeight: 'bold',color: 'black' },
          '& .MuiDataGrid-cell': { borderBottom: 'none' },
          '& .MuiDataGrid-virtualScroller': { overflowX: 'hidden' }
        }}
      />
    </Paper>
  );
};

export default ProductDataGrid;
