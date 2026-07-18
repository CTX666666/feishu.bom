# 产品原型运行与验收

## 打开方式

该原型只使用本地 HTML、CSS、JavaScript 和 GSAP。为保证严格内容安全策略正常生效，请通过本地 HTTP 访问，不建议使用 `file://` 直接打开。

Windows PowerShell 进入仓库根目录后运行：

```powershell
py -m http.server 8765 --bind 127.0.0.1
```

浏览器访问：

```text
http://127.0.0.1:8765/04_%E4%BA%A7%E5%93%81%E5%8E%9F%E5%9E%8B/index.html
```

页面使用人工构造模拟数据。所有写操作只进入浏览器模拟账本，不会发送真实飞书消息，也不会修改企业系统。

## 建议演示路径

1. 查看 `BL-1001` 的装箱单4 SET、商业发票4 SET、报关草单3 SET冲突。
2. 点击“模拟延误3天”，验证窗口由18小时变为-54小时且不写回。
3. 点击“开始闭环演示”，生成干预包与飞书AI解释卡片。
4. 载入模拟更正回执，经过安全检查和人工复核后触发规则重算。
5. 提交关闭申请，查看权限、版本、原因、证据和审计编号组成的后端权威回执模拟。
6. 打开“安全与可信”，逐项验证签名错误、过期回调、重复事件、旧版本、无权限角色和不可信文档指令。

## 自动化测试

核心规则不依赖第三方包：

```powershell
node --test .\04_产品原型\tests\prototype-core.test.cjs
```

浏览器冒烟脚本需要本机已有 Playwright。若使用系统 Chrome，可在 PowerShell 中运行：

```powershell
$env:PLAYWRIGHT_CHANNEL='chrome'
$env:PROTOTYPE_URL='http://127.0.0.1:8765/04_%E4%BA%A7%E5%93%81%E5%8E%9F%E5%9E%8B/index.html'
node .\04_产品原型\tests\prototype-smoke.cjs
```

冒烟脚本验证桌面闭环、六类安全分支、控制台错误、外部请求和390×844移动端横向溢出，并生成6张截图。
