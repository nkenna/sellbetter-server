module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        name: { type: String, default: "" },
        phone: { type: String, default: "" },
        email: { type: String, default: "" },
        password: { type: String, default: "" },
        ref: {type: String, default: ""},
        avatar: { type: String, default: "https://backend.dakowa.com/media-header/african.png" },
        status: { type: Boolean, default: true },
        verified: { type: Boolean, default: false },
        emailNotif: { type: Boolean, default: true }, // true: user recieves email notification
      //  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'post'}],
      //  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'comment'}],
      },
      {timestamps: true}
    );   
    
    
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });

    schema.index({ email: 'text', name: 'text'});
  
    const User = mongoose.model("user", schema);
    return User;
  };