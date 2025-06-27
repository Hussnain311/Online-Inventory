import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { auth } from '../firebase';

export default function InventoryTable({ onEditItem, onViewItem, refreshTrigger }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [anchorEl, setAnchorEl] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setLoading(true);
    setError('');

    try {
      const q = query(
        collection(db, 'inventory'),
        where('userId', '==', userId),
        orderBy(sortBy, sortOrder)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const itemsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setItems(itemsData);
        setLoading(false);
        setError(''); // Clear any previous errors
      }, (error) => {
        console.error('Error fetching items:', error);
        // Only show error if it's not a permission error (which might be expected)
        if (error.code !== 'permission-denied') {
          setError('Failed to load inventory items');
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up query:', error);
      setError('Failed to load inventory items');
      setLoading(false);
    }
  }, [sortBy, sortOrder, refreshTrigger]);

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, 'inventory', itemId));
      } catch (error) {
        console.error('Error deleting item:', error);
        setError('Failed to delete item');
      }
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setAnchorEl(null);
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'error' };
    if (quantity <= 10) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Sort Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250, flexGrow: 1 }}
        />
        
        <Button
          variant="outlined"
          startIcon={<SortIcon />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          Sort by {sortBy}
        </Button>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => handleSort('name')}>Name</MenuItem>
          <MenuItem onClick={() => handleSort('buyerPrice')}>Buyer Price</MenuItem>
          <MenuItem onClick={() => handleSort('sellerPrice')}>Seller Price</MenuItem>
          <MenuItem onClick={() => handleSort('quantity')}>Quantity</MenuItem>
          <MenuItem onClick={() => handleSort('createdAt')}>Date Added</MenuItem>
        </Menu>
      </Box>

      {/* Inventory Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell sx={{ fontWeight: 600 }}>Item Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Buyer Price</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Seller Price</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Stock Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Profit Margin</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    {searchTerm ? 'No items found matching your search' : 'No inventory items yet'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const stockStatus = getStockStatus(item.quantity);
                const profitMargin = ((item.sellerPrice - item.buyerPrice) / item.buyerPrice * 100).toFixed(1);
                
                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatPrice(item.buyerPrice)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatPrice(item.sellerPrice)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={stockStatus.label}
                        color={stockStatus.color}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: profitMargin > 0 ? 'success.main' : 'error.main',
                          fontWeight: 500
                        }}
                      >
                        {profitMargin}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => onViewItem(item)}
                            color="primary"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Item">
                          <IconButton
                            size="small"
                            onClick={() => onEditItem(item)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Item">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(item.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 