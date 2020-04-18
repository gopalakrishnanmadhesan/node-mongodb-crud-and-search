const Project = require('../models/projectModel')()

module.exports = () => {
    const getAll = (req, res) => {
        Project.getListData(req, (result) => {
            res.render("project", {
                data: result
            });
        });
    };

    const getById = (req, res) => {
        Project.getById(req, (result) => {
            res.render("project-edit", {
                data: result
            });
        });
    };

    const ajaxSearch = (req, res) => {
        Project.search(req, (result) => {
            res.render('employment-list', {
                data: {
                    project : result, 
                    type : req.params.searchtype
                }
            }, (err, html) => {
                if (err)
                    res.status(500).send({ status: "error", data: err });
                else
                    res.status(200).send({ status: "success", data: html });
            });
        });
    };

    const searchPage = (req, res) => {
        Project.getAll(req, (result) => {
            res.render("projects-search", {
                data: result,
            });
        });
    };

    return {
        getAll: getAll,
        getById: getById,
        searchPage: searchPage,
        ajaxSearch: ajaxSearch
    }
}

