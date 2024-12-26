// pages/analyst/analyst.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    analyst: {
      name: '张明远',
      title: '高级证券分析师',
      institution: '中金证券研究所',
      avatar: '/images/analyst-avatar.png',
      certification: '金牌分析师',
      fields: ['新能源', '电动车', '光伏产业'],
      introduction: '从业12年，专注新能源领域研究。曾获新财富最佳分析师、金牛分析师等奖项。擅长产业链分析与公司深度研究，对新能源行业有独到见解。',
      achievements: [
        {
          year: '2023',
          content: '新财富最佳分析师第一名'
        },
        {
          year: '2022',
          content: '金牛分析师新能源行业top3'
        },
        {
          year: '2021',
          content: '水晶球奖最佳分析师'
        }
      ],
      reports: [
        {
          title: '新能源车产业链深度报告：创新引领发展',
          date: '2024-03-15'
        },
        {
          title: '光伏行业：需求持续向好，产能优化加速',
          date: '2024-03-10'
        },
        {
          title: '储能行业：政策利好，发展正当时',
          date: '2024-03-05'
        }
      ],
      contact: {
        email: 'analyst@example.com',
        phone: '010-12345678'
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function() {
      // 可以在这里加载分析师数据
    },

    // 点击研报时的处理函数
    onReportTap: function(e) {
      const index = e.currentTarget.dataset.index;
      const report = this.data.analyst.reports[index];
      // 处理研报点击，比如跳转到研报详情页
      wx.showToast({
        title: '研报详情开发中',
        icon: 'none'
      });
    }
  }
})