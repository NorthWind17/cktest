/*
 * @Author: THH
 * @Date: 2024-06-04 13:38:30
 * @Description:
 * Copyright (c) 2024 by 神兔网络, All Rights Reserved.
 */
import Vue from 'vue'
import App from './App.vue'
import _ from 'lodash'
Vue.config.productionTip = false
Vue.prototype._ = _
new Vue({
  render: (h) => h(App)
}).$mount('#app')
