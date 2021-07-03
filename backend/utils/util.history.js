const History = require("../models/history.model");



const getHistory = (id) => {
  return History.findById(id)
    .then((history) => history)
    .catch(() => null);
};

modules.expport = {
  getTask,
};
