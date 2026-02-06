const createRes = () => {
  return {
    statusCode: 200,
    payload: null,
    cookies: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.payload = data;
      return this;
    },
    cookie(name, value) {
      this.cookies[name] = value;
    },
    clearCookie(name) {
      delete this.cookies[name];
    },
  };
};

module.exports = {
  createRes,
};
