import React from "react";
import {
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  Paper,
  Grid,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useApi } from "./ApiContext";

const ProductDataGrid = () => {
  const {
    products,
    handleTextFieldChange,
    loading,
    invoiceStatuses,
    setInvoiceStatuses,
  } = useApi();

  if (loading) return <Typography>Loading...</Typography>;

  const handleInvoiceChange = (productId, value) => {
    setInvoiceStatuses((prev) => ({ ...prev, [productId]: value }));
  };

  const columns = [
    {
      field: "product",
      headerName: "PRODUCT",
      flex: 1.5,
      headerAlign: "center",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <Typography sx={{ fontWeight: "bold" }}>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "productnumber",
      headerName: "ID",
      flex: 1,
      headerAlign: "center",
    },
    { field: "uomType", headerName: "UOM", flex: 1, headerAlign: "center" },
    ...["ordered", "shipped", "weight", "price"].map((field) => ({
      field,
      headerName: field.toUpperCase(),
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => {
        return `${value} yo`;
      },
      rowSpanValueGetter: (value, row) => {
        return row ? `${row.productnumber}` : value;
      },
      renderCell: (params) => (
        <TextField
          variant="outlined"
          size="small"
          defaultValue={params.value}
          onChange={(e) => {
            const newValue = e.target.value;
            const fieldMapping = {
              ordered: "QuantityOrdered",
              shipped: "QuantityShipped",
              weight: "Weight",
              price: "PricePerCase",
            };
            handleTextFieldChange(
              params.row.productId,
              params.row.uomIndex,
              fieldMapping[field],
              newValue
            );
          }}
          onBlur={() => {}}
          sx={{ width: "90%", mt: 1 }}
        />
      ),
    })),
    {
      field: "extPrice",
      headerName: "EXT PRICE",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => {
        return `${value} yo`;
      },
      rowSpanValueGetter: (value, row) => {
        return row ? `${row.productnumber}` : value;
      },
      renderCell: (params) => (
        <Grid container direction="column" sx={{ width: "90%", mb: 1 }}>
          <TextField
            variant="outlined"
            size="small"
            defaultValue={params.value}
            onChange={(e) =>
              handleTextFieldChange(
                params.row.productId,
                params.row.uomIndex,
                "ExtendedPrice",
                e.target.value
              )
            }
            onBlur={() => {}}
            sx={{ mb: 1, mt: 1 }}
          />
          <Select
            value={invoiceStatuses[params.row.productId] || "Pending"}
            size="small"
            sx={{ width: "100%" }}
            onChange={(e) =>
              handleInvoiceChange(params.row.productId, e.target.value)
            }
          >
            {["Invoice", "Pending", "Processing", "Shipped", "Delivered"].map(
              (status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              )
            )}
          </Select>
        </Grid>
      ),
    },
  ];

  const rows = products.flatMap((product, productIndex) =>
    product.ThirdPartyInvoiceDetailProductUnitOfMeasures.map(
      (uom, uomIndex) => {
        const isFirstRow = uomIndex === 0;
        const uoms = product.ThirdPartyInvoiceDetailProductUnitOfMeasures;

        return {
          id: `${productIndex}-${uomIndex}`,
          productId: product.ThirdPartyInvoiceDetailId,
          productnumber: uom.ProductNumber,
          uomType: uom.ThirdPartyUnitOfMeasureTypeAbbreviation,
          uomIndex,
          product: product.ProductDescription,
          ordered: uom.QuantityOrdered || "",
          shipped: uom.QuantityShipped || "",
          weight: uom.Weight || "",
          price: uom.PricePerCase || "",
          extPrice: uom.ExtendedPrice,
          rowSpan: uomIndex === 0 ? uoms.length : 0, // Span only the first row of a product
        };
      }
    )
  );

  return (
    <Paper sx={{ width: "100%" }}>
      <Box
        sx={{
          width: "100%",
          "& .super-app-theme--header": {
            backgroundColor: "rgba(255, 7, 0, 0.55) !important",
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          rowHeight={110}
          disableColumnMenu
          disableColumnFilter
          disableColumnSelector
          disableRowSelectionOnClick
          unstable_rowSpanning
          hideFooter
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "grey",
              color: "black",
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default ProductDataGrid;
