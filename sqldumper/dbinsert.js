//var debug = require('debug')('reports-server:filedrop-worker');

import util from "util";
import promisifyAll from "util-promisifyall";
import path from "path";
import mysql from "mysql";
import FS from "fs"

var fs = promisifyAll(FS);



var pool = mysql.createPool({
	host: '127.0.0.1',
	user: 'devops',
	port: 33061,
	password: 'x570Rock!',
	database: 'tw',
	acquireTimeout: 20000
})

var queryAsync = util.promisify(pool.query);

const getConnection = () => {
	return pool.getConnectionAsync().disposer(function (connection) {
		try {
			connection.release();
		} catch (e) { };
	});
}

Promise.each = async function (arr, fn) { // take an array and a function
	for (const item of arr) await fn(item);
}

function enumReportFiles(reportsFolder) {

	return fs.readdirAsync(reportsFolder)
		.then(function (files) {

			// filter .sql files only from data folder
			var sqlFiles = files.filter(function (file) {

				return /\.sql$/i.test(file);
			});

			return sqlFiles.map(function (file) {

				return path.join(reportsFolder, file); //return each files with its full path.

			});
		})
}



function processReports() {
	var dir_name = "/home/moti/reports" //process.argv[2] || __dirname;
	var reportsFolder = path.join(dir_name, "./data");

	console.log("processReports started. data dir:" + reportsFolder);


	///////////////////////////////////////////////////////////////////////////////////////////
	enumReportFiles(reportsFolder)
		.then((files) => {

			return Promise.each(files, function (file) {

				var new_file = file + '_' + process.pid;
				fs.renameSync(file, new_file);
				file = new_file;
				console.log("new file is " + file)
				return fs.readFileAsync(file, 'utf8')
					.then(function (fileContent) {
						return new Promise((resolve, reject) => {
							pool.query(fileContent, function (error, results, fields) {
								if (error) throw error;
								console.log('Query message: ', results.message);
								resolve();
							});
						})
					})
					.then(function (result) {

						return fs.unlinkAsync(file).then(function () {

							console.log(util.format("file %s successfully persisted to db and removed.", file));
						});

						//fs.rename(file,path.join(reportsFolder,"archive",path.basename(file))); 


					})
					.catch(TypeError, function (e) {

						process.stderr.write(util.format("Error: %j", e.stack));
					})
					.catch(function (error) {

						process.stderr.write(util.format("unable to save file %s to db. error details: %j", file, error.stack));
						if (/sql\s+syntax|out of range|uknown column|incorrect|data\s+too\s+long|duplicate/ig.test(error.stack)) {
							// sql data error
							process.stderr.write(util.format("moving to error folder.", file));
							fs.rename(file, path.join(reportsFolder, "error", path.basename(file)));

						} else {
							// assume temporary error,leave the file and try again in next cycle
						}

					})
					.finally(function () {

						console.log("processReports ended");
						process.exit(0);

					});
			})


		})
}

console.log("sql file drop module loaded");
processReports();
