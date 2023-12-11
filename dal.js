import sqlDmpr from "./sqldumper/index.js"

var dbConf = {
    "dmpr": {
        "win32": {
            "baseDir": "c:\\"

        },
        "linux": {
            "baseDir": "/home/moti/reports"

        }
    },
    "reports": {
        "candles": {
            "statement": "INSERT IGNORE INTO tw.candles %s values %s",
            "columns": {
                "symbol": {
                    "fromQueryString": "symbol",
                    "formatting": "quote"
                },
                "dt": {
                    "fromQueryString": "dt",
                    "formatting": "quote"
                },
                "open": {
                    "defaultValue": "0",
                    "fromQueryString": "open",
                },
                "low": {
                    "defaultValue": "0",
                    "fromQueryString": "low",
                },
                "high": {
                    "defaultValue": "0",
                    "fromQueryString": "high",
                },
                "close": {
                    "defaultValue": "0",
                    "fromQueryString": "close",
                },
                "volume": {
                    "defaultValue": "0",
                    "fromQueryString": "volume",
                },
            }
        },

    }
}




export default {
    sqldmpr: null,
    init: function () {

        this.sqldmpr = sqlDmpr(dbConf, {
            // "interval" : 300000,
            "interval": 1000 * 100,
            "maxRecords": 1000000
        });
    },
    push: function (rid_, data_) {
        if (!this.sqldmpr) {
            this.init();
        }
        var rec_ = {
            rid: rid_,
            query: data_,
            params: data_.params || {}
        }
        this.sqldmpr.pushReport(rec_);
    },
    flush: function (cb_) {
        if (this.sqldmpr) {
            console.log("dal flush");
            this.sqldmpr.flush(cb_);
        } else {
            console.log('Sql dmper is not initliazed')
            cb_();

        }
    },
    dump: function (cb_) {
        if (this.sqldmpr) {
            console.log("dal flush");
            this.sqldmpr.dump(cb_);
        } else {
            console.log('Sql dmper is not initliazed')
            cb_();

        }
    }
}