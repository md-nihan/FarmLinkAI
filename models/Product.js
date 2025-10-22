const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmer_phone: {
    type: String,
    required: true,
    trim: true
  },
  farmer_name: {
    type: String,
    default: ''
  },
  farmer_location: {
    type: String,
    default: ''
  },
  product_name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'ordered', 'delivered', 'cancelled'],
    default: 'available'
  },
  image_url: {
    type: String,
    default: ''
  },
  quality_grade: {
    type: String,
    default: 'pending'
  },
  quality_score: {
    type: Number,
    default: 0
  },
  buyer_phone: {
    type: String,
    default: ''
  },
  buyer_name: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  orderedAt: {
    type: Date
  }
});

// Pre-save hook for debugging
productSchema.pre('save', function(next) {
  console.log('🔧 Product pre-save hook:', {
    product_name: this.product_name,
    farmer_phone: this.farmer_phone,
    quantity: this.quantity,
    image_url: this.image_url
  });
  next();
});

// Index for faster queries
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ farmer_phone: 1 });

module.exports = mongoose.model('Product', productSchema);
