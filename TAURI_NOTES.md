# Tauri 配置说明

## 产品名称配置

### 为什么 productName 使用英文？

在 `src-tauri/tauri.conf.json` 中，`productName` 设置为 `"LexiLoop"` 而不是 `"词环 LexiLoop"`，原因如下：

#### Windows 平台限制

Windows 的 WiX Toolset（用于生成 `.msi` 安装包）在处理包含中文字符的产品名称时会出现编码错误：

```
Error failed to bundle project `failed to run light.exe`
```

这是 WiX 3.x 的已知问题，它对非 ASCII 字符的支持不完善。

#### 解决方案

- **productName**: 使用纯英文 `"LexiLoop"`
  - 用于文件名、安装路径、注册表项等
  - 生成的安装包：`LexiLoop_1.0.0_x64_en-US.msi`
  
- **window.title**: 可以使用中文 `"词环 LexiLoop"`
  - 用于应用窗口标题栏显示
  - 用户看到的是中文名称

#### 实际效果

- **安装包文件名**: `LexiLoop_1.0.0_x64_en-US.msi`
- **安装路径**: `C:\Program Files\LexiLoop\`
- **应用窗口标题**: `词环 LexiLoop`
- **开始菜单**: `LexiLoop`

### 其他平台

- **macOS**: 对中文支持良好，但为了保持一致性，也使用英文 productName
- **Linux**: 同样支持中文，但统一使用英文更规范

## 配置示例

```json
{
  "productName": "LexiLoop",  // 纯英文，用于系统级标识
  "app": {
    "windows": [
      {
        "title": "词环 LexiLoop"  // 可以使用中文，用于窗口显示
      }
    ]
  }
}
```

## 相关资源

- [WiX Toolset 中文问题讨论](https://github.com/tauri-apps/tauri/issues/2486)
- [Tauri Bundle 配置文档](https://tauri.app/v1/api/config/#bundleconfig)

## 最佳实践

对于需要支持多语言的应用：

1. **productName**: 使用英文或拼音，确保跨平台兼容
2. **window.title**: 使用本地化字符串，提供良好的用户体验
3. **identifier**: 使用反向域名格式，如 `com.company.app`

## 构建验证

构建成功的标志：

```bash
Finished 2 bundles at:
    G:\...\LexiLoop_1.0.0_x64_en-US.msi
    G:\...\LexiLoop_1.0.0_x64-setup.exe
```

如果看到中文文件名导致的错误，说明配置需要调整。
