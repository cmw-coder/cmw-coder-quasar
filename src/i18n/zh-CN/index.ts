export default {
  components: {
    AccountInput: {
      errors: {
        account: '域账号无效（输入字符过短）',
      },
      hints: {
        account: '请输入您的 H3C 域账号（工号）',
      },
      labels: {
        account: '账号',
      },
    },
    CodeBlock: {
      tooltips: {
        copy: '复制到剪贴板',
        insert: '插入到 IDE',
      },
    },
    DarkModeButton: {
      labels: {
        toggleDarkMode: '切换暗色模式',
      },
    },
    LoginPanels: {
      AccountPanel: {
        errors: {
          account: '域账号无效（输入字符太短）',
        },
        labels: {
          account: '账号',
          continue: '继续',
          description: '您需要登录才能使用此应用程序。',
          intro: '欢迎使用 Comware Coder',
        },
        hints: {
          account: '请输入您的 H3C 域账号（工号）',
        },
        notifications: {
          codeFailed: '发送验证码失败',
          networkCaption: '请检查您的网络是否通畅',
        },
      },
      CodePanel: {
        errors: {
          code: '验证码无效（输入字符过短）',
        },
        labels: {
          goBack: '返回',
          code: '验证码',
          description: '我们已将验证码发送到您的工作邮箱和企业微信。',
          resend: '重新发送',
          resending: '重新发送中',
          resendAfter: '。',
          resendBefore: '没有收到验证码？检查您的垃圾邮件或',
          signIn: '登录',
        },
        notifications: {
          codeFailed: '发送验证码失败',
          codeSent: '验证码已发送',
          loginFailed: '登录失败',
          loginSuccess: '登录成功',
          networkCaption: '请检查您的网络是否通畅',
        },
      },
    },
    ProjectIdInput: {
      errors: {
        projectId: '项目 ID 无效',
      },
      hints: {
        projectId: '请输入项目 ID（NV 项目流水号或 TB 问题单号）',
      },
      labels: {
        projectId: '项目 ID',
      },
    },
    SettingCards: {
      CompletionCard: {
        labels: {
          title: '代码补全',
          productLine: '产品线',
          model: 'AI 模型',
        },
      },
      GeneralCard: {
        labels: {
          developerOptions: '开发者选项',
          displayTheme: '界面主题',
          displayThemeOptions: {
            auto: '自动',
            dark: '暗色',
            light: '亮色',
          },
          locale: '界面语言',
          title: '通用',
          transparentFallback: '透明窗口兼容模式（Windows 7）',
          zoomFix: '窗口缩放修复',
        },
      },
      UpdateCard: {
        labels: {
          appVersion: '应用程序版本',
          checkForUpdate: '立即检查更新',
          title: '更新',
        },
        notifications: {
          developerModeOngoing: '点击 {times} 次以启用开发者模式',
          developerModeEnabled: '开发者模式已启用',
        },
      },
    },
    WelcomePanels: {
      AutoPanel: {
        labels: {
          title: '检测当前网络区域...',
        },
      },
      FinishPanel: {
        labels: {
          confirm: '确认',
          title: '您已完成初始化设置！',
          tip: '您可以在这里更改常用设置，或直接开始使用 Comware Coder。',
        },
      },
      ManualPanel: {
        labels: {
          normalArea: '红区',
          publicArea: '黄区/绿区',
          secureArea: '路由红区',
          title: '自动检测当前网络区域失败，请手动设置',
        },
        notifications: {
          pingError: '服务器连通性测试失败，请检查您的网络连接。',
          pingSuccess: '成功通过服务器连通性测试',
        },
        steps: [
          {
            title: '选择当前网络区域',
            next: '继续',
            previous: '重新检测',
          },
          { title: '设置服务器根 URL', next: '完成', previous: '返回' },
        ],
      },
    },
  },
  layouts: {
    drawers: {
      LeftMainDrawer: {
        navigations: {
          chat: 'AI 对话',
          commit: '代码提交',
          feedback: '问题反馈',
          settings: '应用设置',
          workflow: '工作流程',
          review: '代码评审',
        },
      },
      RightMainDrawer: {},
    },
    footers: {
      QuestionFooter: {
        labels: {
          thinking: '思考中...',
        },
        tooltips: {
          newTopic: '开始新一轮对话',
        },
      },
    },
    headers: {
      FloatingHeader: {
        labels: {
          title: 'Comware Coder',
        },
        tooltips: {
          close: '关闭',
          defaultSize: '恢复默认大小',
          minimize: '最小化',
          toggleMaximize: '切换最大化',
        },
      },
      MainHeader: {
        labels: {
          title: 'Comware Coder',
        },
        tooltips: {
          close: '关闭',
          defaultSize: '恢复默认大小',
          minimize: '最小化',
          toggleMaximize: '切换最大化',
        },
      },
    },
  },
  pages: {
    CommitPage: {
      labels: {
        cancel: '取消',
        changes: '文件更改',
        commit: '提交',
        generate: '生成',
        message: '提交信息',
        noSelect: '未选择文件',
        refresh: '刷新',
        selectRepo: '选择 SVN 仓库',
        title: '提交您的代码',
      },
      tooltips: {
        generate: '从 AI 生成提交消息',
        generating: '生成中...',
      },
      notifications: {
        commitFailed: '提交失败',
        commitSuccess: '提交成功',
        generateFailed: '生成提交信息失败',
        invalidProject: '项目无效',
      },
    },
    DeveloperPage: {
      labels: {
        currentFile: '当前文件',
        referenceFiles: '参考文件',
      },
    },
    FeedbackPage: {
      labels: {
        title: '问题反馈',
        account: '账号',
        description: '问题描述',
        images: '问题相关截图',
        cancel: '取消',
        submit: '提交',
      },
      hints: {
        account: '请输入您的 H3C 域账号（工号）',
      },
      notifications: {
        feedbackSuccess: '反馈已提交',
        feedbackFailed: '反馈提交失败',
      },
    },
    LoginPage: {
      labels: {
        title: '欢迎',
      },
    },
    ProjectIdPage: {
      labels: {
        confirm: '确认',
        description: '当前项目文件夹：{project}',
        intro: '您需要提供项目 ID 以统计您的编码行为。',
        temporary: '这是一个临时项目',
        title: '配置新项目',
      },
    },
    SettingsPage: {
      labels: {
        title: '设置',
      },
    },
    UpdatePage: {
      labels: {
        cancel: '暂不升级',
        confirm: '立刻升级',
        title: '有新版本可用',
        currentVersion: '当前版本：',
        newVersion: '新版本：',
        releaseDate: '发布日期：{releaseDate}',
      },
    },
    WelcomePage: {
      labels: {
        title: '欢迎使用 Comware Coder',
      },
      notifications: {
        configError: '保存配置失败',
      },
    },
    WorkflowPage: {
      labels: {
        agentAudit: '等待代理审核...',
        compileCode: '编译代码中...',
        copyWorkflowId: '复制工作流 ID',
        deleteWorkflow: '删除工作流',
        deployArtifact: '部署二进制文件中...',
        staticCheck: '执行静态检查中...',
      },
      notifications: {
        copyFailure: '复制工作流 ID 失败',
        copySuccess: '工作流 ID 已复制到剪贴板',
      },
    },
    ReviewPage: {
      labels: {
        title: '评审高亮代码',
      },
    },
    CodeSelectedTipsPage: {
      labels: {
        addToChat: '添加到聊天中（Ctrl + L）',
        review: '评审高亮代码（Ctrl + I）',
      },
    },
  },
};
