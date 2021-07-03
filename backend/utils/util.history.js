const History = require("../models/history.model");

const _getHistory = (id) => {
  return History.findById(id)
    .then((history) => history)
    .catch(() => null);
};

const _getAllHistory = () => {
  return History.find()
    .then((histories) => {
      return histories;
    })
    .catch(() => {
      return null;
    });
};

const _createHistory = (history) => {
  const userList = history.userList;
  const remarks = history.remarks;
  const updateDate = Date(history.updateDate);
  const timeline = history.timeline;

  const newHistory = History({
    userList,
    remarks,
    updateDate,
    timeline,
  });

  return newHistory
    .save()
    .then(() => "History added!")
    .catch((err) => "Error" + err);
};

module.exports = {
  _getHistory,
  _getAllHistory,
  _createHistory,
};
