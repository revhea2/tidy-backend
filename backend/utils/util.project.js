const Project = require("../models/project.model");

const _getProject = (id) => {
  return Project.findById(id)
    .then((project) => project)
    .catch(() => null);
};

const _getAllProject = () => {
  return Project.find()
    .then((projects) => {
      return projects;
    })
    .catch(() => {
      return null;
    });
};

const _createProject = (project) => {
  const projectName = project.projectName;
  const projectOwner = project.projectOwner;
  const projectHistory = project.projectHistory;
  const timeline = project.timeline;
  const task = project.task;
  const projectDetails = project.projectDetails;

  const newProject = new Project({
    projectName,
    projectOwner,
    projectHistory,
    timeline,
    projectDetails,
    task,
  });

  return newProject
  .save()
  .then(() => "Project added!")
  .catch((err) => "Error" + err);
};

module.exports = {
  _getProject,
  _getAllProject,
  _createProject,
};
