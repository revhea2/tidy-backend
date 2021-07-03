const History = require("../models/history.model");

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
  _createHistory,
};
