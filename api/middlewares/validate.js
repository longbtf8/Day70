const validate = (schema, source = "body") => {
  return (req, res, next) => {
    try {
      req[source] = schema.parse(req[source]);
      next();
    } catch (error) {
      console.log(req.body);
      return res.status(422).json({
        error: error.flatten().fieldErrors,
      });
    }
  };
};

module.exports = validate;
