import React, { createContext, useContext } from 'react';

type Language = 'zh-CN';

type Translations = Record<string, string>;

const translations: Record<Language, Translations> = {
  "zh-CN": {
    nav_home: "首页", nav_stats: "统计", nav_accounts: "账户", nav_profile: "我的",
    total_assets: "总资产", this_month: "本月概览", income: "收入", expense: "支出",
    ai_insight: "AI 财务洞察", ai_loading: "正在分析您的消费习惯...", 
    ai_default: "点击分析您本月的财务健康状况。", ai_button: "生成分析",
    recent_activity: "近期动态", view_all: "查看全部", no_transactions: "暂无记录，快去记一笔吧！",
    uncategorized: "未分类",
    expense_label: "支出", income_label: "收入",
    use_ai: "使用 AI 助手", manual_mode: "切换手动模式",
    ai_desc: "描述您的交易", ai_placeholder: "例如：晚餐吃了汉堡花了25元", 
    ai_analyzing: "分析中...", ai_autofill: "自动填写", ai_error: "AI 无法识别，请重试或手动输入。",
    amount: "金额", category: "分类", account: "账户", date: "日期", note: "备注", optional: "选填", 
    save_button: "保存记录", save_alert_amount: "请输入有效金额", save_alert_category: "请选择分类", save_alert_account: "请选择账户",
    analysis: "收支分析", expense_breakdown: "支出构成", income_vs_expense: "收支对比", top_categories: "高频消费",
    net_worth: "净资产", add_new_account: "添加新账户",
    settings: "设置", language: "语言", profile: "个人中心", theme: "主题", about: "关于",
    currency: "结算币种",
    cat_c1: "餐饮", cat_c2: "交通", cat_c3: "购物", cat_c4: "娱乐", 
    cat_c5: "医疗", cat_c6: "教育", cat_c7: "居住", cat_c8: "账单",
    cat_c9: "工资", cat_c10: "理财", cat_c11: "人情",
    account_name: "账户名称", account_type: "账户类型", initial_balance: "初始余额",
    cancel: "取消", confirm: "确认", 
    delete_confirm: "确认删除该账户吗？关联的交易记录将保留。",
    delete_transaction_confirm: "确定要删除这条记录吗？删除后无法恢复。",
    type_cash: "现金", type_bank: "银行卡", type_credit: "信用卡", 
    type_alipay: "支付宝", type_wechat: "微信支付", type_investment: "投资理财",
    create_account: "创建账户", delete: "删除",
    no_accounts: "暂无账户", no_accounts_desc: "创建一个账户开始管理您的财富。",
    no_accounts_add_prompt: "您需要先创建一个账户才能记账。请前往“账户”页面添加。",
    login: "登录", register: "注册", skip_auth: "跳过并以游客访问", username: "用户名", password: "密码",
    auth_subtitle: "开启您的智慧记账之旅", login_action: "立即登录", register_action: "立即注册",
    auth_error_invalid: "用户名或密码错误", auth_error_exists: "用户名已被占用",
    or: "或", logout: "退出登录", guest_user: "游客用户", login_desc: "登录后可跨设备同步数据",
    login_register_now: "登录 / 注册", theme_light: "浅色", theme_dark: "深色",
    theme_system: "跟随系统"
  }
};

const LanguageContext = createContext<any>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const language: Language = 'zh-CN';

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const getCategoryName = (catId: string, fallbackName: string) => {
    const key = `cat_${catId}`;
    return translations[language][key] || fallbackName;
  };

  // Provide setLanguage as a dummy function to avoid breaking existing components
  const setLanguage = () => {};

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getCategoryName }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
