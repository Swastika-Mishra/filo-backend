const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//Needs mongoDB action

exports.handleNewUser = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd)
    return res.status(400).send("Username and password is required");
  const duplicates = await User.findOne({ username: user }).exec();
  if (duplicates) return res.sendStatus(409);
  try {
    const hashpwd = await bcrypt.hash(pwd, 10);
    const result = await User.create({
      username: user,
      password: hashpwd,
    });
    console.log(result);
    res.status(201).send("success: new user created");
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.handleLogin = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd)
    return res.status(400).send("Username and password is required");
  const foundUser = await User.findOne({ username: user }).exec();
  if (!foundUser) return res.sendStatus(401);
  try {
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {
      const accessToken = jwt.sign(
        { username: foundUser.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      const newRefreshToken = jwt.sign(
        { username: foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      //save in database
      foundUser.refreshToken = newRefreshToken;
      const result = await foundUser.save();
      console.log(result);
      //res.cookie('jwt',refreshToken,{httpOnly: true, maxAge: 24*60*60*1000, sameSite: 'None', secure: true});
      res.cookie('jwt', newRefreshToken, {
        httpOnly: true,
        //secure: false,           // true in production (HTTPS only)
        //sameSite: 'Lax',  
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.json({ accessToken });
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    console.log(err);
  }
};

exports.handleRefreshToken = async (req, res) => {
  console.log("Cookies:", req.cookies);
  console.log("=== /refresh hit ===");
  const cookies = req.cookies;
  console.log("cookies recieved: ", cookies);
  if (!cookies?.jwt){
    console.log("❌ No JWT cookie found");
    return res.sendStatus(401);
  }
  const refreshToken = req.cookies.jwt;
  try {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) return res.sendStatus(403);
        //const foundUser = await User.findOne({ refreshToken }).exec();
        const foundUser = await User.findOne({ username: decoded.username }).exec();
        console.log("Found user:", foundUser?.username);
        if (!foundUser || foundUser.refreshToken !== refreshToken)
          return res.sendStatus(403);
        const accessToken = jwt.sign(
          { username: decoded.username },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1h" }
        );
        const newRefreshToken = jwt.sign(
          { username: decoded.username },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "1d" }
        );
        //console.log("New access token issued:", accessToken);
        foundUser.refreshToken = newRefreshToken;
        await foundUser.save();

        res.cookie("jwt", newRefreshToken, {
          httpOnly: true,
          //secure: false,           // true in production (HTTPS only)
          //sameSite: 'Lax',  
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        res.json({ accessToken });
      }
    );
  } catch (err) {
    console.log(err);
  }
};

exports.handleLogout = async (req, res) => {
  //On client, also delete the accessToken
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt;
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true });
    // res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true});
    return res.sendStatus(204);
  }
  try {
    foundUser.refreshToken = "";
    const result = await foundUser.save();
    console.log(result);
    //res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true}); //secure: true in production
    res.clearCookie("jwt", { httpOnly: true }); //secure: true in production
    return res.sendStatus(204);
  } catch (err) {
    console.log(err);
  }
};
