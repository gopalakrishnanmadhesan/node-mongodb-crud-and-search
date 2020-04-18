const Employment = require('../models/employmentModel')()

module.exports = () => {
    const getAll = (req, res) => {
        console.log("came request");
        Employment.getAll(req, (result) => {
            res.render("employment", { data: result });
        });
    };

    const getById = (req, res) => {
        Employment.getById(req, (result) => {
            res.render("employment-edit", { data: result });
        });
    };

    const ajaxSearch = (req, res) => {
        console.log("came search");
        Employment.search(req, (result) => {
            res.render('project-list', {data: {project : result, type : req.params.searchtype}}, (err, html) => {
                if (err)
                    res.status(500).send({ status: "error", data: err });
                else
                    res.status(200).send({ status: "success", data: html });
            });
        });
    };

    const searchPage = (req, res) => {
        Employment.getAll(req, (result) => {
            res.render("employment-search", {
                data: result,
            });
        });
    };

    return {
        getAll: getAll,
        getById: getById,
        searchPage: searchPage,
        ajaxSearch: ajaxSearch,
    }
}

