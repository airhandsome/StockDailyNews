// index.js
Page({
  data: {
    currentTab: 0,
    bannerList: [
      'https://s.coze.cn/t/Cn6ZOaptcnQ5B7kO/',
      'https://s.coze.cn/t/Ch8GlhIjP4ojoBws/',
      'https://s.coze.cn/t/CnrdSog3dEnfuEY-/'
    ],
    categories: [
      { title: '宏观', reports: [] },
      { title: '基金', reports: [] },
      { title: '债市', reports: [] },
      { title: '公司', reports: [] },
      { title: '行业', reports: [] },
      { title: '策略', reports: [] }
    ],
    isLoading: true,  // 添加加载状态
    showCategoryModal: false
  },

  onLoad: function() {
    this.loadData();
  },
  showAddNoteModal(){
    this.setData({
      showCategoryModal: true
    })
  },
  hideAddNoteModal(){
    this.setData({
      showCategoryModal: false
    })
  },
  loadData(){
    try {
      this.setData({ isLoading: true }); // 开始加载    
      // 先检查缓存
      const cacheData = wx.getStorageSync('reportData')
      const cacheTime = wx.getStorageSync('reportDataTime')
      
      if (cacheData && cacheTime && (Date.now() - cacheTime < 8 * 60 * 60 * 1000)) {
        this.setData({
          bannerList: cacheData.bannerList,
          'categories[0].reports': cacheData.sections['宏观'] || [],
          'categories[1].reports': cacheData.sections['基金'] || [],
          'categories[2].reports': cacheData.sections['债市'] || [],
          'categories[3].reports': cacheData.sections['公司'] || [],
          'categories[4].reports': cacheData.sections['行业'] || [],
          'categories[5].reports': cacheData.sections['策略'] || [],
          isLoading: false
        });
        return;
      }      
    } catch (error) {
      console.error('Error fetching report data:', error);
      wx.showToast({
        title: '数据获取失败',
        icon: 'none'
      });
    } finally {
      this.setData({ isLoading: false }); // 结束加载
    }

  },

  // 获取报告数据
  async fetchReportData() {
    try {
      this.setData({ isLoading: true }); // 开始加载
      
      // 先检查缓存
      const cacheData = wx.getStorageSync('reportData')
      const cacheTime = wx.getStorageSync('reportDataTime')
      
      if (cacheData && cacheTime && (Date.now() - cacheTime < 8 * 60 * 60 * 1000)) {
        this.setData({
          bannerList: cacheData.bannerList,
          'categories[0].reports': cacheData.sections['宏观'] || [],
          'categories[1].reports': cacheData.sections['基金'] || [],
          'categories[2].reports': cacheData.sections['债市'] || [],
          'categories[3].reports': cacheData.sections['公司'] || [],
          'categories[4].reports': cacheData.sections['行业'] || [],
          'categories[5].reports': cacheData.sections['策略'] || [],
          isLoading: false
        });
        return;
      }

      // 第一步：发起聊天请求
      const chatResponse = await this.initiateChatRequest();
      if (!chatResponse || chatResponse.code !== 0) {
        throw new Error('Chat request failed');
      }

      const chatId = chatResponse.data.id;
      const conversationId = chatResponse.data.conversation_id;

      // 第二步：轮询检查状态
      await this.pollChatStatus(chatId, conversationId);

      // 第三步：获取消息内容
      const messages = await this.fetchChatMessages(chatId, conversationId);
      
      // 解析并更新数据，同时保存缓存
      this.parseAndUpdateData(messages);

    } catch (error) {
      console.error('Error fetching report data:', error);
      wx.showToast({
        title: '数据获取失败',
        icon: 'none'
      });
    } finally {
      this.setData({ isLoading: false }); // 结束加载
    }
  },

  // 发起聊天请求
  async initiateChatRequest() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://api.coze.cn/v3/chat',
        method: 'POST',
        header: {
          'Authorization': 'Bearer pat_q5FAIJ3Vx2n7uig5HnV1g616XHSXwFjfWyJQXX27LHbuQ2Wh4pScWywMB2Jyr6I5',
          'Content-Type': 'application/json'
        },
        data: {
          "bot_id": "7444542805655322659",
          "user_id": "2210459085181779",
          "stream": false,
          "auto_save_history": true,
          "additional_messages": [{
            "role": "user",
            "content": "每日研报",
            "content_type": "text"
          }]
        },
        success: (res) => resolve(res.data),
        fail: reject
      });
    });
  },

  // 轮询检查状态
  async pollChatStatus(chatId, conversationId) {
    return new Promise((resolve, reject) => {
      const checkStatus = () => {
        wx.request({
          url: `https://api.coze.cn/v3/chat/retrieve?chat_id=${chatId}&conversation_id=${conversationId}`,
          method: 'GET',
          header: {
            'Authorization': 'Bearer pat_q5FAIJ3Vx2n7uig5HnV1g616XHSXwFjfWyJQXX27LHbuQ2Wh4pScWywMB2Jyr6I5',
            'Content-Type': 'application/json'
          },
          success: (res) => {
            if (res.data.code === 0 && res.data.data.status === 'completed') {
              resolve(res.data);
            } else if (res.data.code === 0) {
              setTimeout(checkStatus, 2000); // 2秒后重试
            } else {
              reject(new Error('Status check failed'));
            }
          },
          fail: reject
        });
      };

      checkStatus();
    });
  },

  // 获取消息内容
  async fetchChatMessages(chatId, conversationId) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://api.coze.cn/v3/chat/message/list?chat_id=${chatId}&conversation_id=${conversationId}`,
        method: 'GET',
        header: {
          'Authorization': 'Bearer pat_q5FAIJ3Vx2n7uig5HnV1g616XHSXwFjfWyJQXX27LHbuQ2Wh4pScWywMB2Jyr6I5',
          'Content-Type': 'application/json'
        },
        success: (res) => resolve(res.data),
        fail: reject
      });
    });
  },

  // 解析数据并更新UI
  parseAndUpdateData(messagesResponse) {
    if (messagesResponse.code !== 0 || !messagesResponse.data) {
      throw new Error('Invalid message data');
    }

    const toolResponse = messagesResponse.data.find(msg => msg.type === 'tool_response');
    if (!toolResponse) {
      throw new Error('Tool response not found');
    }

    try {
      const content = toolResponse.content;
      const lines = content.split('\n').map(line => line.trim()).filter(line => line);
      
      const bannerImages = [];
      let currentSection = '';
      const sectionData = {
        '宏观': [],
        '基金': [],
        '债市': [],
        '公司': [],
        '行业': [],
        '策略': []
      };
      console.log(content);
      console.log('开始解析数据...');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        console.log('处理行:', line);

        if (line.startsWith('https://')) {
          bannerImages.push(line);
        } else if (Object.keys(sectionData).includes(line)) {
          currentSection = line;
          console.log('当前分类:', currentSection);
          
          // 查找下一行的数据
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1];
            if (nextLine.includes('[') && nextLine.includes(']')) {
              try {
                const jsonStr = nextLine.substring(nextLine.indexOf('['), nextLine.lastIndexOf(']') + 1);
                const reports = JSON.parse(jsonStr);
                if (Array.isArray(reports)) {
                  sectionData[currentSection] = reports;
                  console.log(`${currentSection} 解析成功:`, reports);
                }
              } catch (e) {
                console.error(`${currentSection} 解析失���:`, e);
              }
            }
          }
        }
      }

      console.log('最终解析结果:', sectionData);

      // 更新数据
      this.setData({
        bannerList: bannerImages,
        'categories[0].reports': sectionData['宏观'] || [],
        'categories[1].reports': sectionData['基金'] || [],
        'categories[2].reports': sectionData['债市'] || [],
        'categories[3].reports': sectionData['公司'] || [],
        'categories[4].reports': sectionData['行业'] || [],
        'categories[5].reports': sectionData['策略'] || [],
        isLoading: false
      });

      // 保存缓存
      wx.setStorageSync('reportData', {
        bannerList: bannerImages,
        sections: sectionData
      });
      wx.setStorageSync('reportDataTime', Date.now());
      wx.reLaunch({
        url: '/pages/index/index'
      });
    } catch (error) {
      console.error('Error parsing content:', error);
      throw error;
    }
  },

  // 切换tab
  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentTab: index });
  },

  // swiper滑动切换
  swiperChange(e) {
    this.setData({ currentTab: e.detail.current });
  },

  // 下拉刷新
  // onPullDownRefresh: function() {
  //   // 清除缓存，重新获取数据
  //   wx.removeStorageSync('reportData')
  //   wx.removeStorageSync('reportDataTime')
  //   this.fetchReportData().then(() => {
  //     wx.stopPullDownRefresh()
  //   })
  // },

  // 添加图片错误处理
  imageError: function(e) {
    const index = e.currentTarget.dataset.index;
    // 设置备用图片
    const backupImages = [
      'https://s.coze.cn/t/Cn6ZOaptcnQ5B7kO/',
      'https://s.coze.cn/t/Ch8GlhIjP4ojoBws/',
      'https://s.coze.cn/t/CnrdSog3dEnfuEY-/'
    ];
    
    const key = `bannerList[${index}]`;
    this.setData({
      [key]: backupImages[index]
    });
    
    console.log(`图片${index}加载失败，已替换为备用图片`);
  },

  // 添加跳转方法
  navigateToAnalyst: function() {
    wx.navigateTo({
      url: '/pages/analyst/analyst',
      success: function() {
        console.log('跳转到分析师页面成功');
      },
      fail: function(error) {
        console.error('跳转失败：', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 刷新数据
  refreshData: function() {
    wx.showModal({
      title: '确认刷新',
      content: '确定要刷新数据吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除缓存
          wx.removeStorageSync('reportData');
          wx.removeStorageSync('reportDataTime');
          this.fetchReportData();                  
        }
      }
    });
  },

  // 选择分类
  selectCategory: function(e) {
    const categoryIndex = e.currentTarget.dataset.category; // 获取分类索引
    // 隐藏弹窗
    this.setData({
      showCategoryModal: false
    });

    // 跳转到添加笔记页面，并传递分类信息
    wx.navigateTo({
      url: `/pages/add-note/add-note?category=${categoryIndex}`
    });
  }
})
