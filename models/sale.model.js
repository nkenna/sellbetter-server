module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        content: { type: String, default: "" },
        amount: { type: Number, default: 0 },
        balance: { type: Number, default: 0 },
        sellerId: { type: String, default: "" },
        creditSale: { type: Boolean, default: false },
        ref: {type: String, default: ""},
        seller: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
      },
      {timestamps: true}
    );   
    
    
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });

    schema.index({ content: 'text'});
  
    const Sale = mongoose.model("sale", schema);
    return Sale;
  };