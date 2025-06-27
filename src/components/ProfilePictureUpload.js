import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  IconButton,
  Slider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateLeft as RotateLeftIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';

export default function ProfilePictureUpload({ open, onClose, currentPhotoURL, onPhotoUpdated }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState('');
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      setSelectedFile(file);
      setError('');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewURL(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScaleChange = (event, newValue) => {
    setScale(newValue);
  };

  const handleRotationChange = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const processImage = () => {
    if (!selectedFile || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        // Set canvas size
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        
        // Clear canvas
        ctx.clearRect(0, 0, size, size);
        
        // Apply transformations
        ctx.save();
        ctx.translate(size / 2, size / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);
        
        // Draw image centered
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
        
        ctx.restore();
        
        // Convert to blob
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      };
      img.src = previewURL;
    });
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setError('');
    
    try {
      const storage = getStorage();
      
      // Delete old photo if exists
      if (currentPhotoURL && currentPhotoURL.includes('firebase')) {
        try {
          const oldPhotoRef = ref(storage, currentPhotoURL);
          await deleteObject(oldPhotoRef);
        } catch (err) {
          console.log('Old photo not found or already deleted');
        }
      }
      
      // Process and upload new photo
      const processedBlob = await processImage();
      if (!processedBlob) throw new Error('Failed to process image');
      
      const photoRef = ref(storage, `profile-photos/${auth.currentUser.uid}/${Date.now()}.jpg`);
      await uploadBytes(photoRef, processedBlob);
      const downloadURL = await getDownloadURL(photoRef);
      
      // Update user profile
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL
      });
      
      onPhotoUpdated(downloadURL);
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewURL('');
    setScale(1);
    setRotation(0);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Update Profile Picture</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          
          {!selectedFile ? (
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'primary.main',
                borderRadius: 2,
                p: 4,
                cursor: 'pointer',
                '&:hover': { borderColor: 'primary.dark' }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <PhotoCameraIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" color="primary.main" sx={{ mb: 1 }}>
                Click to upload photo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                JPG, PNG up to 5MB
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar
                  src={previewURL}
                  sx={{
                    width: 200,
                    height: 200,
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                    transition: 'transform 0.3s ease'
                  }}
                />
              </Box>
              
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Adjust Size
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ZoomOutIcon />
                  <Slider
                    value={scale}
                    onChange={handleScaleChange}
                    min={0.5}
                    max={2}
                    step={0.1}
                    sx={{ flexGrow: 1 }}
                  />
                  <ZoomInIcon />
                </Box>
                
                <Button
                  variant="outlined"
                  startIcon={<RotateLeftIcon />}
                  onClick={handleRotationChange}
                  sx={{ mt: 1 }}
                >
                  Rotate
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={loading || !selectedFile}
        >
          {loading ? 'Uploading...' : 'Save Photo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 