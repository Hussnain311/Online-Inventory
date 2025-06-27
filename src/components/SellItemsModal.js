import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Print as PrintIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function SellItemsModal({ open, onClose, items, onSaleComplete }) {
  const [saleItems, setSaleItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (open) {
      setSaleItems([]);
      setError('');
      setLoading(false);
    }
  }, [open]);

  const handleAddItem = () => {
    setSaleItems([...saleItems, { itemId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (idx) => {
    setSaleItems(saleItems.filter((_, i) => i !== idx));
  };

  const handleChange = (idx, field, value) => {
    setSaleItems(saleItems.map((row, i) =>
      i === idx ? { ...row, [field]: value } : row
    ));
  };

  const getItem = (itemId) => items.find(i => i.id === itemId);

  const receiptRows = saleItems.map(row => {
    const item = getItem(row.itemId);
    const quantity = parseInt(row.quantity) || 0;
    const price = item ? item.sellerPrice : 0;
    return {
      name: item ? item.name : '',
      price,
      quantity,
      total: price * quantity
    };
  });
  const grandTotal = receiptRows.reduce((sum, r) => sum + r.total, 0);

  const validateSale = () => {
    if (saleItems.length === 0) return 'Add at least one item.';
    for (const row of saleItems) {
      if (!row.itemId) return 'Select an item for each row.';
      if (!row.quantity || parseInt(row.quantity) <= 0) return 'Quantity must be at least 1.';
      const item = getItem(row.itemId);
      if (!item) return 'Invalid item selected.';
      if (parseInt(row.quantity) > item.quantity) return `Not enough stock for ${item.name}.`;
    }
    return '';
  };

  const handleSellAndExport = async () => {
    setError('');
    const validation = validateSale();
    if (validation) {
      setError(validation);
      return;
    }
    setLoading(true);
    try {
      console.log('Starting sale process...', saleItems);
      
      // Update inventory in Firestore
      for (const row of saleItems) {
        const item = getItem(row.itemId);
        console.log('Updating item:', item.name, 'from', item.quantity, 'to', item.quantity - parseInt(row.quantity));
        
        const newQty = item.quantity - parseInt(row.quantity);
        const itemRef = doc(db, 'inventory', item.id);
        await updateDoc(itemRef, { quantity: newQty });
        console.log('Successfully updated item:', item.name);
      }
      
      console.log('All inventory updates completed, generating PDF...');
      
      try {
        const docPDF = new jsPDF();
        docPDF.text('Sales Receipt', 14, 18);
        autoTable(docPDF, {
          startY: 28,
          head: [['Name', 'Unit Price', 'Quantity', 'Total']],
          body: receiptRows.map(r => [r.name, `$${r.price}`, r.quantity, `$${r.total}`]),
        });
        docPDF.text(`Grand Total: $${grandTotal}`, 14, docPDF.lastAutoTable.finalY + 12);
        docPDF.save('receipt.pdf');
        console.log('PDF generated successfully');
      } catch (pdfErr) {
        console.error('PDF export error:', pdfErr);
        setError('Failed to generate PDF. Please check your browser and try again.');
        setLoading(false);
        return;
      }
      
      console.log('Sale completed successfully');
      onSaleComplete();
      onClose();
    } catch (err) {
      console.error('Sale process error:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      setError(`Failed to complete sale: ${err.message}. Please check your connection and try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Sell Items & Generate Receipt</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddItem} disabled={loading}>
            Add Item
          </Button>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Unit Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Remove</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {saleItems.map((row, idx) => {
                const item = getItem(row.itemId);
                return (
                  <TableRow key={idx}>
                    <TableCell sx={{ minWidth: 250 }}>
                      <Autocomplete
                        options={items}
                        getOptionLabel={option => option.name || ''}
                        value={item || null}
                        onChange={(_, newValue) => handleChange(idx, 'itemId', newValue ? newValue.id : '')}
                        renderInput={params => (
                          <TextField {...params} label="Select Item" variant="outlined" fullWidth disabled={loading} />
                        )}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        disabled={loading}
                      />
                    </TableCell>
                    <TableCell>
                      {item ? `$${item.sellerPrice}` : '-'}
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={row.quantity}
                        onChange={e => handleChange(idx, 'quantity', e.target.value)}
                        inputProps={{ min: 1, max: item ? item.quantity : undefined }}
                        fullWidth
                        disabled={loading || !item}
                      />
                      {item && <Typography variant="caption" color="text.secondary">Stock: {item.quantity}</Typography>}
                    </TableCell>
                    <TableCell>
                      {item ? `$${item.sellerPrice * (parseInt(row.quantity) || 0)}` : '-'}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleRemoveItem(idx)} disabled={loading}>
                        <RemoveIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">Grand Total: ${grandTotal}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <PrintIcon />}
          onClick={handleSellAndExport}
          disabled={loading || saleItems.length === 0}
        >
          {loading ? 'Processing...' : 'Sell & Export PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 