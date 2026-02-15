import { Schema, model } from "mongoose";
import { hash } from "bcrypt";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email) => {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Invalid email address",
      },
    },
    password: {
      type: String,
      required: true,
    }, 
     role: { type: String, default: "user" }, // user / admin
     phone: String

  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await hash(this.password, 10);
  }
});

// Ensure password is hashed on update operations as well
UserSchema.pre("findOneAndUpdate", async function () {
  if (this.getUpdate().password) {
    this.getUpdate().password = await hash(this.getUpdate().password, 10);
  }
});

const User = model("User", UserSchema);

export default User;
