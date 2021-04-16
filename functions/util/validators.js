const isEmpty = (string) => {
  string = string + "";
  if (string.trim() === "") return true;
  else return false;
};
const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) {
    return true;
  } else {
    return false;
  }
};
const isPassword = (password) => {
  const regEx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{6,13}$/;
  if (password.match(regEx)) {
    return true;
  } else {
    return false;
  }
};

exports.validateSignupData = (data) => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = "must not be empty";
  } else if (!isEmail(data.email)) {
    errors.email = "must be a valid email";
  }

  if (isEmpty(data.password)) {
    errors.password = "must not be empty";
  } else if (!isPassword(data.password)) {
    errors.password =
      "Password expresion that requires at least one lower case letter, one upper case letter, one digit, 6-13 length, and no spaces";
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "password must match.";
  }

  if (isEmpty(data.name)) {
    errors.name = "must not be empty";
  }

  if (isEmpty(data.website)) {
    errors.website = "must not be empty";
  }
  if (isEmpty(data.locationStreetAddress)) {
    errors.locationStreetAddress = "must not be empty";
  }
  if (isEmpty(data.locationCity)) {
    errors.locationCity = "must not be empty";
  }
  if (isEmpty(data.locationstate)) {
    errors.locationstate = "must not be empty";
  }
  if (isEmpty(data.locationCountry)) {
    errors.locationCountry = "must not be empty";
  }
  if (isEmpty(data.zipcode)) {
    errors.zipcode = "must not be empty";
  }
  if (isEmpty(data.locationCountry)) {
    errors.locationCountry = "must not be empty";
  }
  return {
    errors,
    valid: Object.keys(errors).length == 0 ? true : false,
  };
};

exports.validateLoginData = (data) => {
  let errors = {};
  if (isEmpty(data.email)) {
    errors.email = "must not be empty";
  }
  if (isEmpty(data.password)) errors.password = "must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length == 0 ? true : false,
  };
};

exports.validateUpdatePasswordData = (data) => {
  let errors = {};

  if (isEmpty(data.password)) {
    errors.password = "must not be empty";
  } else if (!isPassword(data.password)) {
    errors.password =
      "Password expresion that requires at least one lower case letter, one upper case letter, one digit, 6-13 length, and no spaces";
  }
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "password must match.";
  }

  return {
    errors,
    valid: Object.keys(errors).length == 0 ? true : false,
  };
};
