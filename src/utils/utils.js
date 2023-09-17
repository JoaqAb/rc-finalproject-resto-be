import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const hashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

export const generateToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
  return token;
};

export const checkRequired = (requiredFields) => {
  return (req, res, next) => {
    for (const required of requiredFields) {
      if (
        !req.body.hasOwnProperty(required) ||
        req.body[required].trim() === ""
      ) {
        return res
          .status(400)
          .send({
            status: "ERR",
            data: `Faltan campos obligatorios (${requiredFields.join(",")})`,
          });
      }
    }

    next();
  };
};

export const isValidPassword = (userInDb, pass) => {
  return bcrypt.compareSync(pass, userInDb.password);
}

export const filterData = (data, unwantedFields) => {
  const { ...filteredData } = data
  unwantedFields.forEach(field => delete filteredData[field] )
  return filteredData
}

export const filterAllowed = (allowedFields) => {
  return (req, res, next) => {
      req.filteredBody = {};
      
      for (const key in req.body) {
          if (allowedFields.includes(key)) req.filteredBody[key] = req.body[key]
      }
      
      next()
  }
}
