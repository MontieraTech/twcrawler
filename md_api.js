import axios from "axios";

class api {

    constructor(name_) {
        this.symbolName = name_;
        this.token = 'MExWTGI4Zm8tY3JTdkgyYVBfaTRqRm5RUUlvbDVHQWNWQ3NoU1c3aGdzRT0'
    }
    getDatesParams() {
        return "from=2020-10-01&to=2023-12-10"
    }

    async getCandles(dates) {
        let url_ = `https://api.marketdata.app/v1/stocks/candles/D/${this.symbolName}?dateformat=timestamp&${this.getDatesParams()}`;
        let res = await this.get(url_);
        const { data } = res;
        // console.log(data)
        return data;
    }

    async get(url_) {

        return await axios.get(url_, {
            headers: {
                // 'Authorization': `Token ${this.token}`
            }
        });
    }


}

export default api

