# ToastFlow 执委会云端协作与网站维护指南 (ExCo Collaboration Guide)

本指南专门为 NUS Alumni Toastmasters 执委会（Club President, VPE, VPM, VPPR 等）整理，详细解答网站日常管理、多执委协同编辑、俱乐部公共 Google Account 绑定、以及通过 Elaine / Google AI Studio 进行智能化维护的完整落地操作方案。

---

## 目录
1. [系统总体协同架构](#1-系统总体协同架构)
2. [方案一：日常排期与人员变动（零代码，实时生效）](#2-方案一日常排期与人员变动零代码实时生效)
3. [方案二：Google Account 与 Google Sheets 同步比对](#3-方案二google-account-与-google-sheets-同步比对)
4. [方案三：代码托管与多执委共同编辑（GitHub 协同）](#4-方案三代码托管与多执委共同编辑github-协同)
5. [方案四：使用 Elaine 或 Google AI Studio 在线智能化维护](#5-方案四使用-elaine-或-google-ai-studio-在线智能化维护)

---

## 1. 系统总体协同架构

ToastFlow 采用轻量化、高可靠的无服务器（Serverless）架构，将**日常业务数据**与**网页源码托管**清晰解耦：

```mermaid
graph TD
    subgraph "日常排期与角色管理 (业务端)"
        M[普通会员 / 嘉宾] -->|预约 Slot (免密码)| WEB[ToastFlow Web 界面]
        EXCO[主席 / VPE / 各执委] -->|登录 Admin 密码| WEB
        WEB <-->|实时读写数据| SUPA[(Supabase Cloud 云端数据库)]
        WEB <-->|数据核对与标红| GS[(Google Sheets: Meeting Appointment Holders)]
    end

    subgraph "网页模板与功能迭代 (代码端)"
        OWNER[仓库所有者] -->|推送代码| GH[GitHub 仓库: Gukki2021/nusa-toastflow]
        PRES[俱乐部主席 / 执委] -->|被邀请为 Collaborator 在线编辑| GH
        AI[Elaine / Google AI Studio] -->|自然语言指令生成代码并提交| GH
        GH -->|GitHub Actions 自动构建 (1-2分钟)| LIVE[GitHub Pages 部署上线]
    end
```

---

## 2. 方案一：日常排期与人员变动（零代码，实时生效）

**适用对象**：俱乐部主席、副会长（VPE、VPM、VPPR）及各角色协调人。  
**技术底座**：Supabase Cloud PostgreSQL 云端数据库。

### 如何协同操作：
1. **统一管理入口**：
   - 访问网站首页：[https://gukki2021.github.io/nusa-toastflow/index.html](https://gukki2021.github.io/nusa-toastflow/index.html)
   - 点击右上角 **Admin** 按钮，输入管理员密码即可登录。
2. **多端协同编辑**：
   - 主席与各位执委可以在各自的电脑、平板或手机浏览器中同时登录 Admin；
   - 可以在下拉菜单中为任意角色指派会员、标记状态（Confirmed 确认 / Tentative 待定）、调整备稿演讲项目或标题；
   - **弹性备稿槽位**：如果某场会议只有 3 位演讲者，可在后台直接选择 3 个 Speech Slots；若有 4 位则选 4 个，页面与节目单自动动态适应；
   - 任何一位执委的修改，都会秒级保存至 Supabase 云端，其他执委刷新页面即可看到最新状态。
3. **绑定俱乐部官方 Google 账号**：
   - 登录 [Supabase 控制台](https://supabase.com/dashboard)；
   - 进入当前项目 `bizrpwkpcrzywihbecjb` 的 `Project Settings` → `Members`；
   - 点击 **Invite**，输入俱乐部公共 Google 邮箱（如 `nusatm@gmail.com`），授予 Administrator 或 Developer 角色，俱乐部官方账号即可随时接管与监管云端数据库。

---

## 3. 方案二：Google Account 与 Google Sheets 同步比对

**适用对象**：习惯使用 Google 电子表格进行年度统筹与会议排期的执委会。

### 运作机制：
1. **权威数据比对**：
   - 俱乐部共享的 Google 表格：`Meeting Appointment Holders`；
   - 网站后台内置了 Google Sheets 智能比对引擎；
2. **差异实时标红提示**：
   - 当会员在网站上预约了某个角色，但与 Google Sheet 上的登记名单不一致时，网站 Admin 面板会自动标红高亮，并显示 `Sheet has: <人名>`；
   - 支持以“最新更新日期”为准进行一键同步，保证线上报名与线下表格数据绝不冲突。

---

## 4. 方案三：代码托管与多执委共同编辑（GitHub 协同）

**适用对象**：主席或执委需要修改网页前端文案、调整模板样式、上传新高清图片时。  
**技术底座**：GitHub Pages 自动部署。

### 如何为主席开通协作权限（3 步完成）：
1. **添加协作者 (Add Collaborator)**：
   - 仓库所有者登录 GitHub，进入仓库主页：[https://github.com/Gukki2021/nusa-toastflow](https://github.com/Gukki2021/nusa-toastflow)；
   - 点击右上角 **Settings** → 左侧菜单 **Collaborators**；
   - 点击绿色按钮 **Add people**，输入主席的个人 GitHub 账号，或俱乐部公共 GitHub 绑定的 Google 邮箱，点击发送邀请。
2. **主席接受邀请并在线编辑**：
   - 主席查收邮件并接受邀请后，拥有该仓库的直接推送（Write）权限；
   - 主席**无需下载任何本地开发环境**，直接在浏览器中打开对应文件（如 `index.html` 或 `programming-sheet.html`），点击右上角的 ✏️（Edit this file）按钮；
   - 修改文案后，直接在页面底部点击 **Commit changes**。
3. **自动发布生效**：
   - 代码一旦 Commit 到 `main` 分支，GitHub Actions 会在 **60–90 秒内自动重新编译并发布到 GitHub Pages**；
   - 刷新线上网址即可看到最新效果。

---

## 5. 方案四：使用 Elaine 或 Google AI Studio 在线智能化维护

针对您提出的利用 **Elaine（智能 AI 助手）** 或 **Google AI Studio** 进行协作维护，以下是具体实践方式：

### 5.1 使用 Elaine / Antigravity Agentic 协作
* **工作方式**：
  - 如果主席或执委也在使用 Elaine，只需将同一个 GitHub 仓库 `Gukki2021/nusa-toastflow` 导入到其工作区；
  - 执委只需用自然语言对 Elaine 说出需求，例如：
    > “*请把 11 月例会的地点更新为 Classroom 2.2，地址改为 90 Stamford Rd.*”  
    > “*请在 Program Sheet 执委会列表中更新 VPPR 的姓名.*”
  - Elaine 会自动定位代码、修改文件、执行验证测试，并直接 `git push` 到 GitHub 仓库，全自动上线。

### 5.2 使用 Google AI Studio (Club Google Account) 维护
* **工作方式**：
  - 使用俱乐部的官方 Google 账号直接登录 [Google AI Studio (aistudio.google.com)](https://aistudio.google.com/)；
  - **创建俱乐部专属 System Prompt**：
    在 AI Studio 中创建一个专用的 ToastFlow Assistant Prompt，录入以下上下文资产：
    ```text
    Role: NUSA Toastmasters ToastFlow Technical Assistant
    Repository: https://github.com/Gukki2021/nusa-toastflow
    Stack: Plain HTML5, Modern CSS, Vanilla JS, Supabase Cloud (PostgreSQL), GitHub Pages
    Key Files:
    - index.html: Main member planner, booking modal, and ExCo admin console
    - programming-sheet.html: Faithful replica of Word/PDF meeting program sheet
    - reference.html: Pathways 5 levels, member booking guide, and official resources
    - scripts/people.js: Club member roster and credentials
    - scripts/meeting-programmes.js: Monthly meeting dates, venues, and guest list
    Rules: Keep vanilla JS without heavy dependencies. Ensure print styles fit exactly 2 pages A4.
    ```
  - 当执委需要任何新功能或排版调整时，直接在 AI Studio 中向 Gemini 提问，Gemini 会给出精准的修改代码片段；
  - 执委复制并在 GitHub 网页端点击保存即可。

---

## 总结：推荐协作分工

| 事项 | 推荐使用工具 | 谁来操作 | 是否需要懂代码 |
| :--- | :--- | :--- | :--- |
| **日常会议排期、角色分配、发布 Program Sheet** | 网站自带 `Admin` 界面 | 主席、VPE、各执委 | ❌ 零代码，手机即开即用 |
| **会员大名单与 Google 表格登记核对** | Google Sheets + ToastFlow 自动比对 | 秘书、VPE、主席 | ❌ 零代码，表格实时协同 |
| **网页文案小改动、图片替换** | GitHub Web 网页端点击 ✏️ 编辑 | 主席 (已添加 Collaborator) | ❌ 仅需文字编辑与 Commit |
| **新增复杂功能、大版本重构** | Elaine / Google AI Studio | 仓库所有者、技术执委 | 🤖 AI 全自动修改并测试推流 |
