
import axios from "axios";

"use strict";
process.env.DEBUG = 'dmpr'
process.env.NODE_ENV = 'development';

import moment from "moment"
import minimist from 'minimist';

import dal from "./dal.js";
import { iterateSymbols } from "./symbols.js"


let symbols = [
    {
        name: "AAPL",
        type: "stock"
    },
    // {
    //     name: "INX",
    //     type: "index"
    // }
]


class dates {
    constructor() {

    }

    getDatesAr(dates_prd) {
        var dates_ = []
        while (dates_prd.from <= dates_prd.to) {
            dates_.push(dates_prd.from.format("YYYYMMDD"))
            dates_prd.from = dates_prd.from.add(1, "days");
        }
        console.log("Dates are :" + JSON.stringify(dates_))
        return dates_
    }

    getDates(argv) {
        var dates_prd = null;
        if (argv.d) {
            var dts_ = argv.d.split('-');
            dates_prd = {
                from: new moment(dts_[0], "YYYYMMDD"),
                to: new moment(dts_[1], "YYYYMMDD")
            }
        } else {
            // argv.p= argv.p || 1;
            return null;



        }
        return this.getDatesAr(dates_prd);
    }


}


class App {

    constructor(argv_) {
        this.argv = argv_;
    }

    pushCandles(symbol_, { s, t, o, h, l, c, v }) {
        if (s == 'ok') {
            t.forEach((dt_, ix_) => {
                dal.push("candles", {
                    symbol: symbol_.info.name,
                    dt: dt_,
                    low: l[ix_],
                    high: h[ix_],
                    open: o[ix_],
                    close: c[ix_],
                    volume: v[ix_],
                })
            })

        } else {
            console.log('error')
        }

    }


    symbolHandler(symbol_, resolve, reject) {
        console.log(`symbol handler ${symbol_} `);
        var dates_ = new dates;

        var params_ = {
            symbol: symbol_,
            dates: dates_.getDates(this.argv)
        }
        var actions_ = [
            symbol_.getCandles(params_),
            // symbol_.getInsiders(params_),

        ];

        Promise.all(actions_).then((data) => {
            // console.log(data);
            this.pushCandles(symbol_, data[0])
            dal.flush(() => {
                console.log("dal flush!! wait for 1 sec ...");
                setTimeout(function () {
                    resolve();
                }, 1000);
            })
            // resolve()
        })
    }


    tw_crdntl() {
        try {
            console.log("Credentials :" + new URL("../../../nlcrdntl.txt", import.meta.url))
            // var ws_crdntl_raw = fs.readFileSync(path.join(__dirname, "../../../wscrdntl.txt"), 'utf8');
            return {}; //JSON.parse(ws_crdntl_raw)
        } catch (e) {
            console.log("EXCEPTION@ws_init " + e)
            process.exit(0)
        }
    }

    main(cb_) {
        let opts_ = { preview: false }
        let credntl_ = this.tw_crdntl();
        iterateSymbols(symbols, credntl_, opts_, (symbol_, resolve, reject) => {
            this.symbolHandler(symbol_, resolve, reject)
        }).then(() => {
            console.log("START FINAL DUMP !!")
            dal.dump(() => {
                console.log("FINAL DUMP IS DONE!!")
                cb_()
            })


        });
    }
}






//command line sample
//node ./index   -d 20190928-20190928
try {

    var argv = minimist(process.argv.slice(2));
    var app_ = new App(argv);
    app_.main(function () {
        console.log("App is done ")
        setTimeout(function () { process.exit(0); }, 3000);
    });



} catch (e) { console.log(e); }









