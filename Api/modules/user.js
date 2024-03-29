// 分类
var express = require('express');
var router = express.Router();
let db = require("../db/db");
let mysql = require("mysql");
let sqlOp = require("../sql-op/index");

// 连接数据库
var conn = mysql.createConnection(db.mysql);
conn.connect((err) => {
    if (err) {
        console.log('数据库链接失败')
    }
    console.log('数据库链接成功...')
});

// 获取用户数据
router.get("/get-user", (req, res) => {
    let sql = "SELECT * FROM `any_user` LIMIT 0, 100";
    conn.query(sql, function (err, result) {
        if (err) {
            console.log(res);
            return res.json({
                message: "获取用户失败",
                code: 202
            });
        }
        if (result) {
            let data = result;
            return res.json({
                message: "获取用户成功",
                code: 200,
                data: result
            });
        } else {
            return res.json({
                message: "获取用户失败",
                code: 201
            });
        }
    });
});

// 获取授权信息
router.post("/getAuthInfo", (req, res) => {
    console.log(req.body.id);
    let sql = "SELECT * FROM `any_cate`";
    let sql2 = "SELECT * FROM `any_user_auth` WHERE user_id=" + req.body.id;
    let sqlMore = `${sql};${sql2}`;
    conn.query(sqlMore, function (err, result) {
        if (err) {
            console.log(res);
            return res.json({
                message: "获取授权信息失败",
                code: 202
            });
        }
        if (result) {
            let data = result;
            console.log(data[1]);
            return res.json({
                message: "获取授权信息成功",
                code: 200,
                data: {
                    cate: infiniteClassify(data[0], "id", "parent_id"),
                    userAuth: data[1]
                }
            });
        } else {
            return res.json({
                message: "获取授权信息失败",
                code: 201
            });
        }
    });
});


// 保存用户配置
router.post("/saveUserConfig", (req, res) => {
    let keyArr = [],
        valArr = [];
    for (let key in req.body) {
        keyArr.push(key);
        valArr.push(`'${req.body[key]}'`)
    }
    let newSql = sqlOp.sql.insert("any_user_auth", keyArr, valArr);
    conn.query(newSql, function (err, result) {
        if (err) {
            return res.json({
                message: "用户配置失败",
                code: 202
            });
        }
        if (result) {
            let data = result;
            return res.json({
                message: "用户配置成功",
                code: 200
            });
        } else {
            return res.json({
                message: "用户配置失败",
                code: 201
            });
        }
    });
})

router.post("/searchConfigUser", (req, res) => {
    let sql = "SELECT * FROM `any_user` WHERE mobile=" + req.body.mobile;
    conn.query(sql, function (err, result) {
        if (err) {
            return res.json({
                message: "失败",
                code: 202
            });
        }
        if (result) {
            let data = result;
            return res.json({
                message: "成功",
                code: 200,
                data: result
            });
        } else {
            return res.json({
                message: "失败",
                code: 201
            });
        }
    });
});

router.post("/updateUserConfig", (req, res) => {
    let sql = "UPDATE `any_user_auth` SET user_auth=" + `"${req.body.user_auth}"` + " WHERE user_id=" + req.body.user_id;
    console.log(sql);
    conn.query(sql, function (err, result) {
        if (err) {
            return res.json({
                message: "用户配置更新失败",
                code: 202
            });
        }
        if (result) {
            let data = result;
            return res.json({
                message: "用户配置更新成功",
                code: 200
            });
        } else {
            return res.json({
                message: "用户配置更新失败",
                code: 201
            });
        }
    });
})

function infiniteClassify(data, id, pid) {
    let map = {};
    let resData = [];
    //生成数据对象集合
    data.forEach(it => {
        map[it[id]] = it;
    })
    //生成结果集
    data.forEach(it => {
        let parent = map[it[pid]];
        if (parent) {
            if (!Array.isArray(parent.children)) parent.children = [];
            parent.children.push(it);
        } else {
            resData.push(it);
        }
    })
    return resData;
}

module.exports = router;