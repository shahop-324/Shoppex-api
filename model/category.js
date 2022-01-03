const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
   name:{
       type: String,
   },
   private:{
       type: Boolean,
       default: false,
   },
   shopId:{
       type: mongoose.Schema.ObjectId,
       ref:"Shop",
   },
   categoryId:{
       type:String,
   },
   categoryImage:{
       type:String,
   }

});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;