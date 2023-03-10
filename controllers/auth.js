import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";


/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body;

    const salt = await bcrypt.genSalt();
    // Password encrypter
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      friends,
      location,
      occupation,
      // Set initial view count to 0
      visits: 0,
      impressions: Math.floor(Math.random() * 10000),
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Original
/* LOGGING IN */
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     console.log('Request body:', req.body); // Agregado para depuración
//     const user = await User.findOne({ email: email });
//     if (!user) return res.status(400).json({ msg: "User does not exist. " });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
//     delete user.password;
//     res.status(200).json({ token, user });
//   } catch (err) {
//     console.log(err); // Agregado para depuración
//     res.status(500).json({ error: err.message });
//   }
// };

// with Google
/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password, token: googleToken } = req.body;
    console.log("Request body:", req.body); // Agregado para depuración
    const user = await User.findOne({ email: email });
    if (!user) {
      if (!googleToken) {
        return res.status(400).json({ msg: "User does not exist. " });
      }
      // Si el usuario no existe pero se recibió un token de Google, se crea una cuenta nueva
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const { given_name, family_name, email, picture } = ticket.getPayload();
      const password = Math.random().toString(36).substring(7);
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);
      const newUser = new User({
        firstName: given_name,
        lastName: family_name,
        email,
        password: passwordHash,
        picturePath: picture,
        friends: [],
        location: "",
        occupation: "",
        visits: 0,
        impressions: Math.floor(Math.random() * 10000),
      });
      const savedUser = await newUser.save();
      const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);
      delete savedUser.password;
      res.status(200).json({ token, user: savedUser });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;
    res.status(200).json({ token, user });
  } catch (err) {
    console.log(err); // Agregado para depuración
    res.status(500).json({ error: err.message });
  }
};

// CREATE USER IN MONGODB IF USER DOESN'T EXIST

/* LOGGING WITH GOOGLE */


// Increment view count
// export const incrementViewCount = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const user = await User.findById(userId);
//     // Increment view count by 1
//     user.viewedProfile += 1;
//     const updatedUser = await user.save();
//     res.status(200).json(updatedUser);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
