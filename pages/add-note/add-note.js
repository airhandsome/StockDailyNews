// pages/add-note/add-note.js
Page({
  data: {
    categories: [
      { title: '经济' },
      { title: '投资' },
      { title: '债券' },
      { title: '公司' },
      { title: '行业' },
      { title: '学习' }
    ],
    categoryIndex: 0,
    content: ''
  },

  onLoad: function(options) {
    if (options.category) {
      this.setData({
        categoryIndex: parseInt(options.category)
      });
    }
  },

  onCategoryChange: function(e) {
    this.setData({
      categoryIndex: e.detail.value
    });
  },

  onInput: function(e) {
    this.setData({
      content: e.detail.value
    });
  },

  submitNote: function() {
    if (!this.data.content.trim()) {
      wx.showToast({
        title: '请输入笔记内容',
        icon: 'none'
      });
      return;
    }

    const note = {
      content: this.data.content,
      category: this.data.categoryIndex,
      categoryName: this.data.categories[this.data.categoryIndex].title,
      createTime: Date.now()
    };

    let notes = wx.getStorageSync('userNotes') || [];
    notes.unshift(note);
    wx.setStorageSync('userNotes', notes);

    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        setTimeout(() => {
          wx.navigateBack({ delta: 1 });
        }, 1500);
      }
    });
  }
});