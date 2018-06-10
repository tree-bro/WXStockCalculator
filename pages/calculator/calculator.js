// pages/calculator/calculator.js
var Parser = require("../../lib/dom-parser");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    StockID:'600000',
    StockName:'',
    MarketPrice:10.0,
    ProfitPerShare:1.0,
    ProfitSharingRatio:20.0,
    TradeTax:1.0,
    CompanyDuration:30,
    DiscountRatio:7.0,
    NaturalGrowthRate:0.5,
    HighSpeedGrowthRate:5.0,
    HighSpeedGrowthDuration:0,
    ProfitSharingTax:0.5,
    DepressionCycle:7,
    DepressionLossRate:95.0,
    StockHeldDuration:5,
    AssumedStockPriceGrowth:0.02,
    ResultTemplate: [
      '*************************',
      '扣除分红后的内在价值: [_INNER_VALUE_DEDUCT_PROFIT_SHARING_]',
      '总内在价值: [_INNER_VALUE_]',
      '交易价格: [_MARKET_PRICE_]',
      '*************************',
      '',
      '*************************',
      '总分红: [_PROFIT_SHARING_]',
      '总交易印花税: [_TRADING_TAX_PAID_]',
      '总买入印花税: [_BUY_TAX_PAID_]',
      '总卖出印花税: [_SELL_TAX_PAID_]',
      '**************************',
      '',
      '**************************',
      '市价 / 内在价值: [_MARKET_PRICE_TO_INNER_VALUE_]%',
      '**************************'
    ]
  },

  urlTemplates:{
    BaiduTemplateByID:'https://gupiao.baidu.com/api/stocks/stockbets?from=h5&os_ver=0&cuid=xxx&vv=2.2&format=json&stock_code=[_STOCK_ID_]',
    IFengCaiWuTemplateByID:'http://app.finance.ifeng.com/data/stock/tab_cwjk.php?symbol=[_STOCK_ID_]',
    IFengProfitSharingTemplateByID:'http://app.finance.ifeng.com/data/stock/tab_fhpxjl.php?symbol=[_STOCK_ID_]'
  },

  btnCalculateClicked: function(){
    var calculationResult = "";
    var currentInterest = 1.0;
    var currentGrowth = 1.0;
    var totalProfitSharing = 0.0;
    var totalTradingTaxPaid = 0.0;
    var totalInnerValue = 0.0;
    var resultForSell = 0.0;
    var profitSharingRate = this.data.ProfitSharingRatio / 100.0;
    var profitSharingTax = this.data.ProfitSharingTax / 100.0;
    var depressionLossRate = this.data.DepressionLossRate / 100.0;
    var discountRate = this.data.DiscountRatio / 100.0;
    var totalBuyTax = 0.0;
    var totalSellTax = 0.0;
    var tradingTaxRate = this.data.TradeTax / 100.0;
    
    
    for(var idx=0; idx < this.data.CompanyDuration; idx ++)
    {
      //calculate the risk interest rate for current year
      currentInterest = currentInterest * (1.0 / (1.0 + discountRate));

      //If HSG is larger than 0, and current year has not reach the upper limit for HSG,then calculate for HSG
      if (this.data.HighSpeedGrowthRate > 0 && this.data.HighSpeedGrwothDuration >= idx) {
        currentGrowth = currentGrowth * (1.0 + this.data.HighSpeedGrowthRate / 100.0);
      }
      else {
        currentGrowth = currentGrowth * (1.0 + this.data.NaturalGrowthRate / 100.0);
      }

      if (idx % this.data.DepressionCycle > 0) {
        totalProfitSharing = totalProfitSharing + currentInterest * this.data.ProfitPerShare * currentGrowth * profitSharingRate * (1.0 - profitSharingTax);
        totalTradingTaxPaid = totalTradingTaxPaid + currentInterest * this.data.ProfitPerShare * currentGrowth * profitSharingRate * profitSharingTax;
        totalInnerValue = totalInnerValue + currentInterest * this.data.ProfitPerShare * currentGrowth * (1 - profitSharingRate);
        resultForSell = resultForSell + this.data.ProfitPerShare * currentGrowth * (1 - profitSharingRate);
      }
      else {
        totalProfitSharing = totalProfitSharing + currentInterest * this.data.ProfitPerShare * currentGrowth * profitSharingRate * (1.0 - profitSharingTax) * (1.0 - depressionLossRate);
        totalTradingTaxPaid = totalTradingTaxPaid + currentInterest * this.data.ProfitPerShare * currentGrowth * profitSharingRate * profitSharingTax * (1.0 - depressionLossRate / 100);
        totalInnerValue = totalInnerValue + currentInterest * this.data.ProfitPerShare * currentGrowth * (1.0 - profitSharingRate) * (1.0 - depressionLossRate / 100);
        resultForSell = resultForSell + this.data.ProfitPerShare * currentGrowth * (1.0 - profitSharingRate) * (1.0 - depressionLossRate / 100);
      }

      if (this.data.StockHeldDuration > 0 && idx % this.data.StockHeldDuration == 0) {
        totalBuyTax = totalBuyTax + this.data.MarketPrice * (1.0 + idx * this.data.AssumedStockPriceGrowth) * tradingTaxRate * currentInterest;
        totalSellTax = totalSellTax + this.data.MarketPrice * (1.0 + idx * this.data.AssumedStockPriceGrowth) * tradingTaxRate * currentInterest;
      }
    }

    totalSellTax = totalSellTax + resultForSell * currentInterest * tradingTaxRate;

    var realInnerValue = totalInnerValue + totalProfitSharing - totalBuyTax - totalSellTax - totalTradingTaxPaid;
    var marketPriceToInnerValue = this.data.MarketPrice / realInnerValue * 100.0;

    calculationResult = this.data.ResultTemplate.join('\n');
    calculationResult = calculationResult
      .replace('[_MARKET_PRICE_]', Number(Math.round(this.data.MarketPrice + 'e2') + 'e-2'))
      .replace('[_INNER_VALUE_DEDUCT_PROFIT_SHARING_]', Number(Math.round(totalInnerValue + 'e4') + 'e-4'))
      .replace('[_PROFIT_SHARING_]', Number(Math.round(totalProfitSharing + 'e4') + 'e-4'))
      .replace('[_TRADING_TAX_PAID_]', Number(Math.round(totalTradingTaxPaid + 'e4') + 'e-4'))
      .replace('[_BUY_TAX_PAID_]', Number(Math.round(totalBuyTax + 'e4') + 'e-4'))
      .replace('[_SELL_TAX_PAID_]', Number(Math.round(totalSellTax + 'e4') + 'e-4'))
      .replace('[_INNER_VALUE_]', Number(Math.round(realInnerValue + 'e4') + 'e-4'))
      .replace('[_MARKET_PRICE_TO_INNER_VALUE_]', Number(Math.round(marketPriceToInnerValue + 'e4') + 'e-4'));
    
    wx.showModal({
      title: '计算结果',
      content: calculationResult,
      showCancel: false,
      cancelText: '',
      cancelColor: '',
      confirmText: '确认',
      confirmColor: '',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  btnParseCompanyInfoClicked:function(e){
    var regForSH = new RegExp('6[0-9]{5}');
    var regForSZ = new RegExp('0[0-9]{5}');
    var regForHK = new RegExp('[0-9]{5}');

    var stockInfoRequestURL = this.urlTemplates.BaiduTemplateByID;
    var profitPerShareRequestURL = this.urlTemplates.IFengCaiWuTemplateByID;
    var lastProfitSharingRequestURL = this.urlTemplates.IFengProfitSharingTemplateByID;
    profitPerShareRequestURL = profitPerShareRequestURL.replace("[_STOCK_ID_]",this.data.StockID);
    lastProfitSharingRequestURL = lastProfitSharingRequestURL.replace("[_STOCK_ID_]", this.data.StockID);
    if(regForSH.test(this.data.StockID)){
      stockInfoRequestURL = stockInfoRequestURL.replace("[_STOCK_ID_]", "sh" + this.data.StockID);
    }else if(regForSZ.test(this.data.StockID)){
      stockInfoRequestURL = stockInfoRequestURL.replace("[_STOCK_ID_]", "sz" + this.data.StockID);
    }else if(regForHK.test(this.data.StockID)){
      stockInfoRequestURL = stockInfoRequestURL.replace("[_STOCK_ID_]", "hk" + this.data.StockID);
    }

    console.log("stockInfoRequestURL=" + stockInfoRequestURL);
    console.log("profitPerShareRequestURL=" + profitPerShareRequestURL);

    var that = this;
    wx.showLoading({
      title: '资料加载中...',
    })
    Promise.all(
      [
        wx.request({
          url: stockInfoRequestURL,
          method: "GET",
          success: function (e) {
            try{
              console.log(e.data);
             
              var nameNode = e.data.snapShot.stockBasic.stockName;
              var dateNode = e.data.snapShot.date;
              var closePriceNode = e.data.snapShot.close;
              var peNode = e.data.snapShot.peratio;

              //name node
              console.log("nameNode=" + nameNode);
              if (nameNode != undefined) {
                that.setData({
                  StockName: nameNode.trim()
                });
              }
              //date node
              //console.log(htmlDoc.getElementsByClassName("state f-up")[0].innerText);
              //close price node
              console.log("closePriceNode=" + closePriceNode);
              if (closePriceNode != undefined) {
                that.setData({
                  MarketPrice: Number(Math.round(closePriceNode + 'e4') + 'e-4')
                });
              }
              //detail node
              //console.log(htmlDoc.getElementsByTagName("Class","bets-content")[0].innerText);
              console.log("peNode=" + peNode);
              if (peNode != undefined) {
                var calculateProfitPerShare = closePriceNode / peNode * 0.8;
                that.setData({
                  ProfitPerShare: Number(Math.round(calculateProfitPerShare + 'e4') + 'e-4')
                });
              }
            }catch(err){
              console.error(err);
            }finally{
              wx.hideLoading();
            }
            
          }
        }),
        wx.request({
          url: profitPerShareRequestURL,
          method: "GET",
          success: function (e) {
            //console.log(e.data);
          }
        })
      ]
    );
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  
  setStockID:function(e){
    //console.log(e);
    this.setData({
      StockID:e.detail.value
    })
  },

  setStockName:function(e){
    this.setData({
      StockName:e.detail.value
    })
  },

  setMarketPrice:function(e){
    this.setData({
      MarketPrice:e.detail.value
    })
  },

  setProfitPerShare:function(e){
    this.setData({
      ProfitPerShare:e.detail.value
    })
  },

  setProfitSharingRatio:function(e){
    this.setData({
      ProfitSharingRatio:e.detail.value
    })
  },

  setTradeTax:function(e){
    this.setData({
      TradeTax:e.detail.value
    })
  },

  setCompanyDuration:function(e){
    this.setData({
      CompanyDuration:e.detail.value
    })
  },

  setDiscountRate:function(e){
    this.setData({
      DiscountRatio:e.detail.value
    })
  },

  setNaturalGrowthRate:function(e){
    this.setData({
      NaturalGrowthRate:e.detail.value
    })
  },

  setHighSpeedGrowthRate:function(e){
    this.setData({
      HighSpeedGrowthRate:e.detail.value
    })
  },

  setDepressionCycle:function(e){
    this.setData({
      DepressionCycle:e.detail.value
    })
  },

  setDepressionLossRate:function(e){
    this.setData({
      DepressionLossRate:e.detail.value
    })
  },
  
})