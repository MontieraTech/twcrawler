import marketDataAPI from "./md_api.js"

class symbol {

    constructor(info_, credntl_, preview_) {
        this.info = info_;
        this.api = new marketDataAPI(info_.name, credntl_, preview_)

    }

    getCandles({ dates }) {
        return this.api.getCandles(dates)
    }

    commitAll(cb_) {
        this.api.commitAll(cb_)
    }

}


const iterateSymbols = (symbols_, credntl_, options_, hndlr_) => {
    return Promise.all((symbols_).map((symbol_info, ix_) => {
        return new Promise((resolve, reject) => {
            let symbol_ = new symbol(symbol_info, credntl_, options_.preview);
            hndlr_(symbol_, resolve, reject)
        })
    }))
}

export { iterateSymbols }