#!/bin/bash

# 词环 LexiLoop 发布脚本
# 用法: ./scripts/release.sh <version>
# 示例: ./scripts/release.sh 1.0.0

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "❌ 错误: 请提供版本号"
  echo "用法: ./scripts/release.sh <version>"
  echo "示例: ./scripts/release.sh 1.0.0"
  exit 1
fi

echo "🚀 开始发布版本 v$VERSION"

# 检查工作区是否干净
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ 错误: 工作区有未提交的更改，请先提交或暂存"
  git status --short
  exit 1
fi

# 更新 package.json 版本
echo "📝 更新 package.json 版本..."
npm version $VERSION --no-git-tag-version

# 更新 tauri.conf.json 版本
echo "📝 更新 tauri.conf.json 版本..."
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" src-tauri/tauri.conf.json
rm -f src-tauri/tauri.conf.json.bak

# 提交更改
echo "💾 提交版本更新..."
git add package.json package-lock.json src-tauri/tauri.conf.json
git commit -m "chore: bump version to $VERSION"

# 创建 tag
echo "🏷️  创建 tag v$VERSION..."
git tag -a "v$VERSION" -m "Release v$VERSION"

# 推送到远程
echo "📤 推送到远程仓库..."
git push origin main
git push origin "v$VERSION"

echo "✅ 发布完成！"
echo ""
echo "📦 GitHub Actions 将自动构建以下平台的安装包："
echo "   - Windows (x64)"
echo "   - macOS (Apple Silicon + Intel)"
echo "   - Linux (x64)"
echo ""
echo "🔗 查看构建进度: https://github.com/yezihack/lexiloop/actions"
echo "🔗 查看 Release: https://github.com/yezihack/lexiloop/releases/tag/v$VERSION"
