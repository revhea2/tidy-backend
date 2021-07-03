const Project = require("../models/project.model");

const _getProject = (id) => {
  return Project.findById(id)
    .then((project) => project)
    .catch(() => null);
};

const _getAllHistory = () => {
  return Project.find()
    .then((projects) => {
      return projects;
    })
    .catch(() => {
      return null;
    });
};

const _createHistory = (project) => {
  const userList = project.userList;
  const remarks = project.remarks;
  const updateDate = Date(project.updateDate);
  const timeline = project.timeline;

  const newHistory = Project({
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
  _getProject,
  _getAllHistory,
  _createHistory,
};
