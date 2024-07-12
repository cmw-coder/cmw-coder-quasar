export default {
  components: {
    AccountInput: {
      errors: {
        account: '帐户无效（太短）',
      },
      hints: {
        account: '请输入您的 H3C 帐户（工号）',
      },
      labels: {
        account: '帐户',
      },
    },
    CodeBlock: {
      tooltips: {
        copy: '复制到剪贴板',
        insert: '插入到编辑器',
      },
    },
    DarkModeButton: {
      labels: {
        toggleDarkMode: '切换暗模式',
      },
    },
    LoginPanels: {
      AccountPanel: {
        errors: {
          account: '帐户无效（太短）',
        },
        labels: {
          account: '帐户',
          continue: '继续',
          description: '您需要登录才能使用此应用程序。',
          intro: '欢迎使用 Comware Coder',
        },
        hints: {
          account: '请输入您的 H3C 帐户（工号）',
        },
        notifications: {
          codeFailed: '发送验证码失败',
          networkCaption: '请检查您的网络',
        },
      },
      CodePanel: {
        errors: {
          code: '验证码无效（太短）',
        },
        labels: {
          goBack: '返回',
          code: '验证码',
          description: '我们已将验证码发送到您的邮箱和企业微信。',
          resend: '重新发送验证码',
          resending: '重新发送中',
          resendAfter: '后重新发送。',
          resendBefore: '没有收到验证码？检查您的垃圾邮件或 ',
          signIn: '登录',
        },
        notifications: {
          codeFailed: '发送验证码失败',
          codeSent: '验证码已发送',
          loginFailed: '登录失败',
          loginSuccess: '登录成功',
          networkCaption: '请检查您的网络',
        },
      },
    },
    ProjectIdInput: {
      errors: {
        projectId: '项目 ID 无效',
      },
      hints: {
        projectId: '请输入项目 ID（NV 号码或 TB 号码）',
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
          model: '型号',
        },
      },
      GeneralCard: {
        labels: {
          developerOptions: '开发者选项',
          displayTheme: '显示主题',
          displayThemeOptions: {
            auto: '自动',
            dark: '暗',
            light: '亮',
          },
          title: '常规',
          transparentFallback: '透明回退（Windows 7）',
          zoomFix: '修复窗口缩放',
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
          title: '检测网络区域...',
        },
      },
      FinishPanel: {
        labels: {
          confirm: '确认',
          title: '您已完成设置！',
          tip: '您可以在这里更改常用设置，或直接开始使用 Comware Coder。',
        },
      },
      ManualPanel: {
        labels: {
          normalArea: '红色',
          publicArea: '黄色/绿色',
          secureArea: '红色路由',
          title: '自动检测网络区域失败，请手动设置',
        },
        notifications: {
          pingError: 'ping 服务器失败，请检查您的网络连接。',
          pingSuccess: '成功 ping 服务器',
        },
        steps: [
          {
            title: '选择网络区域',
            next: '继续',
            previous: '重新检测',
          },
          { title: '设置基本服务器 URL', next: '完成', previous: '返回' },
        ],
      },
    },
  },
  layouts: {
    drawers: {
      LeftMainDrawer: {
        navigations: {
          chat: '聊天',
          commit: '提交',
          feedback: '反馈',
          settings: '设置',
          workflow: '工作流',
          review: '评审',
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
          newTopic: '开始新话题',
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
        changes: '更改的文件',
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
        account: '帐户',
        description: '问题描述',
        images: '相关图片',
        cancel: '取消',
        submit: '提交',
      },
      hints: {
        account: '请输入您的 H3C 帐户（工号）',
      },
      notifications: {
        feedbackSuccess: '反馈已提交',
        feedbackFailed: '反馈失败',
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
        title: '设置新项目',
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
        confirm: '升级',
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
        deployArtifact: '部署工件中...',
        staticCheck: '执行静态检查中...',
      },
      notifications: {
        copyFailure: '复制工作流 ID 失败',
        copySuccess: '工作流 ID 已复制到剪贴板',
      },
    },
    ReviewPage: {
      labels: {
        title: '查看高亮代码',
      },
    },
    CodeSelectedTipsPage: {
      labels: {
        addToChat: '添加到聊天中（Ctrl + L）',
        review: '查看高亮代码（Ctrl + I）',
      },
    },
  },
};
