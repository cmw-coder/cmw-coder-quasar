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
    ReviewPanels: {
      FunctionPanel: {
        labels: {
          locate: '定位',
          locateTitle: '在目录中定位文件',
          depthTitle: '深度: ${depth}',
          typeTitle: '类型: ${type}',
          referencesTitle: '查找引用代码',
          viewReferenceCode: '查看',
          viewReferenceCodeTitle: '查看引用代码',
          empty: '空',
          referenceLoading: '查找引用代码中...',
          reviewProgressTitle: '评审进度',
          reviewResultTitle: '评审结果',
          reviewStepOne: 'AI 正在评审您的代码',
          reviewStepTwo: '2/3 评审者和编码者正在激烈交锋',
          reviewStepThree: '3/3 AI 正在总结',
          parsedFailed: '解析失败',
          noProblem: '没有问题',
          error: '错误',
          retry: '重试',
          stop: '停止',
          useless: '无用',
          rejectDialogTitle: '拒绝原因',
          rejectDialogConfirm: '提交',
          rejectDialogCancel: '取消',
          helpful: '有帮助',
          referenceViewDialogTitle: '引用代码',
          expand: '展开',
          collapse: '收起',
          queuing: '排队中',
        },
      },
    },
    SettingCards: {
      CompletionCard: {
        labels: {
          title: '代码补全',
          productLine: '产品线',
          model: 'AI 模型',
          completionOnPaste: '粘贴触发补全',
          debounceDelay: '触发消抖延迟',
          interactionUnlockDelay: '交互解锁延迟',
          prefixLineCount: '上下文前缀行数',
          recentFileCount: '最近访问文件数',
          suffixLineCount: '上下文后缀行数',
          rangeHint: '范围：{min} - {max}',
        },
        tooltips: {
          resetToDefault: '重置为默认值',
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
          hideSelectedTipsWindow: '隐藏选中提示窗口',
          hideSelectedTipsWindowNotice:
            '隐藏窗口后，选中提示窗口将不在选中代码后出现，后续操作可直接通过 CTRL + I/L 触发。',
          baseServerUrl: '服务地址',
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
      ProjectIdCard: {
        labels: {
          title: '项目编码',
          btnEdit: '编辑',
          btnDel: '删除',
          delDialogTitle: '删除项目',
          delDialogMessage: '您确定要删除此项目吗？',
          delDialogCancel: '取消',
          delDialogConfirm: '确定',
          editDialogCancel: '取消',
          editDialogConfirm: '确定',
          auto: '自动',
          manual: '手动',
          idInputLabel: '项目 ID',
          idInputHint: '请输入项目 ID（NV 项目流水号或 TB问题单号）',
          idInputError: '项目 ID 无效',
          autoManagedInputLabel: '自动管理 SVN 目录',
          svnManagedLabel: 'SVN 目录: ',
          addSvnDir: '添加 SVN 目录',
          delSvnDir: '删除',
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
          review: '代码评审',
          settings: '应用设置',
          workflow: '工作流程',
        },
      },
      RightReviewHistoryDrawer: {
        labels: {
          title: '选择历史记录',
        },
        tooltips: {},
      },
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
        toolbar: {
          rightDrawer: {
            reviewHistory: '历史记录',
          },
          title: {
            chat: 'AI 对话',
            commit: '代码提交',
            feedback: '问题反馈',
            review: '代码评审',
            settings: '应用设置',
            workflow: '工作流程',
          },
        },
        tooltips: {
          close: '关闭',
          defaultSize: '恢复默认大小',
          minimize: '最小化',
          toggleMaximize: '切换最大化',
          fix: '窗口置顶中',
          unfix: '窗口未置顶',
        },
      },
      ReviewHeader: {
        labels: {
          title: 'Comware Coder',
        },
        toolbar: {
          rightBtn: {
            reviewHistory: '历史记录',
            back: '返回',
          },
          title: {
            chat: 'AI 对话',
            commit: '代码提交',
            feedback: '问题反馈',
            review: '代码评审',
            reviewHistory: '评审历史',
            settings: '应用设置',
            workflow: '工作流程',
          },
        },
        tooltips: {
          close: '关闭',
          defaultSize: '恢复默认大小',
          minimize: '最小化',
          toggleMaximize: '切换最大化',
          fix: '窗口置顶中',
          unfix: '窗口未置顶',
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
    ReviewPage: {
      labels: {
        currentFile: '当前文件：{file}',
        noFile: '未选择文件，请在您的编辑器中打开一个文件',
        reviewFile: '评审当前文件',
        delFileTitle: '删除文件',
        projectReview: '目录评审',
        clear: '清空',
        loading: '加载中...',
      },
      dialog: {
        delReviewItemDialog: {
          title: '提示',
          message: '当前 review 还未结束',
          ok: '停止并删除',
          cancel: '取消',
        },
        delFileDialog: {
          title: '提示',
          message: '当前文件下还存在 review 未结束',
          ok: '全部停止并删除',
          cancel: '取消',
        },
        clearReviewDialog: {
          title: '清空评审任务',
          message: '将清空所有评审任务, 是否继续？',
          ok: '确定',
          cancel: '取消',
        },
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
    SelectionTipsPage: {
      labels: {
        addToChat: '添加到聊天中 (Ctrl + Alt + I)',
        review: '评审选中代码 (Ctrl + Alt + L)',
      },
    },
  },
};
