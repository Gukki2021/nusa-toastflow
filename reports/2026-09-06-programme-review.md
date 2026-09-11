# ToastFlow 检查记录 — 2026-09-06

> 本文件保留的是修改前检查快照。后续已完成 9 月角色导入与生成器修正，请以 [9 月对齐结果](2026-09-06-september-reconciliation.md) 为准。

对照依据：[8 月最终 PDF](https://drive.google.com/file/d/1294QuWv4FKisTMEMMBoBXhDpoShHvrP8/view)。本次重新读取原 PDF、线上 HTML 和 Supabase，并在独立浏览器会话中打开预约表单、执行现有生成逻辑。没有修改线上代码或会员记录。

## 当前可用范围

- Supabase 状态 ACTIVE_HEALTHY；浏览器成功读取 19 条预约，显示 Live shared availability is online。
- 首页默认选中 2026-09-11；预约表单可以打开。
- 本次没有提交新的真实预约，不能把本次检查描述为完整提交测试。此前 8 月 29 日的读写测试记录见本任务历史。
- 线上 index.html、programming-sheet.html 与本地文件逐字一致。
- 当前生成器可以生成页面，但尚不能直接作为 9 月最终发布稿。
- 本地 file:// 页面并非线上站点，读取 JSON 可能受浏览器限制。使用 https://gukki2021.github.io/nusa-toastflow/。

## 与 8 月最终版的差异

| 项目 | 8 月最终版 | 当前生成器 |
|---|---|---|
| SAA / TME / President / speeches 开始 | 7:30 / 7:40 / 7:45 / 7:55 | 一致 |
| 休息 | 8:30，20 分钟 | 8:45，15 分钟 |
| Table Topics | 8:50，20 分钟 | 9:00，15 分钟 |
| Evaluations | 9:10 | 9:15 |
| Ah Counter | 9:25 | 9:30 |
| Language Evaluation | 9:30 | 9:35 |
| Awards / Closing | 9:40 | 9:45 |
| Adjournment | 9:50 | 9:55；导出的日历也写 9:55，首页却写 9:50 |
| Speech / Evaluator | 4 个对应编号 | 配对结构一致；不能因此推定 9 月人选已确认 |
| Project Objectives | 完整段落；Get to the Point 有五条目标 | 使用缩写摘要；Get to the Point 只剩一句 |
| 演讲时长 | 每段演讲标题旁有 4–6 / 5–7 分钟 | 第一页演讲项目旁没有时长 |
| 地点 | 已确认的 SMU 地址、交通与地图 | 9 月 venue 待确认，但地址和第二页地图仍固定为 SMU |
| 会议 SAA | GOH Shu Ching, PM5, EH3 | 9 月未安排时自动套用 ExCo SAA：Sandy GOH, PM3 |
| 来宾标记 | 姓名后 *，并注明 Visiting Toastmasters | 未保留同样的星号和说明；姓名中出现来访 club 名称 |
| 社交链接 | LinkedIn | 侧栏改成 Pathways 链接 |

其他影响更新的逻辑：

1. 生成器没有将 confirmed=false 的预约标成待确认。9 月 Sandy 的预约因此会直接显示为演讲者。
2. 没有本月项目时，生成逻辑会尝试套用历史项目。应使用待补充，不能把上个月完成的项目视为本月项目。
3. Share link 存的是生成当时的快照，页面却标成 live data；后续数据库更新不会自动反映到旧分享链接。手动 Edit text 的改动也没有回写分享数据。
4. Google Sheet 当前仍只提供到 2026-08-14 的会议列，9 月数据不能从那里补齐。

## 数据库当前样子

| 表 | 用途 / 字段 | 当前内容 |
|---|---|---|
| reservations | 日期、角色、姓名、contact、note、status、confirmed | 19 条；contact 不在公开预约视图里 |
| meeting_info | 日期、venue、theme、saa、updated_at | 8 月与 9 月两条；9 月地点为空 |
| member_willingness | 姓名、日期、愿意承担的角色、备注 | 2 条意向记录；不等于预约 |
| app_config | 管理配置 | 包含管理口令；本报告不读取或展示其值 |
| test | 原有表 | 未修改，未用于本次判断 |

另有 public_reservations、public_meeting_info、public_willingness 三个公开视图。

| 会议日期 | 预约数 | VPE 已确认 | 内容 |
|---|---:|---:|---|
| 2026-08-14 | 14 | 14 | 4 演讲、4 评估、TME、SAA、Timer、Table Topics、Ah Counter、Language Evaluator |
| 2026-09-11 | 1 | 0 | Sandy：Prepared Speech 1，项目空白 |
| 2026-10-09 | 1 | 0 | Sandy：Prepared Speech 1，项目空白 |
| 2026-11-13 | 2 | 0 | Sandy：Prepared Speech 1；Jonta Koga：Prepared Speech 2，项目均空白 |
| 2026-12-11 | 1 | 0 | Sandy：Prepared Speech 1，项目空白 |

注意：status='confirmed' 在现有系统中表示有效占位；confirmed=false 表示 VPE 尚未确认。它们不是同一个状态，输出时必须区分。

会员名册、资历、Pathways 项目目标仍来自仓库 JSON；议程时间、ExCo、地图与二维码仍在代码或图片里。数据库本身还没有完整保存一份 program sheet。

## 9 月 11 日可审阅草案

时间框架建议沿用 8 月最终版：19:30 开始、20:30 休息、20:50 Table Topics、21:10 Evaluations、21:50 结束。本月是否调整仍以实际安排为准。

- 演讲 1：Sandy（原始预约名；待 VPE 确认）；Pathway / project / title / 时长：待补充。
- 演讲 2–4：开放。
- Evaluator 1–4：待安排，按演讲编号配对。
- SAA、TME、Timer、Table Topics Master、Ah Counter、Language Evaluator：待安排。
- President opening / closing：模板使用 WEE Gee Shing，本月出席待确认。
- 地点、地址、交通：待确认；不能从 8 月直接推定。
- 投票码 / 二维码：需要本月有效性确认。
- Project Objectives：在本月演讲项目确定后按项目填入全文。

这是一份基于现有记录的准备清单，不是已确认的最终 program sheet。
