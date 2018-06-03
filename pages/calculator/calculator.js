// pages/calculator/calculator.js
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
    StockHeldDuration:5
  },

  btnCalculateClicked: function(){
    //var marketPrice = 
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
      DiscountRate:e.detail.value
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

  
})