# 📦 发布新版本指南

## 快速发布

### Windows (PowerShell)

```powershell
.\scripts\release.ps1 -Version "1.0.0"
```

### macOS / Linux (Bash)

```bash
chmod +x scripts/release.sh
./scripts/release.sh 1.0.0
```

## 手动发布步骤

如果不使用自动脚本，可以按以下步骤手动发布：

### 1. 更新版本号

编辑以下文件中的版本号：

- `package.json` → `"version": "1.0.0"`
- `src-tauri/tauri.conf.json` → `"version": "1.0.0"`

### 2. 更新 CHANGELOG.md

在 `CHANGELOG.md` 中添加新版本的更新内容。

### 3. 提交更改

```bash
git add .
git commit -m "chore: bump version to 1.0.0"
```

### 4. 创建并推送 tag

```bash
# 创建 tag
git tag -a v1.0.0 -m "Release v1.0.0"

# 推送代码和 tag
git push origin main
git push origin v1.0.0
```

### 5. 等待自动构建

推送 tag 后，GitHub Actions 会自动：

1. 在 Windows、macOS、Linux 上构建应用
2. 创建 GitHub Release
3. 上传所有平台的安装包

构建时间约 15-30 分钟。

## 查看构建状态

- **Actions 页面**: <https://github.com/yezihack/lexiloop/actions>
- **Releases 页面**: <https://github.com/yezihack/lexiloop/releases>

## 构建产物

每个 Release 会包含以下文件：

### Windows
- `词环-LexiLoop_1.0.0_x64_en-US.msi` - MSI 安装包
- `词环-LexiLoop_1.0.0_x64-setup.exe` - NSIS 安装包

### macOS
- `词环-LexiLoop_aarch64.dmg` - Apple Silicon (M1/M2/M3)
- `词环-LexiLoop_x64.dmg` - Intel 芯片

### Linux
- `lexiloop_1.0.0_amd64.deb` - Debian/Ubuntu
- `lexiloop_1.0.0_amd64.AppImage` - 通用 AppImage

## 版本号规范

遵循语义化版本 (Semantic Versioning)：

- **主版本号** (Major): 不兼容的 API 修改
- **次版本号** (Minor): 向下兼容的功能性新增
- **修订号** (Patch): 向下兼容的问题修正

示例：
- `1.0.0` → 首个正式版本
- `1.1.0` → 新增功能
- `1.1.1` → 修复 bug
- `2.0.0` → 重大更新

## 预发布版本

如需发布测试版本：

```bash
# Beta 版本
git tag -a v1.0.0-beta.1 -m "Beta release"
git push origin v1.0.0-beta.1

# RC (Release Candidate) 版本
git tag -a v1.0.0-rc.1 -m "Release candidate"
git push origin v1.0.0-rc.1
```

## 回滚版本

如果发现问题需要回滚：

```bash
# 删除本地 tag
git tag -d v1.0.0

# 删除远程 tag
git push origin :refs/tags/v1.0.0

# 在 GitHub 上手动删除 Release
```

## 常见问题

### Q: 构建失败怎么办？

A: 查看 Actions 页面的错误日志，常见原因：
- 版本号格式错误
- 依赖安装失败
- 代码编译错误

### Q: 如何修改 Release 说明？

A: 在 GitHub Release 页面点击 "Edit release" 编辑。

### Q: 能否只构建特定平台？

A: 可以修改 `.github/workflows/tauri-release.yml` 中的 `matrix` 配置。

### Q: 如何添加代码签名？

A: 需要配置以下 GitHub Secrets：
- Windows: `WINDOWS_CERTIFICATE`, `WINDOWS_CERTIFICATE_PASSWORD`
- macOS: `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_ID`, `APPLE_PASSWORD`

## 相关文档

- [Tauri 打包指南](./TAURI_GUIDE.md)
- [更新日志](./CHANGELOG.md)
- [项目 README](./README.md)
